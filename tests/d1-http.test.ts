import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { createClient } from '@libsql/client';

import { createD1HttpBinding } from '../src/core/db/d1-http';

const directory = await mkdtemp(join(tmpdir(), 'hackertube-d1-http-'));
const client = createClient({ url: `file:${directory}/test.db` });
let requests = 0;
const binding = createD1HttpBinding(async (queries) => {
  requests++;
  const results = await client.batch(
    queries.map(({ sql, params }) => ({ sql, args: params as any[] })),
    'write'
  );
  return results.map((result) => ({
    success: true,
    meta: { changes: result.rowsAffected },
    results: {
      columns: result.columns,
      rows: result.rows.map((row) => Array.from(row)),
    },
  }));
});
await client.execute(
  'CREATE TABLE counter (id TEXT PRIMARY KEY, value INTEGER NOT NULL)'
);
after(async () => {
  client.close();
  await rm(directory, { recursive: true, force: true });
});

test('D1 HTTP keeps bound input separate from SQL and preserves raw column order', async () => {
  const value = "'); DROP TABLE counter; --";
  const statement = binding.prepare('SELECT ? AS z, ? AS a').bind(value, 7);
  assert.deepEqual(await statement.raw(), [[value, 7]]);
  assert.deepEqual(await statement.raw({ columnNames: true }), [
    ['z', 'a'],
    [value, 7],
  ]);
  assert.deepEqual(await statement.first(), { z: value, a: 7 });
  assert.equal(await statement.first('a'), 7);
  assert.equal(await binding.prepare('SELECT * FROM counter').first(), null);
});

test('D1 HTTP submits the whole batch once and retains write metadata', async () => {
  const before = requests;
  const results = await binding.batch([
    binding.prepare('INSERT INTO counter VALUES (?, ?)').bind('ok', 10),
    binding
      .prepare('UPDATE counter SET value = value + ? WHERE id = ?')
      .bind(2, 'ok'),
    binding.prepare('SELECT value FROM counter WHERE id = ?').bind('ok'),
  ]);
  assert.equal(requests - before, 1);
  assert.equal(results[0].meta.changes, 1);
  assert.deepEqual(results[2].results, [{ value: 12 }]);
});

test('a failing guard rolls back earlier writes and preserves the D1 constraint error', async () => {
  await assert.rejects(
    binding.batch([
      binding
        .prepare('UPDATE counter SET value = value - 20 WHERE id = ?')
        .bind('ok'),
      binding
        .prepare(
          'UPDATE counter SET value = CASE WHEN value >= 0 THEN value ELSE NULL END WHERE id = ?'
        )
        .bind('ok'),
    ]),
    /NOT NULL constraint failed: counter.value/
  );
  assert.equal(
    await binding
      .prepare('SELECT value FROM counter WHERE id = ?')
      .bind('ok')
      .first('value'),
    12
  );
});
