import { getRouteApi } from '@tanstack/react-router';

import { useRouter } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { openCookieSettings } from '@/lib/cookie-consent';
import { m } from '@/paraglide/messages.js';
import { FooterBadgeList } from '@/components/footer-badge-list';
import { HackerFooter } from '@/components/hackertube/editorial-sections';

export function Footer() {
  const router = useRouter();
  const cookieEnabled =
    !!getRouteApi('__root__').useLoaderData()?.cookieConsentEnabled;
  return (
    <HackerFooter
      cookieLabel={m['landing.footer.cookie_settings']()}
      onCookieSettings={cookieEnabled ? openCookieSettings : undefined}
      badges={<FooterBadgeList className="pb-5" />}
      name={envConfigs.app_name}
      tagline={m['hackertube.footer.tagline']()}
      independence={m['hackertube.footer.independence']()}
      guideLabel={m['hackertube.nav.guide']()}
      privacyLabel={m['hackertube.footer.privacy']()}
      termsLabel={m['hackertube.footer.terms']()}
      originalLabel={m['hackertube.nav.original']()}
      dataCredit={m['hackertube.footer.data_credit']()}
      licenseLabel={m['hackertube.footer.license']()}
      onGuide={() => router.push('/guide')}
    />
  );
}
