import assert from 'node:assert/strict';
import { test } from 'node:test';
import { defaultStringifySearch } from '@tanstack/react-router';

import { toNavigateOptions } from '../src/core/i18n/navigation';
import { attributionCookies } from '../src/lib/attribution';
import { searchText } from '../src/lib/search-text';
import { parseVideoCollection } from '../src/lib/video-collection';

test('URL navigation preserves typed pagination, text punctuation, repeated values and hashes', () => {
  const topic = toNavigateOptions('/topics/ai-data/llms-generative-ai?page=2');
  assert.equal(defaultStringifySearch(topic.search), '?page=2');
  assert.deepEqual(toNavigateOptions('/topics').search, {});
  const query = toNavigateOptions('/?q=why?&tag=a&tag=b#part#2');
  assert.equal((query.search as Record<string, unknown>).q, 'why?');
  assert.deepEqual((query.search as Record<string, unknown>).tag, ['a', 'b']);
  assert.equal(query.hash, 'part#2');
  for (const text of ['1984', 'true', 'null', 'hello world'])
    assert.equal(
      searchText(
        (
          toNavigateOptions(`/?q=${encodeURIComponent(text)}`).search as Record<
            string,
            unknown
          >
        ).q
      ),
      text
    );
  assert.equal(searchText({ goal: 'untrusted object' }), undefined);
  assert.equal(searchText(undefined), undefined);
});

test('damaged, oversized or invalid collections recover without accepting invalid video IDs', () => {
  for (const raw of [null, '{broken', 'null', '{}', 'x'.repeat(100001)])
    assert.deepEqual(parseVideoCollection(raw), []);
  assert.deepEqual(
    parseVideoCollection(
      JSON.stringify([
        'k6U-i4gXkLM',
        'k6U-i4gXkLM',
        null,
        'javascript:x',
        'tKTZoB2Vjuk',
      ])
    ),
    ['k6U-i4gXkLM', 'tKTZoB2Vjuk']
  );
  const ids = Array.from({ length: 205 }, (_, n) =>
    String(n).padStart(11, '0')
  );
  assert.deepEqual(parseVideoCollection(JSON.stringify(ids)), ids.slice(-200));
});

test('attribution honors rejection, browser signals and consent-required mode, preserving first touch', () => {
  const request = (headers: Record<string, string> = {}) =>
    new Request(
      'https://example.test/?utm_source=launch&utm_campaign=release',
      {
        headers: {
          accept: 'text/html',
          referer: 'https://source.example/story?private=1',
          ...headers,
        },
      }
    );
  for (const headers of [
    { cookie: 'cookie_consent=rejected' },
    { dnt: '1' },
    { 'sec-gpc': '1' },
  ] as Record<string, string>[])
    assert.deepEqual(
      attributionCookies(request(headers), false, 'example.test'),
      []
    );
  assert.deepEqual(attributionCookies(request(), true, 'example.test'), []);
  const accepted = attributionCookies(
    request({ cookie: 'cookie_consent=accepted' }),
    true,
    'example.test'
  );
  assert.equal(accepted.length, 3);
  assert.ok(accepted.every((c) => c.includes('SameSite=Lax; Secure')));
  assert.ok(
    accepted.includes(
      'first_referrer=https%3A%2F%2Fsource.example%2Fstory; Max-Age=2592000; Path=/; SameSite=Lax; Secure'
    )
  );
  assert.deepEqual(
    attributionCookies(
      request({
        cookie:
          'utm_source=original; utm_campaign=original; first_referrer=https%3A%2F%2Foriginal.example',
      }),
      false,
      'example.test'
    ),
    []
  );
  assert.deepEqual(
    attributionCookies(
      request({ accept: 'application/json' }),
      false,
      'example.test'
    ),
    []
  );
});
