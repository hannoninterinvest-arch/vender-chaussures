# KICKS — boutique sneakers (front Next.js + API NestJS)

Storefront inspiré de [kicks-navy.vercel.app](https://kicks-navy.vercel.app/), **sans login**.

- Front : Next.js (catalogue, panier, checkout invité)
- Back : NestJS + TypeORM + PostgreSQL (Neon)
- Commandes et produits en base
- Paiement : à la livraison, Flouci, D17
- Photos produit : jusqu’à 5 images via Cloudinary, URL en PostgreSQL
- Espace vendeur : produits, catégories, livraisons, bénéfices

## Lancer

1. Copie `backend/.env.example` vers `backend/.env` et renseigne `DATABASE_URL` (Neon) + Cloudinary.
2. Copie `.env.example` vers `.env.local` (URL de l’API).

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
