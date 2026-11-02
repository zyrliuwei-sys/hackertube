export interface Video {
  id: string;
  title: string;
  channel: string;
  summary: string;
  whyRecommended: string;
  /** The public export intentionally excludes YouTube API metadata. */
  duration: number | null;
  publishedAt: string | null;
  thumbnail: string;
  areaIds: string[];
  categoryIds: string[];
  topics: string[];
  /** Distinct positive recommenders, not total HN mentions. */
  recommendations: number;
  mentions: number;
  score: number;
  contentType: string;
  level: string;
  shelfLife: string;
  firstRecommendedYear: number;
  lastRecommendedYear: number;
  hnUrl?: string;
}

export interface VideoCategory {
  id: string;
  name: string;
  count: number;
}

export interface VideoArea {
  id: string;
  name: string;
  count: number;
  categories: VideoCategory[];
}

export type VideoSort = 'recommended' | 'popular' | 'newest';
export type VideoDuration = 'all' | 'short' | 'medium' | 'long';

export interface VideoCatalogQuery {
  q?: string;
  area?: string;
  category?: string;
  type?: string;
  duration?: VideoDuration;
  sort?: VideoSort;
  page?: number;
  pageSize?: number;
  /** An explicit empty array returns an empty list, useful for saved videos. */
  ids?: string[];
}

export interface VideoCatalogResult {
  items: Video[];
  total: number;
  page: number;
  pageSize: number;
  areas: VideoArea[];
  categoriesCount: number;
  sourceTotal: number;
  sourceMentions: number;
  contentTypes: string[];
}

export interface DiscoveryAtlas {
  areas: (Pick<VideoArea, 'id' | 'name' | 'count'> & {
    previews: Pick<Video, 'id' | 'title' | 'channel'>[];
  })[];
  /** Videos assigned to both areas, not shared viewers or recommenders. */
  edges: { source: string; target: string; sharedVideos: number }[];
  featured: Pick<Video, 'id' | 'title' | 'channel' | 'thumbnail'>[];
}
