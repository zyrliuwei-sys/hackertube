import { createServerFn } from '@tanstack/react-start';

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
