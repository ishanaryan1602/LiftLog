# Database

Collections are `users`, `workouttemplates`, `workoutsessions`, `measurements`, and `analysisreports`, represented in `src/lib/models.ts`. Workout templates embed ordered exercises; sessions embed exercise-name and prescribed-set snapshots so future template revisions cannot rewrite history. Analysis reports are keyed by user, analysis context, and source-data hash so unchanged progress data reuses the stored Gemini response.

Required indexes for production follow `{userId, date}` for sessions and measurements and `{userId, version}` for templates. Phase 1 schemas are deliberately straightforward; add explicit indexes before multi-user rollout. Input validation is Zod at HTTP boundaries plus Mongoose schema constraints.

Future auth must derive `userId` from a server session, never from client input. Example seed data is created by `npm run seed` and is idempotent by owner display name and template version.
