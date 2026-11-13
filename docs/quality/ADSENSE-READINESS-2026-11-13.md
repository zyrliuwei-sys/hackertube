# AdSense implementation status — 2026-11-13

This is a local implementation and verification report, not a deployment or an
AdSense approval. **The requested 300-page editorial rollout is incomplete:
5 pages have reviewed notes and 295 remain unchanged.** The fixed selection covers
all 16 catalog areas and includes the four homepage editor selections.

## Implemented scope

- About: 505 rendered article words; Contact: 213. Both use the existing static
  page shell. The maintainer email supplied by the owner is public; support uses
  `support@hacker-tube.com`. No person, company name or response-time guarantee
  was invented. Both pages carry the actual update date.
- Privacy: Advertising disclosure in the English and Chinese source files,
  including AdSense, vendor cookies and the two opt-out links. The existing title
  and both existing cookie/retention paragraphs in each source are unchanged.
- Channels: eight profiles written from official sources, with 100–150-word
  biographies and source links. The actual catalog counts determine ordering.
  Channels without a reviewed biography are omitted, including from the sitemap.
- Learning paths: eight fixed routes, each with a 60–100-word goal and four or
  five stages referencing existing catalog IDs. Time ranges are explicitly
  editorial study estimates including practice, not invented video runtimes.
- Watch: source links, original HN discussion title/month, content points,
  specific study notes and a real same-topic prerequisite. The archive's weighted
  ranking score is not used as an HN score. No HN vote/comment counts are supplied.
- The complete 300-record discussion-context file was compared against the
  original public `mentions.jsonl` export: title, URL and month all matched.
- AdSense: the account matching the owner's supplied email has publisher ID
  `pub-2841223102464177`. Local development and production environment files use
  that ID. `VITE_ADSENSE_ENABLED=false` keeps the official loader off; verification
  metadata and ads.txt remain available. Invalid/unset IDs render no ad elements.
  No new analytics script, dependency or database migration was added.

## Requested acceptance checks

| Check                                           | Observed result                                                                                                                                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New routes return 200                           | All 19 canonical URLs returned 200: About, Contact, Channels, eight channel profiles and eight learning paths.                                                                                                |
| ads.txt is nonempty and valid                   | 200, 59 bytes: `google.com, pub-2841223102464177, DIRECT, f08c47fec0942fa0`.                                                                                                                                  |
| Privacy keyword checks                          | Rendered HTML contains `advertising`, `AdSense` and `third-party vendors`.                                                                                                                                    |
| Three watch articles contain at least 250 words | Vectors `fNk_zzaMoSs`: 366; Inventing on Principle `PUv66718DII`: 382; 8 Bit Graphics `aMcJ1Jvtef0`: 384. Counts use the video article only, excluding navigation, footer and related cards.                  |
| Sitemap contains new pages                      | 176 distinct entries = existing 157 + 19 new URLs. Video sitemap remains 6,454 entries; combined count is 6,630. Every new URL was explicitly checked.                                                        |
| H1, title, canonical                            | All 19 new pages have one H1, unique titles and a self-referencing production canonical; none has noindex.                                                                                                    |
| Footer links                                    | About, Contact and Channels appear in the shared public footer on every new page and the sampled existing watch, privacy and learning-path pages.                                                             |
| Preserve existing URLs/titles                   | Compared with pre-task commit `d06bf70`: existing watch/learning-path head definitions and privacy titles are unchanged. Router, server redirect rules, stylesheets and original video catalog are unchanged. |

The site's existing `trailingSlash: 'never'` router setting is retained. Thus
`/about/` normalizes with the existing 307 behavior to `/about`, which returns 200;
the same convention applies to the other pages. No new redirect rule was added.

## Reviewed watch records

| Video         | Original editorial prose words | Timing evidence                                                                                   |
| ------------- | -----------------------------: | ------------------------------------------------------------------------------------------------- |
| `fNk_zzaMoSs` |                            282 | No chapter block; creator's lesson text supplies content evidence.                                |
| `PUv66718DII` |                            282 | No chapter block; creator's talk page and accompanying writing.                                   |
| `aMcJ1Jvtef0` |                            289 | No chapter block; official GDC session description.                                               |
| `NGFhc8R_uO4` |                            295 | Original upload description and YouTube's labeled automatic chapter markers: 03:10, 13:43, 22:06. |
| `FITJMJjASUs` |                            284 | Public Confreaks transcript checked at 13:29, 16:19 and 47:59.                                    |

Editorial prose counts include points, notes, audience/prerequisite explanations
and moment descriptions; headings, source labels and the original page content
are additional. The final chip article contains 386 words. Full third-party
transcripts are not republished in the repository or website.

## Validation

- `pnpm build`: passed.
- `pnpm exec tsc --noEmit`: passed.
- Editorial, learning-path, video-catalog, video-metadata and topic tests:
  **30 passed, 0 failed**.
- `node --import tsx scripts/editorial-status.ts --mentions <local-export>`:
  **300 selected, 5 reviewed, 295 pending; 300 discussion references verified**.
- Browser checks at 390px: About, Contact, channel directory, 3Blue1Brown,
  compiler learning path and reviewed watch pages have no horizontal overflow.
  The chapter links carry the verified seconds and the AdSense loader is absent.
- Security scan: no findings in the initial 40-file change. Manual review found
  no new mutation endpoint, secret exposure, arbitrary script URL, raw HTML
  rendering, schema change or payment/permission change.

## Remaining work

1. Source-check and write the remaining 295 selected watch records. Do not mark
   them reviewed, publish a placeholder or widen the 300-ID manifest to conceal
   incomplete coverage. `scripts/editorial-status.ts --json` lists each pending ID.
2. Deploy and verify the actual production URLs after the intended content scope
   is ready. Local verification does not establish that the live site has changed.
3. The inspected AdSense account's site list did not contain `hacker-tube.com`.
   No site was added, application submitted, advertising enabled or email sent
   during this work.

## Maintaining the content gate

`src/data/hackertube/watch-editorials.json` is the only watch-note input. A record
must belong to `editorial-batch.json`, be marked `reviewed`, carry source URLs,
contain 250–300 editorial words and 3–6 content points of 12–25 words each, and
reference an existing same-topic prerequisite. Missing/incomplete records render
the original watch page. Timing blocks require 3–5 ascending timestamps whose
source is explicitly marked `transcript` or `chapters`. Word counts validate
completeness, not factual accuracy: every source and claim still needs review.

Channel biographies and curated paths live in the neighboring `channels.json`
and `curated-paths.json` files. Their route and sitemap loaders use the same data.
Run the editorial validation tests after any content edit.
