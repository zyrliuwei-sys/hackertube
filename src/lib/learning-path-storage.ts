import type { LearningPath } from '@/types/learning-path';
import { z } from 'zod';

import { learningPathInput } from './learning-path-input';

export const LEARNING_PATHS_KEY = 'hackertube:learning-paths:v1';
export const LEARNING_PATHS_EVENT = 'hackertube:learning-paths';
const text = z.string().max(2000);
const pathSchema = learningPathInput.extend({
  title: text,
  summary: text,
  mode: z.enum(['ai', 'catalog']),
  matchedVideos: z.number().int().nonnegative(),
  stages: z
    .array(
      z.object({
        title: text,
        objective: text,
        exercise: text,
        videos: z
          .array(
            z.object({
              reason: text,
              video: z.object({
                id: z.string().regex(/^[\w-]{11}$/),
                title: text,
                channel: text,
                thumbnail: z
                  .string()
                  .max(2048)
                  .refine((v) => {
                    if (
                      /^\/imgs\/hackertube\/thumbs\/[\w-]{11}\.(?:jpg|png|webp)$/.test(
                        v
                      )
                    )
                      return true;
                    try {
                      return new URL(v).protocol === 'https:';
                    } catch {
                      return false;
                    }
                  }),
                recommendations: z.number().nonnegative(),
                hnUrl: z
                  .string()
                  .regex(/^https:\/\/news\.ycombinator\.com\/item\?id=\d+$/)
                  .optional(),
                whyRecommended: text,
              }),
            })
          )
          .min(1)
          .max(2),
      })
    )
    .min(1)
    .max(5),
});

export function parseSavedLearningPaths(raw: string | null): LearningPath[] {
  if (!raw || raw.length > 300_000) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.slice(0, 5).flatMap((value) => {
      const result = pathSchema.safeParse(value);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

export function readSavedLearningPaths(): LearningPath[] {
  try {
    return parseSavedLearningPaths(localStorage.getItem(LEARNING_PATHS_KEY));
  } catch {
    return [];
  }
}

export function saveLearningPath(path: LearningPath): boolean {
  if (path.mode === 'example' || !path.stages.length) return false;
  try {
    const validated = pathSchema.parse(path);
    const rest = readSavedLearningPaths().filter(
      (p) => p.goal !== path.goal || p.level !== path.level
    );
    const raw = JSON.stringify([validated, ...rest].slice(0, 5));
    if (raw.length > 300_000) return false;
    localStorage.setItem(LEARNING_PATHS_KEY, raw);
    window.dispatchEvent(new Event(LEARNING_PATHS_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedLearningPaths(): boolean {
  try {
    localStorage.removeItem(LEARNING_PATHS_KEY);
    window.dispatchEvent(new Event(LEARNING_PATHS_EVENT));
    return true;
  } catch {
    return false;
  }
}
