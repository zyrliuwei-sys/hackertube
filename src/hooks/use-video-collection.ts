import { useEffect, useState } from 'react';

const KEY = 'hackertube-ai:saved:v1';
const EVENT = 'hackertube:collection';

function readCollection(): string[] {
  const value: unknown = JSON.parse(localStorage.getItem(KEY) || '[]');
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
}

export function useVideoCollection() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(() => {
    const refresh = () => {
      try {
        setSavedIds(readCollection());
      } catch {
        /* Storage may be unavailable. */
      }
    };
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(EVENT, refresh);
    };
  }, []);
  const toggleSaved = (id: string): 'saved' | 'removed' | 'error' => {
    try {
      const current = readCollection();
      const exists = current.includes(id);
      const next = exists
        ? current.filter((item) => item !== id)
        : [...current.slice(-199), id];
      localStorage.setItem(KEY, JSON.stringify(next));
      setSavedIds(next);
      window.dispatchEvent(new Event(EVENT));
      return exists ? 'removed' : 'saved';
    } catch {
      return 'error';
    }
  };
  return { savedIds, toggleSaved };
}
