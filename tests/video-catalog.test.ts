import assert from 'node:assert/strict';
import { test } from 'node:test';

import videos from '../src/data/hackertube/videos.json';
import {
  getDiscoveryAtlas,
  listVideos,
} from '../src/modules/video-catalog/service';
import { Route } from '../src/routes/api/videos';

const handler = (
  Route.options.server!.handlers as {
    GET: (context: { request: Request }) => Response;
  }
).GET;

test('atlas edges count shared video classifications exactly, once per pair', () => {
  const atlas = getDiscoveryAtlas();
  assert.equal(atlas.areas.length, 16);
  const pairs = new Set<string>();
  for (const edge of atlas.edges) {
    const pair = [edge.source, edge.target].sort().join('|');
    assert.ok(!pairs.has(pair), `duplicate pair ${pair}`);
    pairs.add(pair);
    assert.notEqual(edge.source, edge.target);
    assert.equal(
      edge.sharedVideos,
      videos.filter(
        (v) =>
          v.areaIds.includes(edge.source) && v.areaIds.includes(edge.target)
      ).length
    );
    assert.ok(edge.sharedVideos > 0);
  }
  for (const area of atlas.areas) {
    assert.equal(
      area.count,
      videos.filter((v) => v.areaIds.includes(area.id)).length
    );
    assert.ok(
      area.previews.every((v) =>
        videos.find((source) => source.id === v.id)?.areaIds.includes(area.id)
      )
    );
  }
  assert.equal(new Set(atlas.featured.map((v) => v.id)).size, 4);
  assert.ok(
    atlas.featured.every((v) => videos.some((source) => source.id === v.id))
  );
});

test('the imported catalog agrees with the upstream manifest', () => {
  const result = listVideos();
  assert.equal(result.sourceTotal, 6_454);
  assert.equal(result.sourceMentions, 39_834);
  assert.equal(result.categoriesCount, 150);
  assert.equal(result.areas.length, 16);
  assert.equal(result.total, result.sourceTotal);
  assert.equal(result.items[0].id, 'fNk_zzaMoSs');
  assert.equal(result.items[0].recommendations, 17);
  assert.equal(result.items[0].mentions, 20);
  assert.equal(result.items[0].duration, null);
  assert.equal(result.items[0].publishedAt, null);
});

test('text search can find real Karpathy material with multiple query words', () => {
  const result = listVideos({ q: 'Andrej Karpathy neural', pageSize: 100 });
  assert.ok(result.total > 0);
  assert.ok(result.items.some((item) => item.id === 'VMj-3S1tku0'));
  assert.equal(listVideos({ q: 'catalog-no-such-video-3971735201' }).total, 0);
});

test('area, topic and content type can be combined without leaking other videos', () => {
  const result = listVideos({
    area: 'math-theory',
    category: 'pure-mathematics',
    type: 'course',
  });
  assert.ok(result.total > 0);
  assert.ok(result.items.every((item) => item.areaIds.includes('math-theory')));
  assert.ok(
    result.items.every((item) => item.categoryIds.includes('pure-mathematics'))
  );
  assert.ok(result.items.every((item) => item.contentType === 'course'));
});

test('pagination has no overlapping records and preserves ordering', () => {
  const first = listVideos({ page: 1, pageSize: 12 });
  const second = listVideos({ page: 2, pageSize: 12 });
  assert.equal(first.items.length, 12);
  assert.equal(second.items.length, 12);
  assert.ok(
    second.items.every(
      (video) => !first.items.some((item) => item.id === video.id)
    )
  );
  assert.ok(first.items.at(-1)!.score >= second.items[0].score);
});

test('saved IDs return only those IDs, including an explicitly empty collection', () => {
  assert.equal(listVideos({ ids: [] }).total, 0);
  const result = listVideos({ ids: ['fNk_zzaMoSs', 'VMj-3S1tku0'] });
  assert.equal(result.total, 2);
  assert.deepEqual(
    new Set(result.items.map((item) => item.id)),
    new Set(['fNk_zzaMoSs', 'VMj-3S1tku0'])
  );
});

test('HTTP query bounds reject invalid and unbounded inputs', async () => {
  for (const query of [
    'page=0',
    'pageSize=101',
    'q=' + 'a'.repeat(201),
    'sort=unknown',
    'type=unknown',
    'ids=invalid',
  ]) {
    const response = handler({
      request: new Request('https://hacker-tube.com/api/videos?' + query),
    });
    assert.equal(response.status, 400, query);
    assert.equal((await response.json()).code, -1);
  }
});

test('HTTP catalog responses use the app envelope and public cache headers', async () => {
  const response = handler({
    request: new Request('https://hacker-tube.com/api/videos?ids=&pageSize=12'),
  });
  assert.equal(response.status, 200);
  assert.ok(response.headers.get('cache-control')?.includes('public'));
  const result = await response.json();
  assert.equal(result.code, 0);
  assert.equal(result.data.total, 0);
  assert.equal(result.data.sourceTotal, 6_454);
});
