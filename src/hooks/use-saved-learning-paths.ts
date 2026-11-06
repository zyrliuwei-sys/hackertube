import { useEffect, useState } from 'react';
import type { LearningPath } from '@/types/learning-path';

import {
  LEARNING_PATHS_EVENT,
  readSavedLearningPaths,
} from '@/lib/learning-path-storage';

export function useSavedLearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  useEffect(() => {
    const refresh = () => setPaths(readSavedLearningPaths());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(LEARNING_PATHS_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(LEARNING_PATHS_EVENT, refresh);
    };
  }, []);
  return paths;
}
