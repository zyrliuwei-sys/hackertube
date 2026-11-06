import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';

import { useSession } from '@/core/auth/client';
import { usePathname } from '@/core/i18n/navigation';
import { apiPost } from '@/lib/api-client';
import { readCookieConsent } from '@/lib/cookie-consent';
import {
  clientProductEvent,
  setProductTrackingAllowed,
  subscribeProductEvents,
  type ClientProductEvent,
} from '@/lib/product-events';

export function OperationsTracker({ allowed }: { allowed: boolean }) {
  const path = usePathname();
  const { data: session, isPending } = useSession();
  const last = useRef('');
  const visitPending = useRef<Promise<unknown>>(Promise.resolve());
  const eventQueue = useRef<Promise<unknown>>(Promise.resolve());
  const queued = useRef(0);
  const product = useMutation({
    mutationFn: (event: ClientProductEvent) =>
      apiPost('/api/operations/event', event, { keepalive: true }),
    retry: false,
  });
  const track = useMutation({
    mutationFn: (input: { path: string; referrer: string; test: boolean }) =>
      apiPost('/api/operations/visit', input),
    retry: false,
  });
  useEffect(() => {
    if (
      !allowed ||
      readCookieConsent() === 'rejected' ||
      isPending ||
      navigator.doNotTrack === '1' ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl
    )
      return;
    if (
      /^\/(?:admin|api|settings|sign-in|sign-up|reset-password|forgot-password|verify-email)(?:\/|$)/.test(
        path
      )
    )
      return;
    const key = `${session?.user.id ?? 'anonymous'}:${path}`;
    if (last.current === key) return;
    last.current = key;
    visitPending.current = track
      .mutateAsync({
        path: path.slice(0, 191),
        referrer: document.referrer.slice(0, 2048),
        test:
          new URLSearchParams(window.location.search).get('ops_test') === '1',
      })
      .catch(() => {
        last.current = '';
      });
  }, [allowed, isPending, session?.user.id, path, track.mutate]);
  useEffect(() => {
    setProductTrackingAllowed(allowed);
    if (!allowed || isPending) return;
    const receive = (event: ClientProductEvent) => {
      if (
        !allowed ||
        isPending ||
        queued.current >= 20 ||
        navigator.doNotTrack === '1' ||
        (navigator as Navigator & { globalPrivacyControl?: boolean })
          .globalPrivacyControl ||
        readCookieConsent() === 'rejected'
      )
        return;
      const parsed = clientProductEvent.safeParse(event);
      if (!parsed.success) return;
      queued.current++;
      eventQueue.current = eventQueue.current
        .then(async () => {
          await visitPending.current;
          if (readCookieConsent() !== 'rejected')
            await product.mutateAsync(parsed.data);
          await new Promise((resolve) => setTimeout(resolve, 150));
        })
        .catch(() => {})
        .finally(() => {
          queued.current--;
        });
    };
    return subscribeProductEvents(receive);
  }, [allowed, isPending, product.mutateAsync]);
  return null;
}
