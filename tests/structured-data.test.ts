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
  assert.ok(!('uploadDate' in snapshot));
  assert.ok(!('duration' in snapshot));
  const complete = videoSchema({
    ...videos[0],
    publishedAt: '2016-08-06T00:00:00Z',
    duration: 432,
  });
  assert.equal(complete.uploadDate, '2016-08-06T00:00:00Z');
  assert.equal(complete.duration, 'PT432S');
});
