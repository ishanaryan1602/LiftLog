# Product requirements

FORM helps one local user record training sessions and monthly measurements across a fixed 16-week program, then understand changes without unsupported claims.

Users need to start a prescribed workout, record weight/reps/RIR, review history, enter optional measurements, compare dated records, generate deterministic monthly reports, and export/restore data. The MVP requires responsive pages, Mongo persistence, versioned templates, safe validation, empty/loading/error states, structured logging, tests, and no external AI dependency.

Out of scope: authentication, social features, photos, cloud hosting, paid services, and automatic AI requests. Acceptance means the app starts locally, survives Mongo restarts, seeds exactly six prescribed days (Push 11 sets; Pull 13 sets; Legs 12 sets), preserves snapshots, supports measurements and reports, and passes unit/e2e/graph checks.
