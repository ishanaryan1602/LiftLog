# High-level design

Next.js App Router serves the UI and server endpoints. Domain calculations are pure TypeScript. Mongoose owns persistence and all user-owned documents carry `userId`; Phase 1 resolves the local owner server-side.

```mermaid
flowchart LR
 UI[Next routes + components] --> API[Server routes/actions]
 API --> S[Feature services] --> M[Mongoose models]
 M --> DB[(Local MongoDB)]
 S --> C[Pure domain calculations]
 S -. future .-> A[AnalysisProvider]
```

Keep client components limited to interaction. Pino logs server failures without secrets. Future AI is an adapter behind `AnalysisProvider`, with deterministic metrics prepared before invocation, validated structured output, caching by source-data hash, and usage logging. Deployment assumes Linux host plus Docker Compose MongoDB bound to loopback.
