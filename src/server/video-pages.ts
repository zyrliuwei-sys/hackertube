import { createServerFn } from '@tanstack/react-start';

import { TOPIC_PAGE_SIZE, topicPageNumber } from '@/lib/topic-pagination';

export const getTopicPage = createServerFn()
  .validator((data: { area: string; category: string; page?: number }) => {
    if (
      ![data.area, data.category].every((id) => /^[a-z0-9-]{1,100}$/.test(id))
    )
      throw new Error('Invalid topic');
    return { ...data, page: topicPageNumber(data.page) };
  })
  .handler(async ({ data }) => {
    const { listVideos, getCatalogVideos } =
      await import('@/modules/video-catalog/service');
    const { describeTopic } = await import('@/lib/topic-description');
    const catalog = listVideos({ ...data, pageSize: TOPIC_PAGE_SIZE });
    const area = catalog.areas.find((item) => item.id === data.area);
    const category = area?.categories.find((item) => item.id === data.category);
    if (!area || !category) return null;
    if (data.page > Math.max(1, Math.ceil(catalog.total / TOPIC_PAGE_SIZE)))
      return null;
    const inventory = getCatalogVideos().filter(
      (video) =>
        video.areaIds.includes(area.id) &&
        video.categoryIds.includes(category.id)
    );
    return {
      area,
      category,
      videos: catalog.items,
      total: catalog.total,
      page: data.page,
      pages: Math.max(1, Math.ceil(catalog.total / TOPIC_PAGE_SIZE)),
      description: describeTopic(area, category, inventory),
    };
  });

export const getTopicDirectory = createServerFn().handler(async () => {
  const { listVideos, getDiscoveryAtlas } =
    await import('@/modules/video-catalog/service');
  const { areas, sourceTotal, categoriesCount } = listVideos({ pageSize: 1 });
  return { areas, sourceTotal, categoriesCount, atlas: getDiscoveryAtlas() };
});

export const getVideoPage = createServerFn()
  .validator((id: string) => {
    if (!/^[\w-]{11}$/.test(id)) throw new Error('Invalid video ID');
    return id;
  })
  .handler(async ({ data: id }) => {
    const { listVideos } = await import('@/modules/video-catalog/service');
    const video = listVideos({ ids: [id], pageSize: 1 }).items[0] ?? null;
    if (!video) return { video: null, related: [], area: null };
    const catalog = listVideos({ area: video.areaIds[0], pageSize: 5 });
    return {
      video,
      related: catalog.items.filter((item) => item.id !== id).slice(0, 4),
      area: catalog.areas.find((item) => item.id === video.areaIds[0]) ?? null,
    };
  });
