# FORM agent guide

FORM is a local-first Next.js + MongoDB fitness tracker for a fixed, versioned 16-week PPL hypertrophy program. Phase 1 has no AI calls and uses a single local owner identity.

Important directories: `src/app` routes, `src/features` domain logic, `src/lib` database/config/logging, `scripts` seed and map tooling, `tests` for browser coverage, and `docs` for decisions and product context.

For changes: read this file and `.project-map/architecture.md`; identify the feature; consult `.project-map/modules.json`; traverse only relevant imports; inspect affected source and tests; implement; run targeted tests; run `npm run graph:generate` and `npm run graph:check`.

Commands: `npm run dev`, `docker compose up -d`, `npm run seed`, `npm test`, `npm run e2e`, `npm run graph:generate`, `npm run graph:impact -- --feature measurements`.

Conventions: strict TypeScript, Zod at input boundaries, repository/database access outside presentation, pure calculations for progress, no secrets in source, and preserve historical workout snapshots. Update docs when behavior or architecture changes. The graph is an index, not a substitute for reading source.
