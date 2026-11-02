import assert from 'node:assert/strict';
import { test } from 'node:test';

import videos from '../src/data/hackertube/videos.json';
import {
  jsonLdScripts,
  topicSchema,
  videoSchema,
  websiteSchema,
} from '../src/lib/structured-data';

test('inline JSON-LD cannot break out of its script element', () => {
  const value = {
    name: '</script><script>alert(1)</script>',
    description: '\u2028&<>',
  };
  const [{ children }] = jsonLdScripts(value);
  assert.ok(!children.includes('<'));
  assert.deepEqual(JSON.parse(children), value);
});

test('search and breadcrumbs target real public paths', () => {
  assert.ok(
    websiteSchema().potentialAction.target.urlTemplate.endsWith(
      '/?q={search_term_string}'
    )
  );
  const graph = topicSchema(
    'Functional programming',
    '/topics/software/functional-programming',
    'Topic description'
  )['@graph'];
  assert.equal(graph[0]['@type'], 'CollectionPage');
  assert.equal(graph[1]['@type'], 'BreadcrumbList');
});

test('VideoObject emits verified metadata only, without inventing upload dates', () => {
  const snapshot = videoSchema(videos[0]);
  assert.equal(snapshot, null);
  const complete = videoSchema({
    ...videos[0],
    publishedAt: '2016-08-06T00:00:00Z',
    duration: 432,
    durationIso: 'PT7M12S',
    metadataSource: 'youtube-data-api-v3',
  });
  assert.equal(complete?.uploadDate, '2016-08-06T00:00:00Z');
  assert.equal(complete?.duration, 'PT7M12S');
  assert.equal(complete?.publisher.name, 'HackerTube AI');
  assert.equal(
    videoSchema({ ...videos[0], publishedAt: '2018-01-01T00:00:00Z' }),
    null
  );
});
