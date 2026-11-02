import assert from 'node:assert/strict';
import { test } from 'node:test';

import areas from '../src/data/hackertube/areas.json';
import videos from '../src/data/hackertube/videos.json';
import { describeTopic } from '../src/lib/topic-description';
import {
  legacyTopicPath,
  topicPath,
  videoTopicLinks,
} from '../src/lib/topic-path';

test('all 150 topics have unique paths, real matching videos and 150–250 words', () => {
  const paths = new Set<string>();
  for (const area of areas) {
    for (const category of area.categories) {
      const path = topicPath(area.id, category.id);
      assert.ok(!paths.has(path));
      paths.add(path);
      const items = videos.filter(
        (video) =>
          video.areaIds.includes(area.id) &&
          video.categoryIds.includes(category.id)
      );
      assert.equal(items.length, category.count, path);
      assert.ok(items.length > 0, path);
      const related = area.categories
        .filter((item) => item.id !== category.id)
        .slice(0, 6);
      assert.ok(related.length >= 3 && related.length <= 6);
      assert.ok(related.every((item) => topicPath(area.id, item.id) !== path));
      const text = describeTopic(area, category, items).join(' ');
      const words = text.trim().split(/\s+/).length;
      assert.ok(words >= 150 && words <= 250, `${path}: ${words} words`);
      assert.ok(!/\bundefined\b|\bnull\b/.test(text), path);
      assert.equal(
        legacyTopicPath({ area: area.id, category: category.id }),
        path
      );
    }
  }
  assert.equal(paths.size, 150);
});

test('every video has a link to each of its real categories', () => {
  for (const video of videos) {
    const links = videoTopicLinks(video.categoryIds);
    assert.equal(links.length, video.categoryIds.length, video.id);
    assert.ok(links.length > 0, video.id);
    assert.ok(
      links.every((link) =>
        /^\/topics\/[a-z0-9-]+\/[a-z0-9-]+$/.test(link.path)
      )
    );
  }
});

test('legacy redirects cannot manufacture an unknown category or incorrect parent', () => {
  assert.equal(
    legacyTopicPath({ area: 'software', category: 'functional-programming' }),
    '/topics/software/functional-programming'
  );
  assert.equal(
    legacyTopicPath({ category: 'functional-programming' }),
    '/topics/software/functional-programming'
  );
  assert.equal(
    legacyTopicPath({ area: 'hardware', category: 'functional-programming' }),
    undefined
  );
  assert.equal(
    legacyTopicPath({ area: 'software', category: '../../admin' }),
    undefined
  );
  assert.equal(legacyTopicPath({ area: 'software' }), undefined);
});
