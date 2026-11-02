/** Verify deployed raw SSR responses with curl: node scripts/check-seo-followup.mjs [origin] */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const origin = (process.argv[2] || 'https://hacker-tube.com').replace(
  /\/$/,
  ''
);
const get = (path) =>
  execFileSync('curl', ['-fsS', '--max-time', '30', `${origin}${path}`], {
    encoding: 'utf8',
    maxBuffer: 8_000_000,
  });
const decode = (value) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
const paths = [
  '/topics/software/functional-programming',
  '/topics/software/web-development',
  '/topics/ai-data/llms-generative-ai',
  '/topics/math-theory/pure-mathematics',
  '/topics/systems-security/distributed-systems',
  '/watch/fNk_zzaMoSs',
  '/watch/FITJMJjASUs',
  '/watch/NGFhc8R_uO4',
  '/watch/Unzc731iCUY',
  '/watch/VMj-3S1tku0',
];
const cache = JSON.parse(
  readFileSync(
    new URL('../src/data/hackertube/youtube-metadata.json', import.meta.url),
    'utf8'
  )
);
const results = [];
for (const path of ['/', ...paths]) {
  const html = get(path);
  const head = html.split('</head>')[0];
  const description = decode(
    head.match(/name="description" content="([^"]*)/)?.[1] || ''
  );
  assert.ok(!/rel="alternate"/i.test(head), `${path}: unwanted alternate`);
  assert.ok(
    !/<a\b[^>]*href="\/\?[^" ]*(?:q|collection)=/i.test(html),
    `${path}: query anchor`
  );
  if (path !== '/') {
    assert.ok(description.length <= 160 && description.length > 0, path);
    assert.match(description, /[.!?]["'”’)]*$/, path);
  }
  const schemas = [
    ...head.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs
    ),
  ].map((match) => JSON.parse(match[1]));
  if (path.startsWith('/watch/')) {
    const id = path.slice('/watch/'.length);
    const schema = schemas.find((schema) => schema['@type'] === 'VideoObject');
    if (!cache[id])
      assert.equal(schema, undefined, `${path}: unverified VideoObject`);
    else {
      assert.equal(schema?.uploadDate, cache[id].publishedAt);
      assert.equal(schema?.duration, cache[id].duration);
      assert.equal(schema?.publisher?.name, 'HackerTube AI');
    }
  }
  results.push({
    path,
    alternate: 0,
    description,
    length: description.length,
    videoObject: schemas.some((schema) => schema['@type'] === 'VideoObject'),
  });
}
const sitemap = get('/sitemap-videos.xml');
const locs = (sitemap.match(/<loc>/g) || []).length;
const lastmods = [...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map(
  (match) => match[1]
);
assert.equal(locs, 6454);
assert.equal(lastmods.length, locs);
assert.ok(
  lastmods.every(
    (date) =>
      Number.isFinite(Date.parse(date)) && Date.parse(date) <= Date.now()
  )
);
console.log(
  JSON.stringify(
    {
      origin,
      results,
      sitemap: { locs, lastmods: lastmods.length, example: lastmods[0] },
      verifiedMetadataRecords: Object.keys(cache).length,
      metadataStatus: Object.keys(cache).length
        ? 'API records checked against SSR'
        : 'Pending YouTube API key; all unverified VideoObjects suppressed',
    },
    null,
    2
  )
);
