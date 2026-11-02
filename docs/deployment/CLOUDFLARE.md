# HackerTube production deployment

Production: https://hacker-tube.com · Worker `hackertube` · GitHub `zyrliuwei-sys/hackertube`, branch `main`.

`cloudflare/production.json` contains public deployment configuration only. The
gitignored `wrangler.jsonc` and `.env.production` are reconstructed by
`pnpm cf:prepare` in CI. `pnpm cf:deploy` prepares them, builds for Workers and
deploys through Wrangler. Local production env secrets are preserved outside CI.

The existing D1 database `hackertube` binds as `DB`. Migrations live in `drizzle/`
and must be committed. The current initial migration is already applied; existing
RBAC and administrator data are retained. No production schema change was made
as part of this deployment.

Workers holds `AUTH_SECRET` and `CONFIG_ENCRYPTION_KEY` as encrypted runtime
secrets; never put their values in the public config or GitHub. Keep the encryption
key stable. Provider keys can be configured in the existing admin settings.

Cloudflare Workers Builds is intended to connect this repository's `main` branch.
Build command: `pnpm cf:prepare && node --import tsx --test tests/video-catalog.test.ts`.
Deploy command: `pnpm cf:deploy`.
Node version: `24.14.0`; pnpm `11.15.1`. Production branches only, no preview
deployments against the live D1 database. Every code push to `main` builds and
deploys; check its build result before treating a push as published.

Database changes require review: generate a migration with `pnpm db:generate`,
review its SQL, then explicitly apply the approved migration using
`pnpm exec wrangler d1 migrations apply hackertube --remote`. Code deployment
does not silently apply new production migrations. Never use `db:push` on D1
production. Upload storage is optional for this video index; configure R2 before
enabling file upload features.

Rollback through Cloudflare's deployment history; do not rotate secrets during a
normal code release. Manual release command: `pnpm cf:deploy`.
