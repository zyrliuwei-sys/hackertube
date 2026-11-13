import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import profiles from '../src/data/hackertube/channels.json';
import batch from '../src/data/hackertube/editorial-batch.json';
import catalog from '../src/data/hackertube/videos.json';
import records from '../src/data/hackertube/watch-editorials.json';
import { adsenseClient, adsTxt } from '../src/lib/adsense';
import {
  editorialText,
  validEditorial,
  wordCount,
} from '../src/lib/editorial-validation';
import {
  getChannelProfiles,
  getCuratedPaths,
  getWatchEditorial,
} from '../src/server/editorial-catalog';
import type { WatchEditorial } from '../src/types/editorial';

const ids = new Set(catalog.map((video) => video.id));

test('the first editorial batch is bounded, distinct and contains all featured videos', () => {
  assert.equal(batch.limit, 300);
  assert.equal(batch.videoIds.length, 300);
  assert.equal(new Set(batch.videoIds).size, 300);
  for (const id of batch.videoIds) assert.ok(ids.has(id), id);
  for (const id of ['fNk_zzaMoSs', 'PUv66718DII', 'NGFhc8R_uO4', 'aMcJ1Jvtef0'])
    assert.ok(batch.videoIds.includes(id));
  const represented = new Set(
    catalog
      .filter((video) => batch.videoIds.includes(video.id))
      .flatMap((video) => video.areaIds)
  );
  assert.equal(represented.size, 16);
});

test('published watch notes have sources, complete prose and existing same-topic prerequisites', () => {
  for (const [id, raw] of Object.entries(records)) {
    const record = raw as WatchEditorial;
    assert.ok(batch.videoIds.includes(id));
    if (record.status !== 'reviewed') continue;
    assert.ok(
      validEditorial(record, id, ids),
      `${id}: ${wordCount(editorialText(record))} words`
    );
    const visible = getWatchEditorial(id);
    assert.ok(visible, `${id} must not silently fail publication validation`);
    assert.ok(visible.discussion?.title);
    assert.match(
      visible.discussion!.url,
      /^https:\/\/news\.ycombinator\.com\/item\?id=\d+$/
    );
    if (visible.prerequisite) {
      const current = catalog.find((video) => video.id === id)!;
      const prerequisite = catalog.find(
        (video) => video.id === visible.prerequisite!.videoId
      )!;
      assert.ok(
        current.categoryIds.some((category) =>
          prerequisite.categoryIds.includes(category)
        )
      );
    }
  }
});

test('drafts, placeholders, incomplete points and unsupported timestamps fail closed', () => {
  const id = Object.keys(records)[0];
  const valid = records[id as keyof typeof records] as WatchEditorial;
  assert.equal(validEditorial({ ...valid, status: 'draft' }, id, ids), false);
  assert.equal(validEditorial({ ...valid, covers: ['TBD'] }, id, ids), false);
  assert.equal(validEditorial({ ...valid, sources: [] }, id, ids), false);
  assert.equal(
    validEditorial(
      {
        ...valid,
        moments: [
          {
            seconds: 20,
            description: 'Unverified chapter',
            sourceUrl: 'https://example.com',
          },
        ],
      },
      id,
      ids
    ),
    false
  );
  assert.equal(
    getWatchEditorial(
      catalog.find((video) => !batch.videoIds.includes(video.id))!.id
    ),
    null
  );
  assert.equal(getWatchEditorial('nonexistent'), null);
});

test('channel pages only publish sourced biographies and counts derived from the catalog', () => {
  const publicProfiles = getChannelProfiles();
  assert.ok(publicProfiles.length > 0);
  assert.equal(
    new Set(publicProfiles.map((profile) => profile.slug)).size,
    publicProfiles.length
  );
  for (const profile of profiles) {
    if (profile.status !== 'reviewed') continue;
    assert.ok(
      wordCount(profile.bio) >= 100 && wordCount(profile.bio) <= 150,
      profile.slug
    );
    assert.ok(publicProfiles.some((item) => item.slug === profile.slug));
  }
  for (const [index, profile] of publicProfiles.entries()) {
    assert.equal(
      profile.count,
      catalog.filter((video) => video.channel === profile.name).length
    );
    if (index) assert.ok(publicProfiles[index - 1].count >= profile.count);
    assert.ok(
      profile.sources.every((source) => source.url.startsWith('https://'))
    );
  }
});

test('eight curated paths have complete goals, four to seven stages and real video selections', () => {
  const paths = getCuratedPaths();
  assert.equal(paths.length, 8);
  assert.equal(new Set(paths.map((path) => path.slug)).size, 8);
  assert.equal(new Set(paths.map((path) => path.title)).size, 8);
  for (const path of paths) {
    assert.ok(
      wordCount(path.goal) >= 60 && wordCount(path.goal) <= 100,
      path.slug
    );
    assert.ok(path.stages.length >= 4 && path.stages.length <= 7);
    assert.ok(
      path.studyHours[0] > 0 && path.studyHours[1] >= path.studyHours[0]
    );
    for (const stage of path.stages) {
      assert.ok(stage.videos.length >= 1 && stage.videos.length <= 3);
      for (const { video, reason } of stage.videos) {
        assert.ok(ids.has(video.id));
        assert.ok(reason.length > 40);
      }
    }
  }
});

test('ads.txt and the loader share a strict publisher identifier and reject placeholders', () => {
  for (const input of [
    '',
    'pub-【PUBLISHER_ID】',
    'pub-123',
    '<script>',
    'ca-pub-1234567890123456&x=1',
  ]) {
    assert.equal(adsenseClient(input), '');
    assert.equal(adsTxt(input), '');
  }
  // Test-only syntactically valid ID; never used as application configuration.
  assert.equal(
    adsTxt('ca-pub-1234567890123456'),
    'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n'
  );
  assert.equal(
    adsenseClient('pub-1234567890123456'),
    'ca-pub-1234567890123456'
  );
});

test('new information pages meet their editorial length and advertising disclosure requirements', () => {
  for (const [slug, min, max] of [
    ['about', 400, 600],
    ['contact', 150, 250],
  ] as const) {
    const text = readFileSync(`src/content/pages/${slug}.en.mdx`, 'utf8').split(
      '};'
    )[1];
    const body = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    assert.ok(
      wordCount(body) >= min && wordCount(body) <= max,
      `${slug}: ${wordCount(body)} words`
    );
    assert.doesNotMatch(body, /【FILL:|\bTBD\b/);
  }
  const privacy = readFileSync(
    'src/content/pages/privacy-policy.en.mdx',
    'utf8'
  );
  for (const term of [
    '## Advertising',
    'Google AdSense',
    'third-party vendors',
    'advertising cookies',
    'https://www.google.com/settings/ads',
    'https://www.aboutads.info/choices/',
  ])
    assert.ok(privacy.includes(term));
});
