# Sécurité et déploiement

L'application et ses API sont hébergées ensemble dans Next.js. Les changements de cette version nécessitent une nouvelle connexion de l'équipe ; les anciens jetons sont invalidés.

## Paramètres privés

- `JWT_SECRET` : secret aléatoire d'au moins 32 octets, obligatoire. Exemple de génération locale : `openssl rand -hex 32`. Le garder stable : sa rotation invalide les sessions et les liens de suivi des commandes. Aucun préfixe `NEXT_PUBLIC_*`.
- `APP_URL` : origine HTTPS publique et canonique de la boutique, sans `/api`. Elle sert aux retours de paiement et aux liens clients.
- `DATABASE_URL` : URL PostgreSQL poolée. La validation TLS est activée pour les connexions distantes et la production. Si le fournisseur utilise une CA privée, renseigner `DATABASE_CA_CERT` avec son certificat PEM ; ne pas désactiver la validation.

Les tables métier existantes sont conservées, avec `synchronize: false`. L'initialisation des API crée seulement les objets auxiliaires du commerce et la table `security_rate_limits` avec son index. Le rôle PostgreSQL doit disposer des droits nécessaires. Sur une base neuve, utiliser `npm run db:init` explicitement ; ne pas l'ajouter au build Vercel.

## Compte administrateur

La création publique `/auth/setup` est interdite dans tous les environnements. Aucun compte ni mot de passe par défaut n'est créé. Le premier admin est provisionné avec `ADMIN_EMAIL` et `ADMIN_PASSWORD` via `npm run db:init` si la table `users` est vide.

Les anciens mots de passe de démonstration sont refusés. Pour récupérer un compte admin existant, définir **localement dans `.env.local`** `ADMIN_RESET_PASSWORD=true`, `ADMIN_EMAIL` correspondant à un administrateur actif et un nouveau `ADMIN_PASSWORD` fort. Exécuter `npm run db:init`, puis retirer `ADMIN_RESET_PASSWORD` et `ADMIN_PASSWORD`. Cette opération n'est disponible dans aucun endpoint public et ne s'exécute pas à chaque requête.

Pour un compte avec un mot de passe personnel, se reconnecter puis ouvrir **Mon compte** (`/vendeur/compte`). Les nouveaux mots de passe doivent être uniques, comporter au moins 12 caractères et au maximum 72 octets UTF-8. Leur modification invalide les anciennes sessions.

Les sessions durent deux heures. En production, le cookie `__Host-elvaro-staff` est HttpOnly, Secure et SameSite=Lax. Le jeton n'est plus exposé dans les réponses de connexion ni stocké par le frontend. L'origine des connexions et des mutations utilisant un cookie est vérifiée. Les API acceptent aussi les jetons Bearer valides pour les clients techniques ; les rôles sont toujours contrôlés côté serveur.

La déconnexion efface le cookie. Un jeton déjà volé reste valide jusqu'à expiration, sauf changement du mot de passe ou désactivation du compte. Cette version n'ajoute pas de double authentification.

## Commandes et paiements

La lecture publique et la reprise de paiement nécessitent `X-Order-Token`. Le checkout et les retours Flouci transmettent le secret dans le fragment du lien de suivi, absent des requêtes HTTP de navigation et des en-têtes Referer. Le lien complet donne accès à la commande : le partager seulement avec son client.

Les anciens liens contenant seulement l'identifiant ne donnent plus accès aux coordonnées. L'équipe peut obtenir le lien sécurisé des commandes, y compris anciennes, dans **Commandes**. Les routes de vérification et d'historique restent réservées au staff. La confirmation de paiement repose sur la vérification serveur du prestataire ; le webhook Flouci doit en outre porter une signature `X-Flouci-Signature` valide et récente.

## Limites et médias

Les limites de requêtes sont atomiques dans PostgreSQL et partagées entre instances. Les connexions sont limitées par IP et par e-mail normalisé ; créations de commandes, reprises de paiement, lectures et signatures d'upload ont aussi leurs limites. Les mutations JSON sont limitées à 128 Ko, y compris sans Content-Length.

Sur Vercel, l'IP provient de l'en-tête remplacé par la plateforme. Hors Vercel, les requêtes partagent un quota pour éviter de faire confiance à des en-têtes falsifiables. Adapter ce mécanisme avec le proxy réellement utilisé avant un autre mode d'hébergement ; ne jamais activer `VERCEL=1` sur un serveur accessible directement.

Les uploads restent directs vers Cloudinary, avec signatures réservées au staff. Exécuter `npm run cloudinary:init` pour configurer les presets signés qui imposent taille et formats au prestataire.

## Avis restants dans les outils de développement

L’audit de production ne signale plus de vulnérabilités connues. L’audit complet signale encore des dénis de service liés à `braces` (ESLint) et `sprintf-js` (Jest), avec des dépendances de développement affectées en cascade. Aucune mise à jour compatible proposée par npm ne les corrige actuellement. Ne pas traiter de motifs ou de formats provenant de sources non fiables avec ces outils ; suivre leurs correctifs sans rétrograder les outils vers des versions anciennes.

## Vérifications

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run test:headers
npm audit --omit=dev
```

Les tests du limiteur exécutent l'UPSERT et l'initialisation idempotente sur PostgreSQL embarqué (PGlite), sans données de production. Le build utilise Webpack pour éviter une erreur de résolution des polices Google dans Turbopack 16.4.0.

Après déploiement sur HTTPS, vérifier connexion/déconnexion, changement de mot de passe, droits vendeur/admin, accès aux commandes avec et sans lien secret, retours de paiement en environnement de test et uploads. Les vérifications locales ne prouvent pas la configuration des secrets ou des certificats dans Vercel.
