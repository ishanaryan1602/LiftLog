# Architecture decisions

## ADR-001: local-first MongoDB
MongoDB runs in Docker with a persistent named volume; the Next app runs directly on the host for fast development.

## ADR-002: snapshots for workout history
Sessions duplicate exercise names, prescribed sets, and template version so later revisions preserve what was actually prescribed.

## ADR-003: deterministic analysis first
Arithmetic and classifications are pure TypeScript and remain useful without AI. AI is an optional adapter layered after validated metrics.

## ADR-004: lightweight project map
Generated JSON/Markdown is easier to inspect and maintain than a graph database for this small repository.
