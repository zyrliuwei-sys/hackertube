import { getAllConfigs } from '@/modules/config/service';
import { recordProductEvent } from '@/modules/operations/service';
import { getCookieFromHeader } from '@/lib/cookie';
import { readVisitorCookie } from '@/lib/operations-cookie';
import type { ProductEventKind } from '@/lib/product-events';

/** Best effort only; analytics must never break search, generation or playback. */
export async function recordRequestProductEvent(
  request: Request,
  kind: ProductEventKind,
  value?: number
) {
  try {
    if (
      request.headers.get('dnt') === '1' ||
      request.headers.get('sec-gpc') === '1' ||
      /bot|crawler|spider|headless/i.test(
        request.headers.get('user-agent') || ''
      )
    )
      return;
    const visitorId = readVisitorCookie(request.headers);
    if (!visitorId) return;
    const consent = getCookieFromHeader(
      request.headers.get('cookie'),
      'cookie_consent'
    );
    if (consent === 'rejected') return;
    const config = await getAllConfigs();
    if (config.cookie_consent_enabled === 'true' && consent !== 'accepted')
      return;
    await recordProductEvent(visitorId, kind, value);
  } catch {
    // Missing migration or telemetry outage: the user action still succeeds.
  }
}
