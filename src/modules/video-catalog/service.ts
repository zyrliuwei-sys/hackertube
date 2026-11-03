import areaData from '@/data/hackertube/areas.json';
import catalogState from '@/data/hackertube/catalog-state.json';
import sourceData from '@/data/hackertube/source.json';
import videoData from '@/data/hackertube/videos.json';
import youtubeMetadata from '@/data/hackertube/youtube-metadata.json';
import type {
  DiscoveryAtlas,
  Video,
  VideoArea,
  VideoCatalogQuery,
  VideoCatalogResult,
} from '@/types/video-catalog';

import {
  enrichVideo,
  validTimestamp,
  type YouTubeMetadata,
} from '@/lib/video-metadata';

const metadata = youtubeMetadata as Record<string, YouTubeMetadata>;
const videos = (videoData as Video[]).map((video) =>
  enrichVideo(video, metadata[video.id])
);
const areas = areaData as VideoArea[];
const categoryNames = new Map(
  areas.flatMap((area) =>
    area.categories.map((category) => [category.id, category.name] as const)
  )
);
const areaNames = new Map(areas.map((area) => [area.id, area.name]));
const normalize = (text: string) =>
  text.normalize('NFKC').toLocaleLowerCase('en');
const searchIndex = new Map(
  videos.map((video) => [
    video.id,
    normalize(
      [
        video.title,
        video.channel,
        video.summary,
        video.whyRecommended,
        video.contentType,
        ...video.topics,
        ...video.areaIds.map((id) => areaNames.get(id) || id),
        ...video.categoryIds.map((id) => categoryNames.get(id) || id),
      ].join(' ')
    ),
  ])
);

export const VIDEO_CONTENT_TYPES = [
  ...new Set(videos.map((video) => video.contentType)),
].sort();

/** Public watch pages in this snapshot; used for crawler discovery. */
export function listVideoIds(): string[] {
  return videos.map((video) => video.id);
}

/** Server-only snapshot for features that need to rank the whole archive. */
export function getCatalogVideos(): readonly Video[] {
  return videos;
}

export function listVideoSitemapEntries() {
  return videos.map((video) => ({
    path: `/watch/${video.id}`,
    lastModified:
      validTimestamp(video.metadataUpdatedAt) &&
      Date.parse(video.metadataUpdatedAt) >
        Date.parse(catalogState.watchPagesUpdatedAt)
        ? video.metadataUpdatedAt
        : catalogState.watchPagesUpdatedAt,
  }));
}

let discoveryCache: DiscoveryAtlas | undefined;

/** Derived only from the public snapshot. No behavioral or similarity claims. */
export function getDiscoveryAtlas(): DiscoveryAtlas {
  if (discoveryCache) return discoveryCache;
  const pairs = new Map<string, number>();
  for (const video of videos) {
    const ids = [...new Set(video.areaIds)].sort();
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = `${ids[i]}|${ids[j]}`;
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
      }
    }
  }
  const featuredIds = [
    'fNk_zzaMoSs',
    'PUv66718DII',
    'NGFhc8R_uO4',
    'aMcJ1Jvtef0',
  ];
  discoveryCache = {
    areas: areas.map((area) => ({
      id: area.id,
      name: area.name,
      count: area.count,
      previews: listVideos({ area: area.id, pageSize: 2 }).items.map(
        ({ id, title, channel }) => ({ id, title, channel })
      ),
    })),
    edges: [...pairs]
      .map(([key, sharedVideos]) => {
        const [source, target] = key.split('|');
        return { source, target, sharedVideos };
      })
      .sort((a, b) => b.sharedVideos - a.sharedVideos),
    featured: featuredIds.map((id) => {
      const video = videos.find((item) => item.id === id)!;
      return {
        id,
        title: video.title,
        channel: video.channel,
        thumbnail:
          id === 'PUv66718DII'
            ? `/imgs/hackertube/thumbs/${id}.jpg`
            : video.thumbnail,
      };
    }),
  };
  return discoveryCache;
}

/** Pure, local catalog search. No network, authentication or database dependency. */
export function listVideos(query: VideoCatalogQuery = {}): VideoCatalogResult {
  const page = Math.min(10_000, Math.max(1, Math.trunc(query.page || 1)));
  const pageSize = Math.min(100, Math.max(1, Math.trunc(query.pageSize || 12)));
  const terms = normalize((query.q || '').slice(0, 200))
    .trim()
    .split(/\s+/u)
    .filter(Boolean);
  const ids =
    query.ids === undefined ? undefined : new Set(query.ids.slice(0, 200));
  const filtered = videos.filter((video) => {
    if (ids && !ids.has(video.id)) return false;
    if (
      query.area &&
      query.area !== 'all' &&
      !video.areaIds.includes(query.area)
    )
      return false;
    if (
      query.category &&
      query.category !== 'all' &&
      !video.categoryIds.includes(query.category)
    )
      return false;
    if (query.type && query.type !== 'all' && video.contentType !== query.type)
      return false;
    if (query.duration && query.duration !== 'all') {
      if (video.duration === null) return false;
      if (query.duration === 'short' && video.duration >= 1_200) return false;
      if (
        query.duration === 'medium' &&
        (video.duration < 1_200 || video.duration >= 3_600)
      )
        return false;
      if (query.duration === 'long' && video.duration < 3_600) return false;
    }
    return terms.every((term) => searchIndex.get(video.id)!.includes(term));
  });
  filtered.sort((a, b) => {
    if (query.sort === 'popular')
      return b.recommendations - a.recommendations || b.score - a.score;
    if (query.sort === 'newest')
      return b.lastRecommendedYear - a.lastRecommendedYear || b.score - a.score;
    return b.score - a.score || b.recommendations - a.recommendations;
  });
  return {
    items: filtered.slice((page - 1) * pageSize, page * pageSize),
    total: filtered.length,
    page,
    pageSize,
    areas,
    categoriesCount: sourceData.categories,
    sourceTotal: videos.length,
    sourceMentions: sourceData.mentions,
    contentTypes: VIDEO_CONTENT_TYPES,
  };
}
