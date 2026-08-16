# ELVARO by AIR GO SHOES — boutique chaussures (front Next.js + API NestJS)

- Front : https://github.com/hannoninterinvest-arch/vender-chaussures
- Back : https://github.com/hannoninterinvest-arch/ventechaussureBack

Boutique **ELVARO** (noir, crème, or) — commande **sans compte**.

- Front : Next.js (catalogue, panier, checkout invité)
- Back : NestJS + TypeORM + PostgreSQL (Neon)
- Commandes et produits en base
- Paiement : **en ligne (Konnect)** ou **à la livraison**
- Photos produit : jusqu’à 5 images via Cloudinary, URL en PostgreSQL
- Page d’accueil : l’admin choisit les photos de garde (pas d’images statiques)
- Espace vendeur : produits, vitrine, catégories, livraisons, bénéfices

## Lancer

1. Copie `backend/.env.example` vers `backend/.env` et renseigne `DATABASE_URL` (Neon) + Cloudinary + **Konnect**.
2. Copie `.env.example` vers `.env.local` (front Next.js — URL de l’API).

```bash
# terminal 1 — API Nest (port 3001)
npm run dev:api

# terminal 2 — front Next (port 3000)
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Espace équipe : [http://localhost:3000/vendeur](http://localhost:3000/vendeur)

### Premier admin

Si la table `users` est vide, `/vendeur` affiche **Créer le premier admin** (nom, e-mail, mot de passe).  
Sinon connecte-toi. En local, un seed peut déjà avoir créé :

- Admin : `admin@kicks.tn` / `KicksAdmin123`
- Vendeur : `vendeur@kicks.tn` / `Vendeur123`

### Vendeurs

Connecté en **admin** → onglet **Équipe** → créer un compte rôle `vendeur`.

### Import CSV

Onglet **Import CSV** : fichier `.csv` avec les liens photos (`https://…|https://…`, max 5). Télécharge le modèle depuis la page.

## API

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Santé |
| GET | `/api/products` | Catalogue |
| GET | `/api/products/:id` | Produit |
| GET | `/api/categories` | Catégories boutique |
| POST | `/api/orders` | Créer une commande invité (`cod` ou `online`) |
| POST | `/api/orders/:id/pay` | Relancer le paiement Konnect |
| GET | `/api/orders/:id` | Détail commande (synchronise Konnect si besoin) |
| GET | `/api/payments/config` | `{ online: true }` si Konnect est configuré |
| GET | `/api/payments/konnect/webhook` | Webhook Konnect (`payment_ref`) |
| GET | `/api/site` | Textes + photos de la page d’accueil |
| GET | `/api/auth/setup` | `needed: true` s’il n’y a encore aucun admin |
| POST | `/api/auth/setup` | Créer le premier administrateur |
| POST | `/api/auth/login` | Connexion e-mail + mot de passe |
| GET | `/api/auth/me` | Session staff (JWT) |
| GET/POST/PATCH/DELETE | `/api/staff` | Comptes admin/vendeur (admin seulement) |
| GET/POST/PATCH/DELETE | `/api/seller/products` | CRUD produits (JWT) |
| POST | `/api/seller/products/import` | Import CSV (liste de produits + liens photos) |
| GET/POST/DELETE | `/api/seller/categories` | Catégories (clé requise) |
| GET/PATCH | `/api/seller/site` | Photos et textes de la page d’accueil |
| GET/PATCH | `/api/seller/orders` | Commandes + statut livraison |
| POST | `/api/seller/uploads` | Upload image Cloudinary (clé requise) |
| GET | `/api/seller/stats` | Bénéfices et meilleur produit |

Les tables sont créées au démarrage (`synchronize: true`) et le catalogue est seedé s’il est vide.

## Héberger tout l’app (front + back)

**Vercel n’exécute pas un Dockerfile.** Un conteneur Docker ne tourne pas sur Vercel. Deux chemins possibles :

### A — Tout sur Vercel (recommandé pour le front, possible pour le back)

Deux **projets** Vercel, **le même** dépôt GitHub `vender-chaussures` :

| Projet | Root Directory | Framework | Rôle |
| --- | --- | --- | --- |
| boutique (front) | `.` (racine) | Next.js | site, panier, `/vendeur` |
| api (back) | `backend` | NestJS | `/api`, Neon, Cloudinary |

