# HackerTube AI first edition

Configured domain: https://hacker-tube.com. Local development preview: http://localhost:3001/ (English), http://localhost:3001/zh (Chinese). Port 3000 was already occupied by another project, so this session's Vite server uses port 3001. No production deployment or DNS change was performed.

## Brief and source research

Quick-start Mode A: Getty Images supplied the visual reference; the product brief and HackerTube public export supplied the content. The first edition implements the requested video aggregation and navigation experience. It does not add a video editing or generation engine.

The original HackerTube is https://hackertube.org/, created by Andrej Karpathy. His original post is https://karpathy.bearblog.dev/hacker-tube/. The imported public snapshot is dated 2026-10-31 and contains 6,454 unique videos, 39,834 retained HN mentions, 16 areas and 150 topics. Some mentions are references or criticism, so positive recommender counts are distinguished from total mentions.

See [data research](DATA_SOURCE.md) for source URLs, licensing, metadata limitations and refresh instructions. This is an independent navigation interface, with original project, dataset and ODC-By attribution in the footer and guide.

## Design and implementation

The [design study](DESIGN.md) records the reference font, hierarchy and interaction model. The visual system uses Lato body text, Space Grotesk display type, a white/charcoal layout and an HN orange accent. Palette examples: white `oklch(1 0 0)`, ink `oklch(.20 .002 60)`, orange `oklch(.63 .19 40)`. A cinematic Earth photograph anchors the hero, followed by a compact video library.

Built sections: responsive wordmark/navigation, hero search, collection statistics, search/filter/sort toolbar, grid/list video library, pagination, curated thematic entry points, original-project section and footer. Dialogs provide YouTube playback, recommendation context, HN discussion links and a usage guide. All interface copy has English and Chinese translations. Existing privacy and terms pages have been rewritten for the actual product behavior.

The read-only `/api/videos` endpoint supports keyword, area, topic, type, recommendation/recent discussion ordering, pagination and ID filtering for saved items. Browser collections retain up to 200 video IDs in localStorage and do not sync between devices. Video playback uses a YouTube nocookie iframe after an explicit click, with an external YouTube fallback. Embedding and regional availability remain controlled by YouTube and the uploader.

Existing SaaS modules, auth pages, dashboard, administration, database provider and credentials are retained. No new dashboard page, DB table, migration, payment flow or API key was required. The public catalog is bundled server-side and searched locally. The existing D1 setup was not reset.

Assets: four downloaded editorial photographs and 13 cached YouTube thumbnail images, plus rewritten SVG logo/favicon. Photo sources:

- https://images.unsplash.com/photo-1446776811953-b23d57bd21aa (hero)
- https://images.unsplash.com/photo-1451187580459-43490279c0fa (science)
- https://images.unsplash.com/photo-1518770660439-4636190af475 (computing)
- https://images.unsplash.com/photo-1535223289827-42f1e9919769 (intelligence)

## Validation

- `pnpm build`: passed.
- `pnpm cf:build`: passed. Build only; nothing published.
- `node --import tsx --test tests/video-catalog.test.ts`: 7 tests passed, including data integrity, multi-term search, combined filters, disjoint pagination, saved IDs, parameter bounds and response/cache contract.
- TypeScript for application source and catalog tests: passed. A full repository `tsc --noEmit` also includes an unrelated ignored scratch file `data/d1-login-check.ts` with an existing implicit-any error; that file was left untouched.
- Browser verification: real catalog search, player iframe and source links, saved video persistence, empty collection, responsive menu and no horizontal overflow at mobile width. Desktop (1440px), tablet (768px), mobile (390px), Chinese language switching, combined topic/type filters, empty search recovery, guide dialogs and light/dark rendering were checked. Screenshots are in `docs/design-references/`.
- `git diff --check`: passed.

## Repository and next steps

Origin remains https://github.com/zyrliuwei-sys/hackertube.git. Upstream is now git@github.com:shipany-ai/shipany-tanstack.git for future template synchronization. No commit or push was made. Pre-existing D1/Vite/server changes were retained.

No API key is needed for this edition. To refresh data: `node scripts/import-hackertube.mjs --thumbnails`, review the source changes, then rebuild. The snapshot is not automatically refreshed. Future duration/upload-date integration should use the site's own YouTube API credentials under the applicable terms rather than invented metadata.

For production, keep `VITE_APP_NAME=HackerTube AI` and `VITE_APP_URL=https://hacker-tube.com` in deployment configuration, publish the completed build using the existing deployment flow, and connect the domain. Deployment runtime configuration and DNS have not been changed.
