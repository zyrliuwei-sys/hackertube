import { createFileRoute, notFound } from '@tanstack/react-router';
import { getTopicPage } from '@/server/video-pages';

import { envConfigs } from '@/config';
import { jsonLdScripts, topicSchema } from '@/lib/structured-data';
import { topicPath } from '@/lib/topic-path';
import { HackerTubeTopic } from '@/blocks/hackertube-topic';

export const Route = createFileRoute('/topics_/$area/$category')({
  loader: async ({ params }) => {
    if (
      ![params.area, params.category].every((id) =>
        /^[a-z0-9-]{1,100}$/.test(id)
      )
    )
      throw notFound();
    const topic = await getTopicPage({ data: params });
    if (!topic) throw notFound();
    return topic;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          scripts: jsonLdScripts(
            topicSchema(
              loaderData.category.name,
              topicPath(loaderData.area.id, loaderData.category.id),
              loaderData.description.join(' ')
            )
          ),
          meta: [
            {
              title: `${loaderData.category.name} Videos & Talks | HackerTube`,
            },
            {
              name: 'description',
              content: loaderData.description[0].slice(0, 180),
            },
          ],
          links: [
            {
              rel: 'canonical',
              href: `${envConfigs.app_url.replace(/\/$/, '')}${topicPath(loaderData.area.id, loaderData.category.id)}`,
            },
          ],
        }
      : {},
  component: () => <HackerTubeTopic {...Route.useLoaderData()} />,
});