1. [vercel.com/new](https://vercel.com/new) → importe `vender-chaussures`.
2. **Projet 1 (front)** : Root Directory vide / `.` → Deploy. Variable :
   - `NEXT_PUBLIC_API_URL` = `https://TON-API.vercel.app/api` (tu la mets après le projet 2).
3. **Add New Project** → **le même repo**.
4. **Projet 2 (back)** : Root Directory = `backend`. Variables : `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL=https://TON-FRONT.vercel.app`, `BACKEND_PUBLIC_URL=https://TON-API.vercel.app`, Cloudinary, Konnect.
5. Test : `https://TON-API.vercel.app/api/health`
6. Retour au projet front → mets `NEXT_PUBLIC_API_URL` → Redeploy.

Sur Vercel l’API est une **fonction** (pas un serveur 24/7). Les photos trop lourdes (> ~4,5 Mo) peuvent échouer. Pour un shop, ça suffit souvent.

### B — Docker (PC ou Render, pas Vercel)

Fichiers : `backend/Dockerfile` + `docker-compose.yml` (API seulement).

```bash
cp backend/.env.example backend/.env   # DATABASE_URL + Cloudinary
docker compose up --build
```

API : `http://localhost:3001/api/health`

Sur Render tu peux aussi choisir **Docker** au lieu de Node, avec Dockerfile Path = `backend/Dockerfile`.

Le front Next.js, lui, va sur Vercel (option A, projet 1), pas dans Docker.

## Déployer uniquement le back sur Render

Oui : le front Next.js reste en local (ou plus tard sur Vercel). Render ne lance que le dossier `backend/`.

1. [Render](https://dashboard.render.com) → **New** → **Web Service** → connecte le dépôt GitHub `vender-chaussures`.
2. Réglages :
   - **Root Directory** : `backend`
   - **Runtime** : Node
   - **Build Command** : `npm ci --include=dev && npm run build`
   - **Start Command** : `npm run start:prod`
3. Variables d’environnement (Environment) :

Sur Render : **Environment** → **Add Environment Variable**, une ligne par nom ci-dessous (ne commite jamais ces valeurs).

### `DATABASE_URL` (Neon)

1. Compte gratuit : [neon.tech](https://neon.tech) → **Create project** (région proche, Postgres).
2. **Dashboard** → **Connect** → copie la connection string (URI).
3. Colle-la telle quelle. Si tu vois `channel_binding=require`, tu peux le laisser : l’API le retire au démarrage.
4. Forme attendue : `postgresql://USER:PASSWORD@HOST/neondb?sslmode=require`

C’est la **même** base que `backend/.env` en local. Une seule Neon pour local + Render.

### `FRONTEND_URL` (CORS)

Par défaut l’API autorise **toutes** les origines (`*`) : front local, Render, Vercel.

Sur Render tu peux mettre `FRONTEND_URL=*` (ou omettre la variable). Pour restreindre plus tard : `https://ton-front.vercel.app`.

### `JWT_SECRET` / comptes staff

Plus de clé unique. L’équipe se connecte avec **e-mail + mot de passe**.

- `JWT_SECRET` : phrase longue aléatoire (Render peut la générer)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` : premier admin, **uniquement** si la table `users` est encore vide
- `VENDEUR_EMAIL` / `VENDEUR_PASSWORD` : premier vendeur (optionnel)

Ensuite l’admin crée d’autres comptes dans `/vendeur/equipe`.

- **Admin** : tout + équipe + suppression catalogue
- **Vendeur** : commandes, produits (sans supprimer), catégories en lecture

### Cloudinary (photos produit)

Sans ces 3 variables, le catalogue marche, mais l’upload d’images dans `/vendeur` renvoie 503.

1. Compte gratuit : [cloudinary.com](https://cloudinary.com/users/register/free)
2. Une fois connecté, le **Dashboard** affiche **API Keys** (ou **Settings** → **API Keys**) :
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME` (ex. `demo`)
   - **API Key** → `CLOUDINARY_API_KEY` (chiffres)
   - **API Secret** → **Reveal** → `CLOUDINARY_API_SECRET` (ne le publie jamais)
3. Colle les 3 sur Render, **exactement** ces noms de variables.

Les photos vont dans le dossier Cloudinary `kicks/products` ; l’URL HTTPS est stockée en Postgres.

### Konnect (paiement en ligne)

Sans `KONNECT_API_KEY` et `KONNECT_WALLET_ID`, le checkout ne propose que **à la livraison**.

1. Crée un compte : [dashboard.sandbox.konnect.network](https://dashboard.sandbox.konnect.network) (test) ou [dashboard.konnect.network](https://dashboard.konnect.network) (prod).
2. Copie **API Key** (`walletId:secret`) → `KONNECT_API_KEY`
3. Copie **Wallet ID** → `KONNECT_WALLET_ID`
4. `KONNECT_SANDBOX=true` en test, `false` en production
5. `BACKEND_PUBLIC_URL` = URL publique de l’API (ex. `https://vender-chaussures.onrender.com`)
6. `FRONTEND_URL` = URL publique de la boutique (redirection après paiement), pas `*`

Le client choisit **en ligne** (carte, e-DINAR/D17, wallet, Flouci via Konnect) ou **à la livraison**.

Render définit `PORT` tout seul. L’API écoute `0.0.0.0`.

4. Après le premier deploy, ouvre `https://TON-SERVICE.onrender.com/api/health` → `{"ok":true,"service":"kicks-api"}`.
5. Front local → API Render : dans `.env.local` (déjà dans `.env.example`) :

```bash
NEXT_PUBLIC_API_URL=https://vender-chaussures.onrender.com/api
```

L’URL **doit** finir par `/api`. Sans ça, le login appelle `/auth/login` et Render répond 404. Puis `npm run dev` (front seulement).

Tu peux aussi importer le Blueprint `render.yaml` (New → Blueprint) : il cible déjà `rootDir: backend`.
