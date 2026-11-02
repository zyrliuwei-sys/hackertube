# HackerTube data source

The first edition uses the complete public HackerTube export generated on
2026-10-31, rather than a fabricated demonstration list.

- Original project: https://hackertube.org/
- Original author and project announcement: https://karpathy.bearblog.dev/hacker-tube/
- Export manifest: https://hackertube.org/api/export
- Video records: https://hackertube.org/download/videos.jsonl
- Topic taxonomy: https://hackertube.org/download/taxonomy.json
- Upstream field documentation and license: https://hackertube.org/download/DATA.md
- Underlying HN archive: https://huggingface.co/datasets/open-index/hacker-news

## Imported records

The import validates 6,454 unique video IDs, 39,834 retained HN mentions,
150 categories and 16 topic areas against the export manifest. The repository
contains a compact derivative in `src/data/hackertube/`. The original field
documentation is retained verbatim in `src/data/hackertube/DATA.md` and raw
source SHA-256 checksums are stored in `source.json`.

`recommendations` counts distinct positive recommenders (`hn.recommenders`),
whereas `mentions` includes references, jokes and criticism. A zero-positive
video is still part of the archive and must not be described as positively
recommended. The default ranking uses the original HackerTube score;
`popular` uses the positive recommender count. `newest` uses the most recent
HN mention year, not a YouTube upload date. Original AI classifications and
summaries may contain mistakes.

YouTube duration, upload date, views, likes and descriptions are deliberately
excluded by the upstream redistributable export. This derivative preserves
that decision; `duration` and `publishedAt` are null. No duration, view count
or exact upload date is invented. A future integration requiring those
fields should obtain its own YouTube Data API credentials and follow the
applicable API terms and refresh requirements.

Thumbnails use public YouTube middle-frame images (`hq2.jpg`), matching the
original project. The first 12 default results have locally cached copies
when image download succeeds. No video file is hosted or downloaded.

## Attribution and reuse

The source export is released under the Open Data Commons Attribution
License (ODC-By) v1.0: https://opendatacommons.org/licenses/by/1-0/

Credit **HackerTube** (https://hackertube.org) and the **open-index/hacker-news**
dataset (https://huggingface.co/datasets/open-index/hacker-news). Hacker News
data is provided by Y Combinator; comments remain the work of their authors.
Video titles and channel names belong to their creators. HackerTube AI is an
independent navigation interface and is not affiliated with Andrej Karpathy,
YouTube, Google, Hacker News or Y Combinator.

## Refresh

```bash
node scripts/import-hackertube.mjs --thumbnails
```

For a previously downloaded export, put `videos.jsonl`, `taxonomy.json`,
`DATA.md` and the `/api/export` response saved as `export.json` in a directory:

```bash
node scripts/import-hackertube.mjs --source-dir /absolute/path/to/export
```

The importer does not alter the database. Runtime search is entirely local
and does not depend on the original website being available. Refreshing
the source and redeploying updates the snapshot; there is no scheduled sync.
