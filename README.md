# KICKS — boutique sneakers (front Next.js + API NestJS)

Storefront inspiré de [kicks-navy.vercel.app](https://kicks-navy.vercel.app/), **sans login**.

- Front : Next.js (catalogue, panier, checkout invité)
- Back : NestJS + TypeORM + PostgreSQL (Neon)
- Commandes et produits en base
- Paiement à la livraison (COD)

## Lancer

1. Copie `backend/.env.example` vers `backend/.env` et renseigne `DATABASE_URL` (Neon).
2. Copie `.env.example` vers `.env.local` (URL de l’API).

```bash
# terminal 1 — API Nest (port 3001)
npm run dev:api

# terminal 2 — front Next (port 3000)
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## API

| Méthode | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Santé |
| GET | `/api/products` | Catalogue |
| GET | `/api/products/:id` | Produit |
| POST | `/api/orders` | Créer une commande invité |
| GET | `/api/orders/:id` | Détail commande |

Les tables sont créées au démarrage (`synchronize: true`) et le catalogue est seedé s’il est vide.
