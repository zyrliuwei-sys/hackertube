import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import { parseStoredFooterBadges } from '../src/features/footer-badges/validation';
import {
  clearSavedLearningPaths,
  LEARNING_PATHS_KEY,
  parseSavedLearningPaths,
  readSavedLearningPaths,
  saveLearningPath,
} from '../src/lib/learning-path-storage';
import { clientProductEvent } from '../src/lib/product-events';
import { withSocialMetadata } from '../src/lib/public-page-head';
import { withSecurityHeaders } from '../src/lib/security-headers';
import { TOPIC_PAGE_SIZE, topicPageNumber } from '../src/lib/topic-pagination';
import {
  generateLearningPath,
  selectLearningCandidates,
  validateLearningDraft,
} from '../src/modules/learning-paths/service';
import {
  getCatalogVideos,
  listVideos,
} from '../src/modules/video-catalog/service';
import { Route as checkout } from '../src/routes/api/payment/checkout';

const catalog = getCatalogVideos();
const pythonInput = {
  goal: 'learn Python programming from scratch',
  level: 'beginner' as const,
};

test('Python beginners get only introductory steps, with honest gaps and Python version caveats', async () => {
  const path = await generateLearningPath(pythonInput, catalog, {
    run: async () => {
      throw new Error('must use verified outline');
    },
  });
  assert.equal(path.mode, 'catalog');
  assert.deepEqual(
    path.stages.flatMap((s) => s.videos.map((v) => v.video.id)),
    ['k6U-i4gXkLM', 'tKTZoB2Vjuk']
  );
  assert.match(path.summary, /Python 3/);
  assert.match(path.summary, /not a complete/);
  assert.ok(
    !selectLearningCandidates(pythonInput, catalog).some((v) =>
      /Monty|expert|114,000/i.test(v.title)
    )
  );
  for (const goal of ['learn web development', 'learn distributed systems']) {
    const candidates = selectLearningCandidates(
      { goal, level: 'beginner' },
      catalog
    );
    assert.ok(candidates.every((v) => ['intro', 'general'].includes(v.level)));
  }
  assert.ok(
    selectLearningCandidates(
      { ...pythonInput, level: 'intermediate' },
      catalog
    ).some((v) => v.id === 'cKPlPJyQrt4')
  );
});

test('AI cannot reverse prerequisites or slip an intermediate talk into a beginner path', () => {
  const ids = ['tKTZoB2Vjuk', 'k6U-i4gXkLM'];
  const draft = {
    title: 'Learn Python',
    summary: 'A sequence of introductory videos.',
    stages: ids.map((id) => ({
      title: 'A stage',
      objective: 'Practice the foundations.',
      exercise: 'Write an example program.',
      videos: [{ id, reason: 'Introduces a useful concept.' }],
    })),
  };
  assert.throws(
    () => validateLearningDraft(draft, pythonInput, catalog),
    /Prerequisite/
  );
  draft.stages[0].videos[0].id = 'cKPlPJyQrt4';
  assert.throws(
    () =>
      validateLearningDraft(
        draft,
        { goal: 'learn programming', level: 'beginner' },
        catalog
      ),
    /Difficulty/
  );
});

