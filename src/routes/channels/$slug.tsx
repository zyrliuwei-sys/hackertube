import { createFileRoute, notFound } from '@tanstack/react-router';
import { getChannelPage } from '@/server/editorial-pages';

import { envConfigs } from '@/config';
import { withSocialMetadata } from '@/lib/public-page-head';
import { ChannelDetail } from '@/blocks/hackertube-channels';

export const Route = createFileRoute('/channels/$slug')({
  loader: async ({ params }) => {
    const channel = await getChannelPage({ data: params.slug });
    if (!channel) throw notFound();
    return channel;
  },
  head: ({ loaderData: channel }) =>
    channel
      ? withSocialMetadata({
          meta: [
            {
              title: `${channel.name} Videos & Profile | ${envConfigs.app_name}`,
            },
            { name: 'description', content: channel.summary },
          ],
          links: [
            {
              rel: 'canonical',
              href: `${envConfigs.app_url.replace(/\/$/, '')}/channels/${channel.slug}`,
            },
          ],
        })
      : {},
  component: () => <ChannelDetail channel={Route.useLoaderData()} />,
});
