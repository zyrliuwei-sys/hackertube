import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { getExampleLearningPath } from '@/server/learning-paths';

import { envConfigs } from '@/config';
import { withSocialMetadata } from '@/lib/public-page-head';
import { searchText } from '@/lib/search-text';
import { m } from '@/paraglide/messages.js';
import { HackerTubeLearningPaths } from '@/blocks/hackertube-learning-paths';

export const Route = createFileRoute('/learning-paths')({
  validateSearch: (search: Record<string, unknown>) => ({
    goal: searchText(search.goal) ?? '',
  }),
  search: { middlewares: [stripSearchParams({ goal: '' })] },
  loader: () => getExampleLearningPath(),
  head: () =>
    withSocialMetadata({
      meta: [
        {
          title: `${m['hackertube.paths.meta_title']()} | ${envConfigs.app_name}`,
        },
        {
          name: 'description',
          content: m['hackertube.paths.meta_description'](),
        },
      ],
      links: [
        {
          rel: 'canonical',
          href: `${envConfigs.app_url.replace(/\/$/, '')}/learning-paths`,
        },
      ],
    }),
  component: LearningPathsPage,
});

function LearningPathsPage() {
  const example = Route.useLoaderData();
  const { goal } = Route.useSearch();
  return (
    <HackerTubeLearningPaths key={goal} example={example} initialGoal={goal} />
  );
}
