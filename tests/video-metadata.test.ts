import assert from 'node:assert/strict';
import { test } from 'node:test';

import videos from '../src/data/hackertube/videos.json';
import { topicTagLink } from '../src/lib/topic-path';
import {
  durationSeconds,
  enrichVideo,
  type YouTubeMetadata,
} from '../src/lib/video-metadata';
import { listVideoSitemapEntries } from '../src/modules/video-catalog/service';
import { sitemapUrls } from '../src/server/sitemap';

test('API enrichment uses genuine metadata fields, never HN years', () => {
  const record: YouTubeMetadata = {
    source: 'youtube-data-api-v3',
    publishedAt: '2016-08-06T00:00:00Z',
    duration: 'PT12M34S',
    fetchedAt: new Date().toISOString(),
    updatedAt: '2026-11-02T16:03:09Z',
  };
  const enriched = enrichVideo(videos[0], record);
  assert.equal(enriched.duration, 754);
  assert.equal(enriched.durationIso, 'PT12M34S');
  assert.equal(enriched.publishedAt, record.publishedAt);
  assert.equal(enrichVideo(videos[0], undefined).publishedAt, null);
  assert.equal(
    enrichVideo(videos[0], { ...record, publishedAt: '2018' }).publishedAt,
    null
  );
  assert.equal(
    enrichVideo(videos[0], { ...record, publishedAt: '2999-01-01T00:00:00Z' })
      .publishedAt,
    null
  );
  assert.equal(durationSeconds('12:34'), null);
  assert.equal(durationSeconds('P1DT2H3M4S'), 93784);
});

test('all sitemap video records have stable content dates and keep 6454 URLs', () => {
  const entries = listVideoSitemapEntries();
  assert.equal(entries.length, 6454);
  for (const entry of entries)
    assert.ok(Number.isFinite(Date.parse(entry.lastModified)));
  const xml = sitemapUrls(entries);
  assert.equal((xml.match(/<loc>/g) || []).length, 6454);
  assert.equal((xml.match(/<lastmod>/g) || []).length, 6454);
  assert.equal(sitemapUrls(['/topics']).includes('<lastmod>'), false);
});

test('recognized topic tags link to existing categories, unmatched tags stay actions', () => {
  assert.equal(
    topicTagLink('linear algebra')?.path,
    '/topics/math-theory/pure-mathematics'
  );
  assert.equal(
    topicTagLink('vectors')?.path,
    '/topics/math-theory/pure-mathematics'
  );
  assert.equal(
    topicTagLink('functional programming')?.path,
    '/topics/software/functional-programming'
  );
  assert.equal(topicTagLink('3blue1brown'), undefined);
});
