# SEO follow-up — 2026-11-03

Deployed to **https://hacker-tube.com** through the existing Cloudflare release
flow. Version: `b86aac20-bd1e-4599-9dcb-5f6ae2a41fd4`.
Production curl and browser checks completed after deployment. Requirements 1,
2 and 4 pass. Requirement 3's suppression, publisher/duration support, importer
and lastmod are implemented; actual API data enrichment and YouTube date comparison
remain blocked by the missing key.

## Production self-check results

- Raw topic and watch heads: zero alternate/hreflang links.
- All ten sampled descriptions end at a complete sentence and are at most 160 characters.
- No unverified VideoObject was emitted on any of the five sampled watch pages.
- All 6,454 video sitemap entries have lastmod, retaining the existing 6,454 locs.
- Production video tags: three mapped topic anchors and two frontend filter buttons;
  the header collection control is a button. Template search found zero query anchors.
- Browser interaction: unmapped `3blue1brown` opens `/#explore` with the frontend
  search value set; My collection opens the saved view at `/#explore`.
- 20 tests, TypeScript and the production builds passed. Homepage protected copy
  matched the pre-change messages exactly. No database migrations were applied.

| Sample path                                    | Description length |
| ---------------------------------------------- | -----------------: |
| `/topics/software/functional-programming`      |                147 |
| `/topics/software/web-development`             |                140 |
| `/topics/ai-data/llms-generative-ai`           |                148 |
| `/topics/math-theory/pure-mathematics`         |                157 |
| `/topics/systems-security/distributed-systems` |                146 |
| `/watch/fNk_zzaMoSs`                           |                121 |
| `/watch/FITJMJjASUs`                           |                100 |
| `/watch/NGFhc8R_uO4`                           |                159 |
| `/watch/Unzc731iCUY`                           |                 96 |
| `/watch/VMj-3S1tku0`                           |                134 |

Some video descriptions are shorter than 140 because the next complete source
sentence would exceed 160; the video summaries are not padded or cut mid-word.
For example, `/watch/fNk_zzaMoSs` now ends with “animated geometric visuals.”

Scope: remove English-only hreflang, fix description boundaries, use verified
YouTube metadata and stable video lastmod, replace non-crawlable tag/collection
anchors. Existing routes, sitemap index/partitioning, `/topics` behavior and
retired template articles are preserved. Homepage Title, H1 and description copy
are unchanged.

## Changes by requirement

1. `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/routes/blog/index.tsx`:
   removed alternate/hreflang output. No homepage alternate is inherited by inner pages.
2. `src/lib/meta-description.ts`, watch/topic route heads and
   `tests/meta-description.test.ts`: sentence-aware metadata, maximum 160 characters;
   topic summaries use a concise opener plus the introduction's first perspective.
3. `scripts/enrich-youtube-metadata.mjs`, `.env.example`,
   `src/data/hackertube/{youtube-metadata,catalog-state}.json`,
   `src/lib/{video-metadata,structured-data}.ts`, video types/catalog service,
   `src/server/sitemap.ts`, video sitemap route and metadata tests:
   API-only enrichment, verified-date gate, publisher, ISO duration and stable lastmod.
4. `src/lib/{topic-path,catalog-intent}.ts`, watch/header/home/search blocks,
   `src/components/hackertube/brand-header.tsx`, watch/search styles:
   recognized tags link to real topics; other tags and saved collections are buttons.
   Session state carries the user's filter to the home catalog without query anchors.

`UPGRADING.md` records the changed configuration/content behavior.

## YouTube metadata status

No `YOUTUBE_API_KEY` was present in the shell, local env files or configured
Worker secret names during this run. No real YouTube API data was obtained.
`youtube-metadata.json` therefore remains empty. Pages without verified dates
emit **no VideoObject**; no HN year is substituted. A real upload-date comparison
against YouTube remains pending rather than reported as passed.

To enrich after configuring the key locally:

```sh
pnpm exec tsx scripts/with-env.ts node scripts/enrich-youtube-metadata.mjs
pnpm cf:deploy
```

The script requests `snippet.publishedAt` and `contentDetails.duration` from the
[YouTube Data API](https://developers.google.com/youtube/data/reference/rest/v3/videos/list).
It caches verified fields with provenance and actual fetch/change timestamps,
in batches of 50 IDs. Re-fetch at least every 30 days. The key is neither written
to the cache nor included in the client bundle. Unavailable API records are removed.

Video sitemap `lastmod` uses the recorded watch-content update
`2026-11-02T16:03:09Z` (2026-11-03 00:03:09 Asia/Shanghai), or a later actual
metadata change. It is not a video upload date or a per-request current date.
The watch-page schema/navigation changed in this release, so the content timestamp
is a real page update. Sitemap partitions and entry counts are unchanged.

## Repeatable raw-HTML verification

```sh
node scripts/check-seo-followup.mjs https://hacker-tube.com
```

This uses curl for home, five topic pages and five watch pages; checks head
alternates, decoded meta lengths/ending punctuation, query anchors, metadata
provenance and all 6,454 video lastmods. Missing enrichment is reported separately.

Browser QA covers a mapped tag, an unmapped tag opening frontend search, and a
saved-collection button without query parameters. Unit tests cover all 6,454
summaries and 150 topic descriptions, plus schema escaping, metadata validation,
topic mappings and sitemap dates. Production is released via `pnpm cf:deploy`.
