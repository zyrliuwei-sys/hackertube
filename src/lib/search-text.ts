/** The router parses JSON scalars in URLs; numeric/boolean words are still text searches. */
export function searchText(value: unknown): string | undefined {
  if (typeof value === 'string') return value.slice(0, 200);
  if (value === null || typeof value === 'number' || typeof value === 'boolean')
    return String(value).slice(0, 200);
  return undefined;
}
