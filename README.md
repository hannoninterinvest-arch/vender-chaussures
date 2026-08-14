# KICKS — boutique sneakers (sans compte)

Storefront inspiré de [kicks-navy.vercel.app](https://kicks-navy.vercel.app/), adapté à la Tunisie :

- **Aucun login / aucun compte**
- Panier persisté en local
- Checkout invité (nom, téléphone, adresse)
- Paiement à la livraison, Flouci et D17 (démo)
- Frais de livraison selon le gouvernorat

## Lancer

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
| --- | --- |
| `/` | Accueil (hero DO IT RIGHT, drops, catégories, avis) |
| `/shop` | Catalogue + filtres |
| `/products/[id]` | Fiche produit, pointure, couleur |
| `/cart` | Panier |
| `/checkout` | Commande sans compte |
| `/commande/[id]` | Confirmation (stockée sur l’appareil) |
