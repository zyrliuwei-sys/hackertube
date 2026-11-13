# HackerTube AI

A video discovery and learning website at [hacker-tube.com](https://hacker-tube.com).
Explore 6,454 videos from the public HackerTube catalog, with Hacker News
recommendation context, topic browsing and AI-assisted learning paths.

## Product

- Search the video archive and browse 150 categories across 16 subject areas.
- Open a video’s watch page, read its recommendation context and visit the
  original Hacker News discussion.
- Build an ordered video learning path from a goal, with reasons for each
  selection and practice prompts. AI results use validated catalog video IDs.
- Explore relationships between subject areas in the Curiosity Atlas.
- Keep a local video collection, sign in to an account and access the
  administration console with the required permissions.
- Use the site on mobile or desktop, in light or dark mode.

The public interface is English. Translation source files are maintained in
`messages/en.json` and `messages/zh.json`; legacy Chinese URLs redirect to English.

## Local development

Use Node 24 and pnpm 11 (versions are pinned in the repository).

```bash
pnpm install
cp .env.example .env.development
# Configure the local URL, SQLite database path and an authentication secret.
pnpm db:setup
pnpm db:push
pnpm dev
```

Open `http://localhost:3000`. Local configuration and credentials are gitignored.
Use a separate local database for development. Existing administrator accounts
sign in at `/sign-in`; the management console is at `/admin`.

## Routes

| Route                       | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `/`                         | Video search and discovery                |
| `/topics`                   | Topic directory and atlas                 |
| `/topics/<area>/<category>` | Category videos                           |
| `/watch/<videoId>`          | Video playback and recommendation context |
| `/learning-paths`           | AI video learning paths                   |
| `/guide`                    | How to use the video archive              |
| `/settings`                 | Signed-in account                         |
| `/admin`                    | Administration console                    |

## Architecture

TanStack Start, React 19, TypeScript, Vite and Nitro power the application.
The UI uses Tailwind CSS and shared components; TanStack Query and Form handle
data and forms. Authentication uses better-auth, and Drizzle provides database
access. Production runs on Cloudflare Workers with D1 and Workers AI.

- `src/blocks/`: product page sections and translated content.
- `src/components/`: reusable interface components.
- `src/routes/`: public pages, account/admin routes and API handlers.
- `src/modules/`: server-side business services.
- `src/data/hackertube/`: video catalog and source metadata.
- `src/content/`: information pages and article infrastructure.

## Checks and deployment

```bash
pnpm build
pnpm test:learning-paths
node --import tsx --test tests/video-catalog.test.ts
```

Pushes to `main` trigger the connected Cloudflare production build. Public
runtime configuration is versioned in `cloudflare/production.json`; secrets
remain in Workers. See [deployment notes](docs/deployment/CLOUDFLARE.md),
[upgrade notes](UPGRADING.md) and [agent instructions](AGENTS.md).

## Data and licensing

Video metadata comes from the public [HackerTube export](https://hackertube.org/)
and the [open-index Hacker News archive](https://huggingface.co/datasets/open-index/hacker-news).
The data is attributed under the [Open Data Commons Attribution License](https://opendatacommons.org/licenses/by/1-0/).
Videos remain their creators’ work. This website is an independent guide.

Source-code licensing is documented in [LICENSE](LICENSE). Asset and font licenses
are included with the relevant files under `public/brand/`.
