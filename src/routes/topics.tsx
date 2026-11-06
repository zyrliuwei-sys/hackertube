import { createFileRoute } from '@tanstack/react-router';
import { getTopicDirectory } from '@/server/video-pages';

import { envConfigs } from '@/config';
import { withSocialMetadata } from '@/lib/public-page-head';
import { m } from '@/paraglide/messages.js';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { HackerTubeTopics } from '@/blocks/hackertube-topics';

export const Route = createFileRoute('/topics')({
  loader: async () => ({ ...(await getTopicDirectory()), locale: getLocale() }),
  head: ({ loaderData }) =>
    withSocialMetadata({
      meta: [
        {
          title: `${m['hackertube.nav.topics']({}, { locale: loaderData?.locale })} | ${envConfigs.app_name}`,
        },
        {
          name: 'description',
          content: m['hackertube.brand.topics_description'](
            {},
            { locale: loaderData?.locale }
          ),
        },
      ],
      links: [
        {
          rel: 'canonical',
          href: localizeUrl(`${envConfigs.app_url}/topics`, {
            locale: loaderData?.locale,
          }).href,
        },
      ],
    }),
  component: TopicsPage,
});

function TopicsPage() {
  const { areas, atlas } = Route.useLoaderData();
  return <HackerTubeTopics areas={areas} atlas={atlas} />;
}
