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

Espace vendeur : [http://localhost:3000/vendeur](http://localhost:3000/vendeur)  
Clé par défaut (`SELLER_KEY` dans `backend/.env`) : `kicks-vendeur`

## API

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Santé |
| GET | `/api/products` | Catalogue |
| GET | `/api/products/:id` | Produit |
| GET | `/api/categories` | Catégories boutique |
| POST | `/api/orders` | Créer une commande invité |
| GET | `/api/orders/:id` | Détail commande |
| POST | `/api/seller/session` | Vérifier la clé vendeur |
| GET/POST/PATCH/DELETE | `/api/seller/products` | CRUD produits (clé requise) |
| GET/POST/DELETE | `/api/seller/categories` | Catégories (clé requise) |
| GET/PATCH | `/api/seller/orders` | Commandes + statut livraison |
| POST | `/api/seller/uploads` | Upload image Cloudinary (clé requise) |
| GET | `/api/seller/stats` | Bénéfices et meilleur produit |

Les tables sont créées au démarrage (`synchronize: true`) et le catalogue est seedé s’il est vide.

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

### `SELLER_KEY`

Ce n’est **pas** un compte Cloudinary/Neon. C’est le mot de passe de `/vendeur`.

Choisis une phrase secrète (ou garde `kicks-vendeur` pour tester) et mets **la même** dans `backend/.env` (local) et sur Render. Tu la tapes dans l’espace vendeur.

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
