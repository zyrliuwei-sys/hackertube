import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { withSocialMetadata } from '@/lib/public-page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { HackerTubeGuide } from '@/blocks/hackertube-guide';

export const Route = createFileRoute('/guide')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) =>
    withSocialMetadata({
      meta: [
        {
          title: `${m['hackertube.nav.guide']({}, { locale: loaderData?.locale })} | ${envConfigs.app_name}`,
        },
        {
          name: 'description',
          content: m['hackertube.brand.guide_description'](
            {},
            { locale: loaderData?.locale }
          ),
        },
      ],
      links: [
        {
          rel: 'canonical',
          href: localizeUrl(`${envConfigs.app_url}/guide`, {
            locale: loaderData?.locale,
          }).href,
        },
      ],
    }),
  component: HackerTubeGuide,
});
