# KICKS API (NestJS + TypeORM)

API PostgreSQL (Neon) pour la boutique sneakers.

```bash
cp .env.example .env
npm install
npm run start:dev
```

Écoute `http://localhost:3001/api`. CORS ouvert (`FRONTEND_URL=*`) par défaut.

## Vercel (API)

Second projet Vercel, **Root Directory = `backend`**. Pas de Docker sur Vercel. Santé : `GET /api/health`.

## Docker

```bash
docker compose up --build
```

(depuis la racine du repo, avec `backend/.env`).

## Render (API seule)

Depuis le dépôt `vender-chaussures` : Root Directory = `backend`, build `npm ci --include=dev && npm run build`, start `npm run start:prod`. Santé : `GET /api/health`. Voir le README racine.
