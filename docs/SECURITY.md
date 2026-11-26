# Security

The intended threat model is a local Linux user. MongoDB binds to `127.0.0.1`, credentials come from environment variables, `.env.local` and personal data are ignored, and Zod validates request payloads. Back up exported JSON/CSV securely; a backup contains personal health-adjacent data.

Do not expose this app to a network before authentication, authorization, CSRF protection, rate limiting, and production Mongo hardening exist. Future auth must derive identity server-side and enforce `userId` isolation on every query. AI keys remain server-only; usage logs exclude prompts and sensitive payloads.
