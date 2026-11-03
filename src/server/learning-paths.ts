import { createServerFn } from '@tanstack/react-start';

export const getExampleLearningPath = createServerFn().handler(async () => {
  const { getCatalogVideos } = await import('@/modules/video-catalog/service');
  const { exampleLearningPath } =
    await import('@/modules/learning-paths/service');
  return exampleLearningPath(getCatalogVideos());
});
