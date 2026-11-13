import { readFileSync, writeFileSync } from 'node:fs';

import catalog from '../src/data/hackertube/videos.json';
import {
  EDITORIAL_MIN_RECOMMENDATIONS,
  selectEditorialVideos,
} from '../src/lib/video-ranking';
import type { DiscussionContext } from '../src/types/editorial';

// Uses the original public export. This never generates reviewed editorial prose.
const file = process.argv[process.argv.indexOf('--mentions') + 1];
if (!process.argv.includes('--mentions') || !file)
  throw new Error(
    'Supply the public mentions.jsonl export with --mentions <file>'
  );
const selected = selectEditorialVideos(catalog);
const selectedIds = new Set(selected.map((video) => video.id));
const references = new Map<string, DiscussionContext[]>();
for (const line of readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
  const mention = JSON.parse(line);
  if (
    !selectedIds.has(mention.vid) ||
    typeof mention.story_title !== 'string' ||
    !mention.story_title.trim() ||
    !/^https:\/\/news\.ycombinator\.com\/item\?id=\d+$/.test(mention.hn_url)
  )
    continue;
  const list = references.get(mention.vid) ?? [];
  list.push({
    title: mention.story_title,
    url: mention.hn_url,
    ...(/^\d{4}-\d{2}$/.test(mention.month) ? { month: mention.month } : {}),
    sourceUrl: 'https://hackertube.org/download/mentions.jsonl',
  });
  references.set(mention.vid, list);
}
const contexts: Record<string, DiscussionContext> = {};
for (const video of selected) {
  const list = references.get(video.id) ?? [];
  const context = list.find((item) => item.url === video.hnUrl) ?? list[0];
  if (!context) throw new Error(`Missing sourced discussion: ${video.id}`);
  contexts[video.id] = context;
}
const batch = {
  id: 'hn-recommenders-2026-11-13',
  selectedAt: '2026-11-13',
  limit: selected.length,
  minimumRecommendations: EDITORIAL_MIN_RECOMMENDATIONS,
  method:
    'All videos with at least four distinct HN recommenders, descending by recommenders; ties by archive score, then video ID. Includes every video with eight or more recommenders.',
  videoIds: selected.map((video) => video.id),
};
for (const [name, data] of [
  ['editorial-batch.json', batch],
  ['discussion-context.json', contexts],
] as const)
  writeFileSync(
    new URL(`../src/data/hackertube/${name}`, import.meta.url),
    JSON.stringify(data, null, 2) + '\n'
  );
console.log(`Selected ${selected.length} videos with sourced HN discussions.`);
