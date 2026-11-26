# AI integration

Workout history uses a server-only Gemini adapter to analyze a completed workout. The browser never receives the API key.

The adapter sends a compact record payload, validates the JSON response with Zod, and caches the report by source-data hash so unchanged records do not trigger another request. If Gemini is unavailable, the workout history view shows an explicit unavailable state rather than inventing a fallback analysis.

Set `GEMINI_API_KEY` and optionally `GEMINI_MODEL` in the server environment. The default model is `gemini-3.5-flash-lite`, Google’s cost-efficient Flash-Lite model. API availability, free-tier quotas, retention terms, and pricing should be checked against Google's current documentation before production use.
