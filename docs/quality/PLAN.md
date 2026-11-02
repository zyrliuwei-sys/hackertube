# Award-standard quality pass

User authorizes iterative improvements to the existing home and interior pages. No deletions, database changes, commits, publication or award submissions are planned. Preserve concurrent D1 and English-only locale work.

## Expected production changes

- Modify `src/types/video-catalog.ts`, `src/modules/video-catalog/service.ts`, `src/server/video-pages.ts`: typed atlas, exact shared-video counts, real featured selections.
- Modify `src/routes/index.tsx`, `src/routes/topics.tsx`, `src/blocks/hackertube.tsx`, `src/blocks/hackertube-topics.tsx`: wire server data and public discovery modes.
- Modify `src/components/hackertube/brand-header.tsx`, `src/blocks/hackertube-header.tsx`: accessible search and mobile controls.
- Create `src/components/hackertube/curiosity-atlas.tsx`, `src/components/hackertube/archive-reel.tsx`, `src/blocks/hackertube-atlas.tsx`, `src/blocks/hackertube-search.tsx`.
- Create `src/styles/hackertube-quality.css`; import from `src/routes/__root.tsx`. Modify existing public CSS only where needed to resolve verified issues.
- Add translations to `messages/en.json` and `messages/zh.json`; add exact-data assertions in `tests/video-catalog.test.ts`.
- Add locally cached video frames under `public/imgs/hackertube/thumbs/` as needed. Update `UPGRADING.md` and brand documentation/kit if the visual contract changes.
- Audit-driven additions: modify `src/blocks/hackertube-auth-layout.tsx`, `src/routes/(auth)/sign-in.tsx`, `src/routes/(auth)/sign-up.tsx` and the existing auth CSS selectors to provide a visible, semantic H1 on every screen size. No authentication logic changes.
- Performance-driven additions: add a bounded translation map at `src/blocks/-hackertube-labels.ts` and update the public guide/watch blocks to use it; replace unbounded translation lookup in `src/hooks/use-appearance.ts` with a map of known appearance labels. Keep existing admin choices and locales. Reduce atlas serialization to fields actually displayed.
- Enable Nitro's documented `compressPublicAssets` gzip/Brotli option in `vite.config.ts`; preserve the concurrent D1/Workers configuration.

## Documentation and evidence

Create `design.md`, `.hallmark/preflight.json`, `.hallmark/log.json`, this plan, `docs/quality/REVIEW.md` and QA screenshots/results. Baseline: no axe violations in the homepage automated scan, but header controls at 320px measured 26–34px. Current hero repeats a generic science photograph and does little to explain the breadth of the archive.

Official review references: [Awwwards evaluation](https://www.awwwards.com/about-evaluation/), [Webby judging criteria](https://www.webbyawards.com/judging-criteria/), [FWA about](https://thefwa.com/about). Use these as qualitative design/usability/content/innovation references; do not invent FWA weights or claim an external jury has reviewed this work.
