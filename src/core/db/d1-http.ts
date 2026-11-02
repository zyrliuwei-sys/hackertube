type Query = { sql: string; params: unknown[] };
type RawResult = {
  success: boolean;
  meta: Record<string, unknown>;
  results: { columns: string[]; rows: unknown[][] };
};

/** D1's prepared-statement interface over its official REST batch endpoint. */
export function createD1HttpBinding(
  execute: (queries: Query[]) => Promise<RawResult[]>
) {
  function asResult(result: RawResult) {
    const { columns, rows } = result.results;
    return {
      success: result.success,
      meta: result.meta,
      results: rows.map((row) =>
        Object.fromEntries(columns.map((column, index) => [column, row[index]]))
      ),
    };
  }

  class Statement {
    constructor(readonly query: Query) {}

    bind(...params: unknown[]) {
      return new Statement({ sql: this.query.sql, params });
    }

    async all() {
      return asResult((await execute([this.query]))[0]);
    }

    run() {
      return this.all();
    }

    async raw(options?: { columnNames?: boolean }) {
      const { columns, rows } = (await execute([this.query]))[0].results;
      return options?.columnNames ? [columns, ...rows] : rows;
    }

    async first(column?: string) {
      const row = (await this.all()).results[0];
      return row ? (column === undefined ? row : row[column]) : null;
    }
  }

  return {
    prepare(sql: string) {
      return new Statement({ sql, params: [] });
    },
    async batch(statements: Statement[]) {
      // One request preserves D1's all-or-nothing batch semantics.
      return (
        await execute(statements.map((statement) => statement.query))
      ).map(asResult);
    },
  };
}
