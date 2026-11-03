import { z } from 'zod';

export const learningPathInput = z.object({
  goal: z
    .string()
    .trim()
    .min(5, 'Describe your learning goal in at least 5 characters.')
    .max(200, 'Keep your learning goal under 200 characters.')
    .refine(
      (value) => !/[\u0000-\u001f\u007f]/u.test(value),
      'Use plain text for your learning goal.'
    ),
  level: z.enum(['beginner', 'intermediate']),
});
