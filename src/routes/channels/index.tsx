import { createFileRoute } from '@tanstack/react-router';
import { getChannelDirectory } from '@/server/editorial-pages';

import { envConfigs } from '@/config';
import { withSocialMetadata } from '@/lib/public-page-head';
import { ChannelDirectory } from '@/blocks/hackertube-channels';

export const Route = createFileRoute('/channels/')({
  loader: () => getChannelDirectory(),
  head: () =>
    withSocialMetadata({
      meta: [
        { title: `Video Channels | ${envConfigs.app_name}` },
        {
          name: 'description',
          content:
            'Browse sourced introductions to channels represented in the Hacker News video archive, with their videos and related topics.',
        },
      ],
      links: [
        {
          rel: 'canonical',
          href: `${envConfigs.app_url.replace(/\/$/, '')}/channels`,
        },
      ],
    }),
  component: () => <ChannelDirectory channels={Route.useLoaderData()} />,
});
