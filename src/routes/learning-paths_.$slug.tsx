import { createFileRoute, notFound } from '@tanstack/react-router';
import { getCuratedPathPage } from '@/server/editorial-pages';

import { envConfigs } from '@/config';
import { withSocialMetadata } from '@/lib/public-page-head';
import { HackerTubeShell } from '@/blocks/hackertube-shell';
import { CuratedPathContent } from '@/components/hackertube/curated-paths';

export const Route = createFileRoute('/learning-paths_/$slug')({
  loader: async ({ params }) => {
    const path = await getCuratedPathPage({ data: params.slug });
    if (!path) throw notFound();
    return path;
  },
  head: ({ loaderData: path }) =>
    path
      ? withSocialMetadata({
          meta: [
            { title: `${path.title} | ${envConfigs.app_name}` },
            { name: 'description', content: path.description },
          ],
          links: [
            {
              rel: 'canonical',
              href: `${envConfigs.app_url.replace(/\/$/, '')}/learning-paths/${path.slug}`,
            },
          ],
        })
      : {},
  component: () => (
    <HackerTubeShell>
      <CuratedPathContent path={Route.useLoaderData()} />
    </HackerTubeShell>
  ),
});
