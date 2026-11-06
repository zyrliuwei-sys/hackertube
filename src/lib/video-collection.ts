export const VIDEO_COLLECTION_KEY = 'hackertube-ai:saved:v1';

/** A damaged local value should not permanently prevent saving new videos. */
export function parseVideoCollection(raw: string | null): string[] {
  if (!raw || raw.length > 100_000) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string =>
                typeof id === 'string' && /^[\w-]{11}$/.test(id)
            )
          ),
        ].slice(-200)
      : [];
  } catch {
    return [];
  }
}
