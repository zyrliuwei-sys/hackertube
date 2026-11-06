import {
  createFileRoute,
  notFound,
  stripSearchParams,
} from '@tanstack/react-router';
import { getTopicPage } from '@/server/video-pages';

import { envConfigs } from '@/config';
import { topicMetaDescription } from '@/lib/meta-description';
import { withSocialMetadata } from '@/lib/public-page-head';
import { jsonLdScripts, topicSchema } from '@/lib/structured-data';
import { topicPageNumber, topicPageUrl } from '@/lib/topic-pagination';
import { topicPath } from '@/lib/topic-path';
import { HackerTubeTopic } from '@/blocks/hackertube-topic';

export const Route = createFileRoute('/topics_/$area/$category')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: topicPageNumber(search.page),
  }),
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ params, deps }) => {
    if (
      ![params.area, params.category].every((id) =>
        /^[a-z0-9-]{1,100}$/.test(id)
      )
    )
      throw notFound();
    const topic = await getTopicPage({ data: { ...params, page: deps.page } });
    if (!topic) throw notFound();
    return topic;
  },
  head: ({ loaderData }) =>
    loaderData
      ? withSocialMetadata({
          scripts: jsonLdScripts(
            topicSchema(
              loaderData.category.name,
              topicPath(loaderData.area.id, loaderData.category.id),
              loaderData.description.join(' ')
            )
          ),
          meta: [
            {
              title: `${loaderData.category.name} Videos & Talks${loaderData.page > 1 ? ` — Page ${loaderData.page}` : ''} | HackerTube`,
            },
            {
              name: 'description',
              content: topicMetaDescription(
                loaderData.category.name,
                loaderData.description[0]
              ),
            },
          ],
          links: [
            {
              rel: 'canonical',
              href: `${envConfigs.app_url.replace(/\/$/, '')}${topicPageUrl(topicPath(loaderData.area.id, loaderData.category.id), loaderData.page)}`,
            },
          ],
        })
      : {},
  component: () => <HackerTubeTopic {...Route.useLoaderData()} />,
});
