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

Cloudflare Workers Builds is connected to this repository's `main` branch.
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

## Connected resources

- Native build trigger: `c4ab27f2-3bd4-44e7-be6e-d49a1d9802f9`.
- Git repository connection: `9b9734fe-9d09-48be-8ab9-2d9d2ef98fa5`.
- Dedicated build credential: `hackertube build token`, managed by Cloudflare.
- Build variable `PNPM_VERSION=11.15.1`; build cache enabled; previews disabled.
- Initial production release: `b85b003c-7fc9-4b55-a169-8a99ffebbd63`.
- Runtime secrets and D1 binding were confirmed on the live Worker.

The next commit exercises the Git push trigger rather than a local redeploy.

## AI learning paths

The `AI` Workers AI binding requires no API secret. The `LEARNING_PATH_LIMITER`
native rate-limit binding has namespace `1001`, with three requests per minute
per IP. Both bindings are versioned in `cloudflare/production.json`; copy them
to an existing local `wrangler.jsonc` before a manual release. CI creates them
from the public configuration on each build. No D1 migration is involved.

The planner uses `@cf/meta/llama-3.3-70b-instruct-fp8-fast` in JSON mode. AI
outputs are schema-checked and all video IDs are validated against retrieved
catalog records. Failed generation shows a labeled catalog-based path. Limits,
timeout, bounded tokens, and a small in-memory cache contain request cost.
Workers AI usage follows the Cloudflare account's plan and quotas.

## Self-hosted Plausible

`PLAUSIBLE_SCRIPT_HOSTS=stats.cadcraft.org` explicitly approves the analytics
host selected for this site. Keep the runtime variable in the versioned
`cloudflare/production.json` and the local `wrangler.jsonc`. The actual site
script URL is saved in Admin → Settings → Analytics. The allow-list is checked
on save and on render; adding a URL in the admin panel alone does not approve
its host. Preserve this restriction when changing analytics providers.
