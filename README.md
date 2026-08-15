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

| Variable | Valeur |
| --- | --- |
| `DATABASE_URL` | URL Neon (`sslmode=require`, sans `channel_binding=require`) |
| `FRONTEND_URL` | `http://localhost:3000` (puis l’URL Vercel du front, plusieurs origines séparées par une virgule) |
| `SELLER_KEY` | la même clé que en local (ex. `kicks-vendeur`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | compte Cloudinary |

Render définit `PORT` tout seul. L’API écoute `0.0.0.0`.

4. Après le premier deploy, ouvre `https://TON-SERVICE.onrender.com/api/health` → `{"ok":true,"service":"kicks-api"}`.
5. En local, pointe le front vers Render :

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://TON-SERVICE.onrender.com/api
```

Puis `npm run dev` (front seulement). Les commandes et le catalogue passent par l’API Render + Neon.

Tu peux aussi importer le Blueprint `render.yaml` (New → Blueprint) : il cible déjà `rootDir: backend`.
