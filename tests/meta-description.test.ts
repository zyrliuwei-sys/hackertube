import assert from 'node:assert/strict';
import { test } from 'node:test';

import areas from '../src/data/hackertube/areas.json';
import videos from '../src/data/hackertube/videos.json';
import {
  metaDescription,
  topicMetaDescription,
} from '../src/lib/meta-description';
import { describeTopic } from '../src/lib/topic-description';

const terminal = /[.!?。！？]["'”’»）)\]]*$/u;

test('keeps full source sentences, including initials, decimals and quotes', () => {
  for (const text of [
    'C.S. Lewis explains version 3.14. Another complete sentence.',
    'Dr. Smith explains the result. It works.',
    'She said “This works.” Another sentence follows!',
  ])
    assert.equal(metaDescription(text), text);
  const first = 'A complete introduction. ';
  assert.equal(metaDescription(first + 'Word '.repeat(50)), first.trim());
  assert.equal(
    metaDescription('  One sentence.\n Another sentence!  '),
    'One sentence. Another sentence!'
  );
});

test('uses clauses or whole words for an oversized first sentence, without ellipses', () => {
  assert.equal(
    metaDescription('word '.repeat(50) + '. A complete later sentence.'),
    'A complete later sentence.'
  );
  assert.equal(
    metaDescription('This clause is complete; ' + 'word '.repeat(50)),
    'This clause is complete.'
  );
  assert.equal(
    metaDescription('word '.repeat(50)),
    'word '.repeat(32).trim() + '.'
  );
  assert.equal(metaDescription('x'.repeat(159)), 'x'.repeat(159) + '.');
  assert.equal(metaDescription('x'.repeat(161)), '');
  assert.equal(metaDescription(''), '');
  assert.equal(metaDescription('A short description'), 'A short description.');
});

test('all 6,454 summaries and 150 generated topics fit and end in sentence punctuation', () => {
  const sources = videos.map((video) => video.summary);
  for (const area of areas) {
    for (const category of area.categories) {
      sources.push(
        describeTopic(
          area,
          category,
          videos.filter(
            (video) =>
              video.areaIds.includes(area.id) &&
              video.categoryIds.includes(category.id)
          )
        ).join(' ')
      );
      const intro = describeTopic(
        area,
        category,
        videos.filter((video) => video.categoryIds.includes(category.id))
      )[0];
      const topicMeta = topicMetaDescription(category.name, intro);
      assert.ok(topicMeta.length <= 160 && topicMeta.length > 0);
      assert.match(topicMeta, terminal);
    }
  }
  assert.equal(videos.length, 6454);
  assert.equal(sources.length, 6604);
  let fallbacks = 0;
  sources.forEach((source, index) => {
    const output = metaDescription(source);
    assert.ok(
      output.length > 0 && output.length <= 160,
      `${index}: ${output.length}`
    );
    assert.match(output, terminal, `${index}: ${output}`);
    assert.ok(!output.endsWith('…') && !output.endsWith('...'));
    if (!source.replace(/\s+/gu, ' ').trim().startsWith(output)) fallbacks++;
  });
  console.log(
    JSON.stringify({
      sample10Lengths: sources
        .slice(0, 10)
        .map((s) => metaDescription(s).length),
      fallbacks,
    })
  );
});
