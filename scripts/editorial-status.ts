import { readFileSync } from 'node:fs';

import batch from '../src/data/hackertube/editorial-batch.json';
import { getCatalogVideos } from '../src/modules/video-catalog/service';
import {
  getWatchDiscussion,
  getWatchEditorial,
} from '../src/server/editorial-catalog';

// Report the fixed, approved batch. This command never generates or publishes copy.
const catalog = new Map(getCatalogVideos().map((video) => [video.id, video]));
const rows = batch.videoIds.map((id) => ({
  id,
  title: catalog.get(id)?.title ?? null,
  recommendations: catalog.get(id)?.recommendations ?? 0,
  hasDiscussion: Boolean(getWatchDiscussion(id)),
  status: getWatchEditorial(id) ? 'reviewed' : 'awaiting-source-review',
}));

if (process.argv.includes('--json')) {
  console.log(
    JSON.stringify(
      { batch: batch.id, limit: batch.limit, videos: rows },
      null,
      2
    )
  );
} else {
  const published = rows.filter((row) => row.status === 'reviewed').length;
  console.log(
    `Batch: ${batch.id}; selected: ${rows.length}; sourced discussions: ${rows.filter((row) => row.hasDiscussion).length}; reviewed: ${published}; pending: ${rows.length - published}`
  );
  console.log(
    'Pages awaiting editorial review display catalog content and sourced discussion context. No publication is performed by this report.'
  );
}

// Optional, read-only provenance audit against the original public JSONL export.
const exportIndex = process.argv.indexOf('--mentions');
if (exportIndex !== -1) {
  const file = process.argv[exportIndex + 1];
  if (!file)
    throw new Error('Supply the local mentions.jsonl export after --mentions');
  const contexts = JSON.parse(
    readFileSync(
      new URL(
        '../src/data/hackertube/discussion-context.json',
        import.meta.url
      ),
      'utf8'
    )
  );
  const mentions = new Map<string, { story_title: string; month: string }>();
  for (const line of readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
    const mention = JSON.parse(line);
    mentions.set(`${mention.vid}|${mention.hn_url}`, mention);
  }
  for (const [id, context] of Object.entries(contexts) as [
    string,
    { url: string; title: string; month: string },
  ][]) {
    const mention = mentions.get(`${id}|${context.url}`);
    if (
      !mention ||
      mention.story_title !== context.title ||
      mention.month !== context.month
    ) {
      throw new Error(`Discussion provenance mismatch: ${id}`);
    }
  }
  console.log(
    `Verified ${Object.keys(contexts).length} discussion references against the supplied public export.`
  );
}
