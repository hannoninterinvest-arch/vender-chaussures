# KICKS — boutique sneakers (front Next.js + API NestJS)

- Front : https://github.com/hannoninterinvest-arch/vender-chaussures
- Back : https://github.com/hannoninterinvest-arch/ventechaussureBack

Storefront inspiré de [kicks-navy.vercel.app](https://kicks-navy.vercel.app/), **sans login**.

- Front : Next.js (catalogue, panier, checkout invité)
- Back : NestJS + TypeORM + PostgreSQL (Neon)
- Commandes et produits en base
- Paiement : à la livraison, Flouci, D17
- Photos produit : jusqu’à 5 images via Cloudinary, URL en PostgreSQL
- Espace vendeur : produits, catégories, livraisons, bénéfices

## Lancer

1. Copie `backend/.env.example` vers `backend/.env` et renseigne `DATABASE_URL` (Neon) + Cloudinary.
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
Comptes locaux (table `users` vide au 1er lancement) :

- Admin : `admin@kicks.tn` / `KicksAdmin123`
- Vendeur : `vendeur@kicks.tn` / `Vendeur123`

## API

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Santé |
| GET | `/api/products` | Catalogue |
| GET | `/api/products/:id` | Produit |
| GET | `/api/categories` | Catégories boutique |
| POST | `/api/orders` | Créer une commande invité |
| GET | `/api/orders/:id` | Détail commande |
| POST | `/api/auth/login` | Connexion e-mail + mot de passe |
| GET | `/api/auth/me` | Session staff (JWT) |
| GET/POST/PATCH/DELETE | `/api/staff` | Comptes admin/vendeur (admin seulement) |
| GET/POST/PATCH/DELETE | `/api/seller/products` | CRUD produits (clé requise) |
| GET/POST/DELETE | `/api/seller/categories` | Catégories (clé requise) |
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
4. **Projet 2 (back)** : Root Directory = `backend`. Variables : `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL=*`, Cloudinary.
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

Render définit `PORT` tout seul. L’API écoute `0.0.0.0`.

4. Après le premier deploy, ouvre `https://TON-SERVICE.onrender.com/api/health` → `{"ok":true,"service":"kicks-api"}`.
5. Front local → API Render : dans `.env.local` (déjà dans `.env.example`) :

```bash
NEXT_PUBLIC_API_URL=https://vender-chaussures-api.onrender.com/api
```

Remplace l’hôte par l’URL exacte de ton service Render si elle diffère. Puis `npm run dev` (front seulement).

Tu peux aussi importer le Blueprint `render.yaml` (New → Blueprint) : il cible déjà `rootDir: backend`.
