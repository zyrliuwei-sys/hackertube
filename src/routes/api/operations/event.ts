import { createFileRoute } from '@tanstack/react-router';
import { recordRequestProductEvent } from '@/server/product-events';

import { getAuth } from '@/core/auth';
import { clientProductEvent } from '@/lib/product-events';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respErr, respOk } from '@/lib/resp';

async function POST({ request }: { request: Request }) {
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return respErr('Same-origin request required', { status: 403 });
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 100,
    keyPrefix: 'product-event',
  });
  if (limited) return limited;
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return respErr('JSON required', { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) return respErr('Missing event', { status: 400 });
  let size = 0;
  let body = '';
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 512) {
        await reader.cancel();
        return respErr('Request too large', { status: 413 });
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    const parsed = clientProductEvent.safeParse(JSON.parse(body));
    if (!parsed.success) return respErr('Invalid event', { status: 400 });
    const session = await getAuth().api.getSession({
      headers: request.headers,
    });
    if (session?.user) {
      const limitedUser = enforceMinIntervalRateLimit(request, {
        intervalMs: 100,
        keyPrefix: 'product-event-user',
        extraKey: session.user.id,
      });
      if (limitedUser) return limitedUser;
    }
    await recordRequestProductEvent(
      request,
      parsed.data.kind,
      parsed.data.value
    );
    return respOk({ headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return respErr('Invalid event', { status: 400 });
  } finally {
    reader.releaseLock();
  }
}
export const Route = createFileRoute('/api/operations/event')({
  server: { handlers: { POST } },
});
