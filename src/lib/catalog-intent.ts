// Ephemeral navigation intent, consumed on the homepage. No query link for crawlers.
const KEY = 'hackertube:catalog-intent';
export type CatalogIntent =
  { type: 'search'; query: string } | { type: 'saved' };

export function saveCatalogIntent(intent: CatalogIntent) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(intent));
  } catch {
    /* Storage may be unavailable. */
  }
}

export function consumeCatalogIntent(): CatalogIntent | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    const intent = JSON.parse(raw || 'null');
    if (intent?.type === 'saved') return { type: 'saved' };
    if (intent?.type === 'search' && typeof intent.query === 'string')
      return { type: 'search', query: intent.query.slice(0, 200) };
  } catch {
    /* Storage may be unavailable. */
  }
  return null;
}
