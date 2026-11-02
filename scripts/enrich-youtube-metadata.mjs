/** Fetch genuine snippet.publishedAt/contentDetails.duration, 50 IDs per call.
 * Run: pnpm exec tsx scripts/with-env.ts node scripts/enrich-youtube-metadata.mjs
 * Optional: --ids fNk_zzaMoSs,VMj-3S1tku0 --force
 * API credentials are read from the environment and never written or printed.
 */
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../src/data/hackertube/', import.meta.url);
const key = process.env.YOUTUBE_API_KEY?.trim();
if (!key) {
  console.error(
    'YOUTUBE_API_KEY is not configured. No API requests or data changes made.'
  );
  process.exit(1);
}
const videos = JSON.parse(await readFile(new URL('videos.json', root), 'utf8'));
const destination = new URL('youtube-metadata.json', root);
const cache = JSON.parse(await readFile(destination, 'utf8'));
const idsOption = process.argv.indexOf('--ids');
const requested =
  idsOption >= 0
    ? new Set((process.argv[idsOption + 1] || '').split(','))
    : null;
const refreshBefore = Date.now() - 29 * 86400_000;
const ids = videos
  .filter(
    (video) =>
      (!requested || requested.has(video.id)) &&
      (process.argv.includes('--force') ||
        !cache[video.id] ||
        Date.parse(cache[video.id].fetchedAt) < refreshBefore)
  )
  .map((video) => video.id);
let received = 0,
  missing = 0;
for (let offset = 0; offset < ids.length; offset += 50) {
  const batch = ids.slice(offset, offset + 50);
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.search = new URLSearchParams({
    part: 'snippet,contentDetails',
    id: batch.join(','),
    fields: 'items(id,snippet(publishedAt),contentDetails(duration))',
    key,
  }).toString();
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  } catch {
    throw new Error(
      'YouTube API request failed; credentials and request URLs are omitted.'
    );
  }
  if (!response.ok)
    throw new Error(
      `YouTube API returned HTTP ${response.status}. Check API enablement, key restrictions and quota.`
    );
  const payload = await response.json();
  if (!Array.isArray(payload.items))
    throw new Error('Unexpected YouTube API response.');
  const records = new Map(payload.items.map((item) => [item.id, item]));
  const now = new Date().toISOString();
  for (const id of batch) {
    const item = records.get(id);
    const publishedAt = item?.snippet?.publishedAt;
    const duration = item?.contentDetails?.duration;
    if (
      typeof publishedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T/.test(publishedAt) ||
      !Number.isFinite(Date.parse(publishedAt)) ||
      Date.parse(publishedAt) > Date.now() ||
      typeof duration !== 'string' ||
      !/^P(?:\d+D)?T?(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?$/.test(duration)
    ) {
      delete cache[id];
      missing++;
      continue;
    }
    const previous = cache[id];
    const unchanged =
      previous?.publishedAt === publishedAt && previous?.duration === duration;
    cache[id] = {
      source: 'youtube-data-api-v3',
      publishedAt,
      duration,
      fetchedAt: now,
      updatedAt: unchanged ? previous.updatedAt : now,
    };
    received++;
  }
  await writeFile(destination, JSON.stringify(cache, null, 2) + '\n');
  console.log(
    `Checked ${Math.min(offset + 50, ids.length)}/${ids.length}; verified ${received}; unavailable ${missing}.`
  );
}
console.log(
  `Metadata ready: ${Object.keys(cache).length} verified records. Rebuild/deploy to publish.`
);
