# FORM

FORM is a local-first fitness and physique tracker for a 16-week PPL hypertrophy program. It tracks workouts, measurements, deterministic progress, reports, and exports without cloud hosting or AI credentials.

## Run locally

Prerequisites: Node.js 20+, npm, and Docker.

```bash
cp .env.example .env.local
docker compose up -d
npm install
npm run seed
npm run dev
```

Open http://localhost:3000. MongoDB is localhost-only at port 27017 and persists in `form-mongo-data`.

## Commands

`npm test` runs Vitest. `npm run build` compiles the app. `npm run e2e` runs Playwright after installing browsers. `npm run graph:generate`, `npm run graph:check`, and `npm run graph:impact -- --feature measurements` maintain the codebase map.

## Backup and restore

Use the in-app export once implemented, or run `mongodump --uri="$MONGODB_URI" --out ./backup-$(date +%F)`. Restore only into a deliberate local database with `mongorestore`. Keep backups private and never commit them.

## Troubleshooting

Check `docker compose ps` and `docker compose logs mongodb` if seed cannot connect. Verify `MONGODB_URI` matches Compose credentials. Empty states remain neutral until real records exist. Phase 2 AI is documented but disabled; ChatGPT Plus is separate from API billing.
