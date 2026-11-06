import assert from 'node:assert/strict';
import { test } from 'node:test';

import { learningPathInput } from '../src/lib/learning-path-input';
import {
  exampleLearningPath,
  generateLearningPath,
  selectLearningCandidates,
  validateLearningDraft,
  type LearningPathAI,
} from '../src/modules/learning-paths/service';
import { getCatalogVideos } from '../src/modules/video-catalog/service';
import { Route } from '../src/routes/api/learning-paths';

const catalog = getCatalogVideos();
const input = {
  goal: 'learn machine learning from scratch',
  level: 'beginner' as const,
};
const candidates = selectLearningCandidates(input, catalog);
function draft(ids = candidates.slice(0, 8).map((v) => v.id)) {
  return {
    title: 'Learn Machine Learning',
    summary:
      'Develop the foundations, then implement a small model. Some Python knowledge is useful.',
    stages: [0, 1, 2, 3].map((n) => ({
      title: `Concept ${n + 1}`,
      objective: 'Understand this concept before moving to implementation.',
      exercise: 'Implement a small example and describe the outcome.',
      videos: ids.slice(n * 2, n * 2 + 2).map((id) => ({
        id,
        reason:
          'This video introduces a concept that is useful at this point in the sequence.',
      })),
    })),
  };
}

test('the example has the requested progression and eight real, distinct sourced videos', () => {
  const path = exampleLearningPath(catalog);
  assert.equal(path.mode, 'example');
  assert.equal(path.stages.length, 4);
  const selected = path.stages.flatMap((stage) => stage.videos);
  assert.equal(selected.length, 8);
  assert.equal(new Set(selected.map((item) => item.video.id)).size, 8);
  for (const { video, reason } of selected) {
    assert.equal(
      video.title,
      catalog.find((item) => item.id === video.id)?.title
    );
    assert.match(
      video.hnUrl!,
      /^https:\/\/news\.ycombinator\.com\/item\?id=\d+$/u
    );
    assert.ok(reason.length > 30);
  }
  assert.match(path.stages[0].objective, /vectors/u);
  assert.match(path.stages[2].objective, /code/u);
  assert.match(path.stages[3].objective, /transformers/u);
});

test('natural-language and Chinese goals retrieve prerequisites as well as the subject', () => {
  for (const goal of [input.goal, '从零开始学习机器学习']) {
    const selected = selectLearningCandidates({ ...input, goal }, catalog);
    assert.ok(selected.length <= 48);
    assert.ok(selected.some((v) => v.id === 'VMj-3S1tku0'));
    assert.ok(selected.some((v) => v.id === 'kjBOesZCoqc'));
    assert.ok(
      selected.some((v) => v.id === 'zjkBMFhNj_g'),
      'Retain language-model coverage alongside prerequisites and code'
    );
    assert.ok(selected.every((v) => catalog.some((item) => item.id === v.id)));
  }
  assert.equal(
    selectLearningCandidates({ ...input, goal: 'qyzzxflorp zzyqxx' }, catalog)
      .length,
    0
  );
});

test('AI output is reconstructed from trusted catalog records', async () => {
  const ai: LearningPathAI = {
    run: async () => ({ response: JSON.stringify(draft()) }),
  };
  const result = await generateLearningPath(input, catalog, ai);
  assert.equal(result.mode, 'ai');
  assert.equal(result.stages.length, 4);
  assert.equal(result.stages[0].videos[0].video.title, candidates[0].title);
});

test('invented IDs, repeated videos and malformed output cannot become AI recommendations', () => {
  const fake = draft();
  fake.stages[0].videos[0].id = 'NONEXISTENT';
  assert.throws(() => validateLearningDraft(fake, input, candidates));
  const duplicate = draft();
  duplicate.stages[1].videos[0].id = duplicate.stages[0].videos[0].id;
  assert.throws(() => validateLearningDraft(duplicate, input, candidates));
  assert.throws(() =>
    validateLearningDraft({ title: 'bad' }, input, candidates)
  );
});

test('provider outages and invalid selections return an explicitly non-AI path', async () => {
  for (const ai of [
    undefined,
    {
      run: async () => {
        throw new Error('provider failure containing private details');
      },
    },
    { run: async () => ({ response: { ...draft(), stages: [] } }) },
  ]) {
    const path = await generateLearningPath(input, catalog, ai);
    assert.equal(path.mode, 'catalog');
    assert.equal(path.stages.length, 4);
    assert.ok(!JSON.stringify(path).includes('private details'));
  }
});

test('unsupported goals show no fabricated curriculum and skip AI without catalog matches', async () => {
  let calls = 0;
  const path = await generateLearningPath(
    { ...input, goal: 'qyzzxflorp zzyqxx' },
    catalog,
    {
      run: async () => {
        calls++;
        return {};
      },
    }
  );
  assert.equal(path.stages.length, 0);
  assert.equal(calls, 0);
  const unsupported = await generateLearningPath(input, catalog, {
    run: async () => ({ response: { unsupported: true } }),
  });
  assert.equal(unsupported.stages.length, 0);
});

test('learning goals are bounded, trimmed and level-validated', () => {
  assert.equal(
    learningPathInput.parse({ ...input, goal: `  ${input.goal}  ` }).goal,
    input.goal
  );
  for (const value of [
    { goal: 'x' },
    { goal: 'x'.repeat(201) },
    { goal: 'hello\u0000world' },
    { ...input, level: 'expert' },
  ])
    assert.equal(learningPathInput.safeParse(value).success, false);
});

const handler = (
  Route.options.server!.handlers as {
    POST: (context: { request: Request }) => Promise<Response>;
  }
).POST;
let ip = 1;
function request(body: string, headers: Record<string, string> = {}) {
  return new Request('https://hacker-tube.com/api/learning-paths', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-connecting-ip': `192.0.2.${ip++}`,
      ...headers,
    },
    body,
  });
}

test('public API rejects foreign origins, invalid payloads and oversized streamed bodies', async () => {
  for (const [body, headers, expected] of [
    [JSON.stringify(input), { origin: 'https://unrelated.example' }, 403],
    [JSON.stringify(input), { 'content-type': 'text/plain' }, 415],
    ['not json', {}, 400],
    [JSON.stringify({ goal: 'short', level: 'unknown' }), {}, 400],
    ['x'.repeat(2049), {}, 413],
  ] as [string, Record<string, string>, number][]) {
    const response = await handler({ request: request(body, headers) });
    assert.equal(response.status, expected);
    assert.equal((await response.json()).code, -1);
  }
});

test('rapid repeat requests are rate limited before AI generation', async () => {
  const headers = { 'cf-connecting-ip': '198.51.100.70' };
  const first = await handler({
    request: request(JSON.stringify(input), headers),
  });
  assert.equal(first.status, 200);
  const second = await handler({
    request: request(JSON.stringify(input), headers),
  });
  assert.equal(second.status, 429);
  assert.ok(Number(second.headers.get('retry-after')) > 0);
  assert.match(first.headers.get('cache-control')!, /no-store/u);
});
