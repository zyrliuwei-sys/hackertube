import { useEffect, useState } from 'react';

import { trackProductEvent } from '@/lib/product-events';
import {
  VIDEO_COLLECTION_KEY as KEY,
  parseVideoCollection,
} from '@/lib/video-collection';

const EVENT = 'hackertube:collection';

function readCollection(): string[] {
  return parseVideoCollection(localStorage.getItem(KEY));
}

export function useVideoCollection() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(() => {
    const refresh = () => {
      try {
        setSavedIds(readCollection());
      } catch {
        setSavedIds([]);
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
    if (!/^[\w-]{11}$/.test(id)) return 'error';
    try {
      const current = readCollection();
      const exists = current.includes(id);
      const next = exists
        ? current.filter((item) => item !== id)
        : [...current.slice(-199), id];
      localStorage.setItem(KEY, JSON.stringify(next));
      setSavedIds(next);
      window.dispatchEvent(new Event(EVENT));
      trackProductEvent({ kind: exists ? 'remove_saved_video' : 'save_video' });
      return exists ? 'removed' : 'saved';
    } catch {
      return 'error';
    }
  };
  return { savedIds, toggleSaved };
}
