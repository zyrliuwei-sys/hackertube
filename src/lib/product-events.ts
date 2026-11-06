import { z } from 'zod';

import { readCookieConsent } from './cookie-consent';

export const clientProductEvent = z
  .object({
    kind: z.enum([
      'search',
      'play_attempt',
      'youtube_open',
      'save_video',
      'remove_saved_video',
    ]),
    value: z.number().int().min(0).max(100_000).optional(),
  })
  .strict()
  .refine((event) =>
    event.kind === 'search'
      ? event.value !== undefined
      : event.value === undefined
  );
export type ClientProductEvent = z.infer<typeof clientProductEvent>;
export type ProductEventKind =
  | ClientProductEvent['kind']
  | 'page_view'
  | 'video_open'
  | 'path_started'
  | 'path_success'
  | 'path_fallback'
  | 'path_unsupported'
  | 'path_failed';
let trackingAllowed = true;
const listeners = new Set<(event: ClientProductEvent) => void>();
let pending: ClientProductEvent[] = [];

export function setProductTrackingAllowed(allowed: boolean) {
  trackingAllowed = allowed;
  if (!allowed) pending = [];
}

export function subscribeProductEvents(
  listener: (event: ClientProductEvent) => void
) {
  listeners.add(listener);
  const buffered = pending;
  pending = [];
  buffered.forEach(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** No goal, query, video title or user ID crosses this client event boundary. */
export function trackProductEvent(event: ClientProductEvent) {
  if (
    typeof window === 'undefined' ||
    !trackingAllowed ||
    readCookieConsent() === 'rejected' ||
    navigator.doNotTrack === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl
  )
    return;
  const parsed = clientProductEvent.safeParse(event);
  if (!parsed.success) return;
  // Child effects can report a search before the root tracker has resolved auth.
  // Keep only bounded, non-sensitive counts until that subscriber is ready.
  if (!listeners.size) {
    if (pending.length < 20) pending.push(parsed.data);
    return;
  }
  listeners.forEach((listener) => listener(parsed.data));
}

export interface ProductReport {
  available: boolean;
  trackingSince: string | null;
  visitors: number;
  returning: number;
  active: number;
  counts: Partial<Record<ProductEventKind, number>>;
  zeroResultSearches: number;
  averagePathMs: number | null;
  days: { day: string; visitors: number; returning: number; active: number }[];
}