test('paths survive a fresh read, are bounded, replace duplicate goals, and reject corrupt or executable data', async () => {
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => data.set(k, v),
      removeItem: (k: string) => data.delete(k),
    },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { dispatchEvent() {} },
  });
  const path = await generateLearningPath(pythonInput, catalog);
  assert.equal(saveLearningPath(path), true);
  assert.deepEqual(readSavedLearningPaths(), [path]);
  // The real ML curriculum includes a locally hosted thumbnail; rejecting
  // every relative URL made the flagship path impossible to save.
  const ml = await generateLearningPath(
    { goal: 'learn machine learning from scratch', level: 'beginner' },
    catalog
  );
  assert.equal(saveLearningPath(ml), true);
  assert.deepEqual(readSavedLearningPaths()[0], ml);
  for (const goal of [
    'learn web development',
    'understand distributed systems',
  ]) {
    const result = await generateLearningPath(
      { goal, level: 'beginner' },
      catalog
    );
    assert.equal(saveLearningPath(result), true);
  }
  for (let i = 0; i < 8; i++)
    assert.equal(
      saveLearningPath({ ...path, goal: `Python learning goal ${i}` }),
      true
    );
  assert.equal(readSavedLearningPaths().length, 5);
  assert.equal(readSavedLearningPaths()[0].goal, 'Python learning goal 7');
  saveLearningPath({
    ...path,
    goal: 'Python learning goal 7',
    title: 'Revised course',
  });
  assert.equal(
    readSavedLearningPaths().filter((p) => p.goal === 'Python learning goal 7')
      .length,
    1
  );
  assert.deepEqual(parseSavedLearningPaths('{bad'), []);
  assert.deepEqual(parseSavedLearningPaths('x'.repeat(300001)), []);
  const unsafe = structuredClone(path);
  unsafe.stages[0].videos[0].video.hnUrl = 'javascript:alert(1)';
  assert.deepEqual(parseSavedLearningPaths(JSON.stringify([unsafe])), []);
  for (const thumbnail of [
    '//evil.example/image.jpg',
    '/imgs/hackertube/thumbs/../private',
    'javascript:alert(1)',
  ]) {
    const invalid = structuredClone(path);
    invalid.stages[0].videos[0].video.thumbnail = thumbnail;
    assert.deepEqual(parseSavedLearningPaths(JSON.stringify([invalid])), []);
  }
  assert.equal(clearSavedLearningPaths(), true);
  assert.equal(data.has(LEARNING_PATHS_KEY), false);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('blocked');
    },
  });
  assert.equal(saveLearningPath(path), false);
  assert.deepEqual(readSavedLearningPaths(), []);
  Reflect.deleteProperty(globalThis, 'window');
  Reflect.deleteProperty(globalThis, 'localStorage');
});

test('retired template plans cannot create checkouts, including concurrent requests', async () => {
  const post = (
    checkout.options.server!.handlers as {
      POST: (ctx: { request: Request }) => Promise<Response>;
    }
  ).POST;
  const results = await Promise.all(
    Array.from({ length: 4 }, () =>
      post({
        request: new Request('https://hacker-tube.com/api/payment/checkout', {
          method: 'POST',
          body: JSON.stringify({ product_id: 'starter_monthly' }),
        }),
      })
    )
  );
  assert.ok(results.every((response) => response.status === 404));
});

test('pagination exposes all topic videos without duplicate cards', () => {
  const first = listVideos({
    area: 'ai-data',
    category: 'llms',
    pageSize: TOPIC_PAGE_SIZE,
  });
  // Use the real taxonomy rather than silently passing with an empty fixture.
  const area = first.areas.find((a) => a.id === 'ai-data')!;
  const category = area.categories.find((c) => c.count > 80)!;
  assert.ok(category);
  const ids: string[] = [];
  const all = listVideos({
    area: area.id,
    category: category.id,
    pageSize: TOPIC_PAGE_SIZE,
  });
  for (let page = 1; page <= Math.ceil(all.total / TOPIC_PAGE_SIZE); page++) {
    const result = listVideos({
      area: area.id,
      category: category.id,
      page,
      pageSize: TOPIC_PAGE_SIZE,
    });
    assert.ok(result.items.length <= 24);
    ids.push(...result.items.map((v) => v.id));
  }
  assert.equal(ids.length, all.total);
  assert.equal(new Set(ids).size, all.total);
  for (const value of [-1, Infinity, 'bad', 1.5, 10001])
    assert.equal(topicPageNumber(value), 1);
  assert.equal(topicPageNumber('2'), 2);
});

