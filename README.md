# ELVARO by AIR GO SHOES — Next.js + PostgreSQL

La boutique, l'espace vendeur/administrateur et toutes les API sont dans **une seule application Next.js**, déployable sur Vercel. Aucun service NestJS ni Render n'est nécessaire. PostgreSQL conserve les produits, commandes, tarifs de livraison, demandes de gros, réglages et comptes. Les fichiers sont stockés chez Cloudinary.

## Développement

```bash
npm ci
cp .env.example .env.local
# Renseigner DATABASE_URL, APP_URL et JWT_SECRET dans .env.local.
npm run dev
```

Les API sont accessibles sous `/api` sur le même domaine que la boutique. Ne plus utiliser `NEXT_PUBLIC_API_URL`, `FRONTEND_URL` ou `BACKEND_PUBLIC_URL`.

## Déploiement Vercel

1. Importer `hannoninterinvest-arch/vender-chaussures`, branche `main`.
2. Framework **Next.js**, Root Directory **racine du dépôt** (laisser vide), installation `npm ci`, build `npm run build`.
3. Ajouter les variables de `.env.example` dans **Settings → Environment Variables**. Les variables indispensables sont `DATABASE_URL` (URL PostgreSQL poolée Neon), `JWT_SECRET` et `APP_URL` (URL HTTPS publique de la boutique, sans `/api`).
4. Ajouter les trois clés Cloudinary et les deux noms de presets pour les médias. Ajouter les deux clés Flouci pour activer Flouci. Konnect est facultatif.
5. Déployer. Les appels API restent sur le domaine du site. Les URL de retour et webhooks de paiement sont construits avec `APP_URL`.

### Base existante

Utiliser **la même DATABASE_URL** que le backend précédent : les noms de tables/colonnes, relations et hachages bcrypt sont conservés. Il n'y a aucune synchronisation automatique du schéma à chaque requête, ni création de compte ou suppression de produits au démarrage. Les données existantes restent dans PostgreSQL. Garder le même `JWT_SECRET` pour conserver les sessions existantes.

### Base neuve / initialisation explicite

Depuis le dépôt local, renseigner les variables privées dans `.env.local`, dont `ADMIN_EMAIL` et un `ADMIN_PASSWORD` fort, puis :

```bash
npm run db:init
```

Cette commande initialise le schéma et les catégories, les tarifs manquants et la vitrine. Le premier administrateur est créé uniquement si la table des comptes est vide. Ne pas mettre cette commande dans le build Vercel. La création publique du premier administrateur est désactivée en production. Les mots de passe de démonstration n'existent qu'en développement local.

### Photos et modèles GLB

Les fichiers sont envoyés **directement du navigateur vers Cloudinary**, avec une signature délivrée après authentification. Cela évite la limite de 4,5 Mo des requêtes Vercel et permet de conserver les limites existantes : images 6 Mo, GLB 20 Mo.

Créer les deux presets signés une fois avec les clés Cloudinary renseignées :

```bash
npm run cloudinary:init
```

Cette commande configure `kicks_images_signed` et `kicks_models_signed` (ou les noms des variables) avec leurs limites de taille/format, leurs dossiers et `unsigned: false`. Ces presets doivent exister avant le premier envoi de fichiers. Le secret Cloudinary reste exclusivement sur le serveur.

### Paiements et livraison

- Les prix des produits, promotions, poids et frais de livraison sont calculés depuis PostgreSQL côté serveur.
- Un total de panier devenu obsolète est refusé avant création du paiement.
- Flouci reçoit le total, livraison incluse, en millimes. Un retour `?paid=1` ne valide aucun paiement : l'API authentifiée du prestataire vérifie statut, montant et commande.
- Les webhooks sont `/api/payments/flouci/webhook` et `/api/payments/konnect/webhook` sur `APP_URL`.
- Une commande impayée ne peut pas être marquée en livraison/livrée. Le paiement à la livraison est limité à la Tunisie.
- Les accès administrateur/vendeur sont vérifiés sur le serveur, et les comptes désactivés sont refusés.
- Les nouvelles commandes utilisent des identifiants aléatoires UUID. Les anciennes commandes conservent leurs identifiants.

Ne supprimer l'ancien service Render qu'après vérification du déploiement Vercel avec les variables réelles. Les sessions de paiement créées avant la migration peuvent encore notifier l'ancienne URL : conserver temporairement l'ancien service le temps que ces sessions expirent.

## Vérification

```bash
npm run typecheck
npm test
npm run build
```

Les tests couvrent les paiements Flouci/Konnect, les frais de livraison et les routes Next.js avec une base PostgreSQL simulée (pg-mem). Aucun paiement réel n'est exécuté par ces tests.

Références : [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), [limites Vercel Functions](https://vercel.com/docs/functions/limitations), [envoi signé Cloudinary](https://cloudinary.com/documentation/upload_images).
