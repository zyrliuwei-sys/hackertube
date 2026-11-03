import { createFileRoute } from '@tanstack/react-router';
import { getExampleLearningPath } from '@/server/learning-paths';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { HackerTubeLearningPaths } from '@/blocks/hackertube-learning-paths';

export const Route = createFileRoute('/learning-paths')({
  validateSearch: (search: Record<string, unknown>) => ({
    goal: typeof search.goal === 'string' ? search.goal.slice(0, 200) : '',
  }),
  loader: () => getExampleLearningPath(),
  head: () => ({
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
  return <HackerTubeLearningPaths example={example} initialGoal={goal} />;
}
