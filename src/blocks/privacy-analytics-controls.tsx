import { saveCookieConsent } from '@/lib/cookie-consent';
import { m } from '@/paraglide/messages.js';
import { useCookieConsent } from '@/hooks/use-cookie-consent';

export function PrivacyAnalyticsControls() {
  const consent = useCookieConsent(null);
  return (
    <div className="my-5 space-y-3 rounded-lg border p-4">
      <p role="status">
        {consent === 'rejected'
          ? m['privacy.analytics.off']()
          : m['privacy.analytics.on']()}
      </p>
      <button
        type="button"
        className="rounded-md border px-4 py-2 text-sm"
        onClick={() =>
          saveCookieConsent(consent === 'rejected' ? 'accepted' : 'rejected')
        }
      >
        {consent === 'rejected'
          ? m['privacy.analytics.allow']()
          : m['privacy.analytics.reject']()}
      </button>
    </div>
  );
}
