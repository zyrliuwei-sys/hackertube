/**
 * Refresh the redistributable HackerTube export without YouTube API metadata.
 * Run: node scripts/import-hackertube.mjs
 * Optional offline source: node scripts/import-hackertube.mjs --source-dir /path
 * The directory must contain videos.jsonl, taxonomy.json, DATA.md, export.json.
 */
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = 'https://hackertube.org';
const destination = fileURLToPath(
  new URL('../src/data/hackertube/', import.meta.url)
);
const thumbnailsDirectory = fileURLToPath(
  new URL('../public/imgs/hackertube/thumbs/', import.meta.url)
);
const sourceFlag = process.argv.indexOf('--source-dir');
const sourceDir = sourceFlag >= 0 ? process.argv[sourceFlag + 1] : undefined;
if (sourceFlag >= 0 && !sourceDir)
  throw new Error('--source-dir requires a directory');

async function source(name) {
  if (sourceDir) return readFile(join(sourceDir, name), 'utf8');
  const path = name === 'export.json' ? '/api/export' : `/download/${name}`;
  const response = await fetch(`${origin}${path}`, {
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  return response.text();
}

const [rawVideos, rawTaxonomy, documentation, rawManifest] = await Promise.all([
  source('videos.jsonl'),
  source('taxonomy.json'),
  source('DATA.md'),
  source('export.json'),
]);
const manifest = JSON.parse(rawManifest);
const taxonomy = JSON.parse(rawTaxonomy);
const rows = rawVideos
  .trim()
  .split(/\r?\n/u)
  .map((line) => JSON.parse(line));
if (rows.length !== manifest.videos)
  throw new Error('Video count differs from export manifest');
if (!Array.isArray(taxonomy.areas)) throw new Error('Invalid taxonomy');
if (!documentation.includes('ODC-By'))
  throw new Error('Review source license before importing');

const ids = new Set();
const videos = rows.map((row) => {
  if (!/^[\w-]{11}$/u.test(row.vid) || ids.has(row.vid))
    throw new Error('Invalid or duplicate video ID');
  ids.add(row.vid);
  if (
    typeof row.title !== 'string' ||
    !Array.isArray(row.categories) ||
    !row.hn
  ) {
    throw new Error(`Invalid video: ${row.vid}`);
  }
  const commentId = row.quote?.hn_comment_id;
  return {
    id: row.vid,
    title: row.title,
    channel: row.channel,
    summary: row.summary,
    whyRecommended: row.why_hn,
    duration: null,
    publishedAt: null,
    thumbnail: `https://i.ytimg.com/vi/${row.vid}/hq2.jpg`,
    areaIds: [...new Set(row.categories.map((category) => category.area))],
    categoryIds: row.categories.map((category) => category.id),
    topics: [
      ...new Set([row.primary_topic, ...(row.tags || [])].filter(Boolean)),
    ],
    recommendations: row.hn.recommenders,
    mentions: row.hn.mentions,
    score: row.score,
    contentType: row.content_type,
    level: row.level,
    shelfLife: row.shelf_life,
    firstRecommendedYear: Number(row.hn.first_year),
    lastRecommendedYear: Number(row.hn.last_year),
    ...(Number.isSafeInteger(commentId) && commentId > 0
      ? { hnUrl: `https://news.ycombinator.com/item?id=${commentId}` }
      : {}),
  };
});
// Thumbnails are public YouTube image URLs, not restricted API metadata.
// Preserve already cached thumbnails; opt in to fetching the first 12 with
// --thumbnails. A failed image keeps its working upstream URL.
const downloadThumbnails = process.argv.includes('--thumbnails');
const featured = [...videos]
  .sort((a, b) => b.score - a.score || b.recommendations - a.recommendations)
  .slice(0, 12);
if (downloadThumbnails) await mkdir(thumbnailsDirectory, { recursive: true });
for (let index = 0; index < featured.length; index += 4) {
  await Promise.all(
    featured.slice(index, index + 4).map(async (video) => {
      const path = join(thumbnailsDirectory, `${video.id}.jpg`);
      let exists = await access(path).then(
        () => true,
        () => false
      );
      if (!exists && downloadThumbnails) {
        try {
          const response = await fetch(video.thumbnail, {
            signal: AbortSignal.timeout(12_000),
          });
          if (
            response.ok &&
            response.headers.get('content-type')?.startsWith('image/')
          ) {
            await writeFile(path, new Uint8Array(await response.arrayBuffer()));
            exists = true;
          }
        } catch {
          console.warn(`Thumbnail cache skipped: ${video.id}`);
        }
      }
      if (exists) video.thumbnail = `/imgs/hackertube/thumbs/${video.id}.jpg`;
    })
  );
}
const areas = taxonomy.areas.map((area) => ({
  id: area.id,
  name: area.name,
  count: videos.filter((video) => video.areaIds.includes(area.id)).length,
  categories: area.categories.map((category) => ({
    id: category.id,
    name: category.name,
    count: videos.filter((video) => video.categoryIds.includes(category.id))
      .length,
  })),
}));
const categoriesCount = areas.reduce(
  (count, area) => count + area.categories.length,
  0
);
const mentions = videos.reduce((count, video) => count + video.mentions, 0);
if (mentions !== manifest.mentions)
  throw new Error('Mention count differs from export manifest');
const sourceMetadata = {
  name: 'HackerTube',
  url: origin,
  exportUrl: `${origin}/download/hackertube-data.zip`,
  generated: manifest.generated,
  videos: videos.length,
  mentions,
  categories: categoriesCount,
  areas: areas.length,
  license: 'Open Data Commons Attribution License (ODC-By) v1.0',
  licenseUrl: 'https://opendatacommons.org/licenses/by/1-0/',
  upstreamDataset: 'https://huggingface.co/datasets/open-index/hacker-news',
  originalAuthor: 'Andrej Karpathy',
  originalArticle: 'https://karpathy.bearblog.dev/hacker-tube/',
  videosSha256: createHash('sha256').update(rawVideos).digest('hex'),
  taxonomySha256: createHash('sha256').update(rawTaxonomy).digest('hex'),
};
await mkdir(destination, { recursive: true });
await Promise.all([
  writeFile(join(destination, 'videos.json'), JSON.stringify(videos)),
  writeFile(join(destination, 'areas.json'), JSON.stringify(areas)),
  writeFile(
    join(destination, 'source.json'),
    JSON.stringify(sourceMetadata, null, 2) + '\n'
  ),
  writeFile(join(destination, 'DATA.md'), documentation),
]);
console.log(
  `Imported ${videos.length} videos, ${mentions} mentions, ${categoriesCount} topics across ${areas.length} areas.`
);
