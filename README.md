# ELVARO by AIR GO SHOES — Next.js + PostgreSQL

La boutique, l'espace vendeur/administrateur et toutes les API sont dans **une seule application Next.js**, déployable sur Vercel. Aucun service NestJS ni Render n'est nécessaire. PostgreSQL conserve les produits, commandes, tarifs de livraison, demandes de gros, réglages et comptes. Les fichiers sont stockés chez Cloudinary.

Les protections et les instructions de récupération du compte admin sont décrites dans [SECURITY.md](SECURITY.md). Le mot de passe se change dans **Mon compte** (`/vendeur/compte`).

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

Utiliser **la même DATABASE_URL** que le backend précédent : les noms de tables/colonnes, relations et hachages bcrypt sont conservés. Il n'y a aucune synchronisation automatique du schéma à chaque requête, ni création de compte ou suppression de produits au démarrage. Les données existantes restent dans PostgreSQL. Garder le même `JWT_SECRET` aléatoire (au moins 32 octets). Cette mise à jour invalide les anciens jetons staff ; une nouvelle connexion est nécessaire.

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

- En Tunisie, **8 DT par commande**, quel que soit le transporteur choisi. Ce forfait s'applique immédiatement, même si la table conserve d'anciens montants 7,5/10 DT.
- Poids réel estimé : **1,5 kg par paire, emballage compris**, règle partagée par le panier et le serveur.
- Les prix des produits, promotions, quantités et livraison sont recalculés côté serveur. Un total devenu obsolète est refusé avant création du paiement.
- Flouci reçoit le total, livraison incluse, en millimes. Un retour `?paid=1` ne valide aucun paiement : l'API authentifiée du prestataire vérifie statut, montant et commande.
- Les webhooks sont `/api/payments/flouci/webhook` et `/api/payments/konnect/webhook` sur `APP_URL`.
- Une commande impayée ne peut pas être marquée en livraison/livrée. Le paiement à la livraison est limité à la Tunisie.
- Les accès administrateur/vendeur sont vérifiés sur le serveur, et les comptes désactivés sont refusés.
- Les nouvelles commandes utilisent des identifiants aléatoires UUID. Les anciennes commandes conservent leurs identifiants.

### Pays et estimations de livraison

Les **249 pays et territoires ISO 3166-1** sont disponibles dans le sélecteur avec recherche. Les 248 destinations étrangères ont chacune une ligne pour La Poste et Aramex, modifiable individuellement dans **Vendeur → Livraison** par un administrateur.

Le poids reste **1,5 kg × quantité de paires**. La Tunisie reste à **8 DT par commande** pour les deux transporteurs. À l'étranger, paiement en ligne obligatoire, également imposé par l'API.

Les montants préremplis sont des **estimations commerciales**, pas des devis transporteur ou moyennes statistiques garanties. Les bases La Poste s'inspirent de la grille publique de [Poste-Colis](https://www.poste.tn/index_service.php?code_menu=10&code_sous_menu=23) : 19 DT / 29 DT / 40 DT pour les premiers 2 kg, puis 4 DT / 4 DT / 10 DT par kg supplémentaire. Leur application aux pays et territoires et la limite de 30 kg sont des réglages estimatifs à vérifier. Les bases Aramex (40–120 DT selon les zones, puis 12–32 DT/kg supplémentaire) sont des hypothèses modifiables du projet, et non des tarifs officiels trouvés en ligne.

Chaque pays peut avoir ses propres base, poids inclus, supplément, tranche d'arrondi, poids maximum, activation et indication « estimation / tarif réel ». Une tranche de 0 signifie proportionnel ; 1 signifie arrondi au kg supérieur du supplément. Pour un prix simple au kg, utiliser base 0, kg inclus 0, tranche 0. Un pays désactivé ou une commande dépassant sa limite de poids ne peut pas être payé avec cette livraison. Le serveur lit les réglages courants et recalcule le total avant paiement. Les nouvelles grilles par pays prennent priorité sur les anciennes grilles par zone, qui restent conservées.

### Cycle des commandes

| État | Règle |
|---|---|
| Paiement en cours | Commande en ligne enregistrée, montant non encore vérifié. Un échec d'ouverture du lien conserve la commande et permet une relance. |
| À appeler | Paiement à la livraison : la commande n'est pas confirmée. |
| Confirmée | Paiement en ligne vérifié par Flouci/Konnect, ou client COD ayant accepté lors de l'appel (attestation du membre staff obligatoire). |
| En livraison | Passage possible uniquement après confirmation. |
| Livrée | Livraison effective ; pour COD, attestation de l'encaissement réel obligatoire. |
| Retournée | Retour après expédition/livraison ; motif obligatoire, exclue des bénéfices. |
| Annulée | Annulation avant expédition ; motif obligatoire. Une commande annulée ne repasse pas en livraison. |

Les statuts et paiements sont séparés. Le serveur contrôle chaque transition et verrouille la commande pendant la modification. Les webhooks répétés ne créent pas de double confirmation. Un paiement reçu après annulation est enregistré sans réactiver la commande ; l'interface indique le remboursement à traiter, sans effectuer de remboursement automatique. Les bénéfices ne comptent que les commandes **livrées et payées**. Les anciennes commandes COD livrées peuvent être rapprochées avec l'action « Confirmer l'encaissement ».

L'espace staff dispose de filtres/recherche, d'un bouton de vérification du paiement et d'un historique horodaté avec auteur et motif. Le client voit le vrai statut et sa page vérifie périodiquement un paiement en attente. La redirection `?paid=1` seule ne confirme jamais la commande.

### Diagnostic des erreurs 500

Une erreur serveur renvoie une `errorId` et une référence dans le message affiché. Rechercher cette référence dans les logs Vercel : l'entrée `API request failed` indique la route, un code de diagnostic et une action conseillée. Exemples : `28P01` (identifiants PostgreSQL refusés), `42P01` (table absente), `JWT_SECRET_MISSING` ou `DATABASE_URL_MISSING`. Les erreurs brutes, requêtes SQL et secrets ne sont pas affichés. Une erreur inconnue reste `UNEXPECTED_SERVER_ERROR` et nécessite une reproduction en développement. Après modification des variables Vercel, redéployer. Ne jamais partager la valeur de `DATABASE_URL` ; si elle a été divulguée, renouveler le mot de passe Neon et remplacer la variable.
### Stockage additionnel

La connexion serveur crée uniquement la nouvelle table isolée `commerce_records` si elle manque, pour les tarifs modifiés par pays et l'historique des commandes. Les tables existantes ne sont ni synchronisées ni réécrites. Aucun compte ou tarif administrateur n'est remplacé au démarrage ; les estimations non modifiées restent dans le code. Aucun identifiant Aramex ou dimension de carton n'est requis.

Ne supprimer l'ancien service Render qu'après vérification du déploiement Vercel avec les variables réelles. Les sessions de paiement créées avant la migration peuvent encore notifier l'ancienne URL : conserver temporairement l'ancien service le temps que ces sessions expirent.

## Vérification

```bash
npm run typecheck
npm test
npm run build
```

Les tests couvrent les paiements Flouci/Konnect, les frais de livraison et les routes Next.js avec une base PostgreSQL simulée (pg-mem). Aucun paiement réel n'est exécuté par ces tests.

Références : [Next.js Route Handlers](https://nextjs.org/docs/app/api-reference/file-conventions/route), [limites Vercel Functions](https://vercel.com/docs/functions/limitations), [envoi signé Cloudinary](https://cloudinary.com/documentation/upload_images).
