# HackerTube SEO self-check — 2026-11-02

Changes are in the local project; this task has not deployed them to the public domain.
HTTP checks used a local SSR server configured with the public canonical origin.

## Topic page examples

- https://hacker-tube.com/topics/software/functional-programming
- https://hacker-tube.com/topics/ai-data/llms-generative-ai
- https://hacker-tube.com/topics/systems-security/distributed-systems

All 150 configured topics have unique routes, matching video inventories and
175–228 words of description derived from their actual catalog records. H1 is
the configured topic name; Title follows `<topic> Videos & Talks | HackerTube`.
The functional-programming page renders all 225 video cards in SSR HTML.
Each topic has six links to sibling topics. Every video maps to its real topics.

## Sitemap and HTTP checks

| Resource              |          Entries | Result                             |
| --------------------- | ---------------: | ---------------------------------- |
| `/sitemap.xml`        | 2 child sitemaps | HTTP 200                           |
| `/sitemap-pages.xml`  | 157 content URLs | All HTTP 200, canonical self       |
| `/sitemap-videos.xml` | 6,454 video URLs | All HTTP 200, canonical self       |
| Total content URLs    |            6,611 | No template articles or empty blog |

157 = 150 topic pages + home, topics, guide, pricing, privacy policy, terms of
service and the existing usage guide. Real published blog content will be added
dynamically when present. No dates were invented for sitemap entries.

`/topics` returns 200 directly without adding `?view=directory`. Switching views
in the browser leaves the URL unchanged. The old
`/?area=software&category=functional-programming` returns HTTP **301**, with
`Location` ending in `/topics/software/functional-programming`.

`/blog`, `/blog/blocks-vs-components`, and `/blog/what-is-shipany` return **404**.
Four English/Chinese template MDX files were removed; Git retains their history.

## Raw SSR HTML and structured data

`curl` responses contain `<script type="application/ld+json">` before `</head>`:

- Home: WebSite with a SearchAction targeting `/?q={search_term_string}`.
- Topic pages: CollectionPage and BreadcrumbList (Home → Topics → topic).
- Video pages: VideoObject with name, description, absolute thumbnailUrl and embedUrl.

To repeat after deployment:

```sh
curl -s https://hacker-tube.com/ | rg -o 'application/ld\+json'
curl -s https://hacker-tube.com/topics/software/functional-programming | rg -o 'CollectionPage|BreadcrumbList'
curl -s https://hacker-tube.com/watch/fNk_zzaMoSs | rg -o 'VideoObject'
curl -sI 'https://hacker-tube.com/?area=software&category=functional-programming'
```

The original snapshot has **no verified upload dates or durations for any of the
6,454 videos**. As requested, these are marked pending rather than filled with
guesses. `uploadDate`/duration are included automatically when present in the
video record. Google video rich-result requirements cannot be fully met until
real upload dates are supplied.

Google Rich Results Test was attempted twice in code mode with the topic JSON-LD
extracted from SSR HTML. Both submissions returned the service dialog
“Something went wrong / If the issue persists, try again in a few hours”.
An external Google pass is **not claimed**. Retest after deployment and date enrichment.

## Regression verification

- Homepage metadata title/description and hero H1/description matched the original
  `HEAD:messages/en.json` values exactly; no keyword wording changed.
- Sample home, topic and watch HTML had no internal links with trailing slashes.
- Browser topic view rendered 225 cards and six related-topic links without
  horizontal overflow; directory/atlas switching used internal state.
- 14 tests passed across topic pages, structured data and the video catalog.
- TypeScript check and production build passed.