test('security headers preserve redirects and cookies; social metadata inherits canonical and image', () => {
  const redirect = withSecurityHeaders(
    Response.redirect('https://hacker-tube.com/guide', 301),
    new URL('https://hacker-tube.com/pricing')
  );
  assert.equal(redirect.status, 301);
  assert.equal(
    redirect.headers.get('location'),
    'https://hacker-tube.com/guide'
  );
  assert.equal(redirect.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(redirect.headers.has('strict-transport-security'));
  const local = withSecurityHeaders(
    new Response('ok', { headers: { 'set-cookie': 'session=x; HttpOnly' } }),
    new URL('http://localhost:3000')
  );
  assert.equal(local.headers.get('set-cookie'), 'session=x; HttpOnly');
  assert.equal(local.headers.has('strict-transport-security'), false);
  const head = withSocialMetadata({
    meta: [
      { title: 'A topic' },
      { name: 'description', content: 'A description' },
      { property: 'og:image', content: 'https://example.test/image.png' },
    ],
    links: [{ rel: 'canonical', href: 'https://example.test/topic?page=2' }],
  });
  assert.equal(head.meta.filter((m) => m.property === 'og:image').length, 1);
  assert.ok(
    head.meta.some(
      (m) => m.property === 'og:url' && m.content?.endsWith('?page=2')
    )
  );
  assert.ok(
    head.meta.some((m) => m.name === 'twitter:title' && m.content === 'A topic')
  );
  assert.equal(
    parseStoredFooterBadges(
      JSON.stringify([
        {
          href: 'https://example.test/',
          alt: 'Example',
          text: '\\nExample\\n Site\\t',
        },
      ])
    )[0].text,
    'Example Site'
  );
});

test('browser telemetry cannot forge generation outcomes, identities or private text', () => {
  for (const input of [
    { kind: 'path_success' },
    { kind: 'search', value: 1, query: 'private' },
    { kind: 'save_video', userId: 'admin' },
    { kind: 'search', value: -1 },
    { kind: 'search' },
    { kind: 'play_attempt', value: 1 },
  ])
    assert.equal(clientProductEvent.safeParse(input).success, false);
  assert.equal(
    clientProductEvent.safeParse({ kind: 'search', value: 0 }).success,
    true
  );
});

test('installed deepmerge patch prevents returned-object prototype poisoning in both merge inputs', () => {
  const require = createRequire(import.meta.url);
  const renderRequire = createRequire(
    createRequire(require.resolve('resend')).resolve('@react-email/render')
  );
  const deepRequire = createRequire(renderRequire.resolve('html-to-text'));
  const merge = deepRequire('deepmerge');
  const payload = JSON.parse('{"__proto__":{"admin":true},"safe":{"value":2}}');
  for (const merged of [
    merge(payload, {}),
    merge(Object.create(null), payload),
    merge({}, payload),
  ]) {
    assert.equal(Object.getPrototypeOf(merged), Object.prototype);
    assert.equal(merged.admin, undefined);
    assert.deepEqual(merged.safe, { value: 2 });
  }
  assert.deepEqual(merge({ a: [1], b: { x: true } }, { a: [2], b: { y: 3 } }), {
    a: [1, 2],
    b: { x: true, y: 3 },
  });
  assert.match(
    readFileSync(deepRequire.resolve('deepmerge'), 'utf8'),
    /function assignOwn/
  );
});

test('first-render search counts wait for the tracker, while opt-out drops buffered activity', async () => {
  const {
    trackProductEvent,
    setProductTrackingAllowed,
    subscribeProductEvents,
  } = await import('../src/lib/product-events');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {},
  });
  const received: unknown[] = [];
  setProductTrackingAllowed(false);
  setProductTrackingAllowed(true);
  trackProductEvent({ kind: 'search', value: 0 });
  const unsubscribe = subscribeProductEvents((event) => received.push(event));
  assert.deepEqual([...received], [{ kind: 'search', value: 0 }]);
  trackProductEvent({ kind: 'play_attempt' });
  assert.equal(received.length, 2);
  unsubscribe();
  trackProductEvent({ kind: 'save_video' });
  setProductTrackingAllowed(false);
  trackProductEvent({ kind: 'play_attempt' });
  setProductTrackingAllowed(true);
  const stop = subscribeProductEvents((event) => received.push(event));
  assert.equal(received.length, 2);
  stop();
  Reflect.deleteProperty(globalThis, 'window');
});
