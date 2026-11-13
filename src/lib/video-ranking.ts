import type { Video } from '@/types/video-catalog';

/** Distinct HN recommenders lead; archive score only breaks equal-count ties. */
export function compareByRecommendations(a: Video, b: Video) {
  return (
    b.recommendations - a.recommendations ||
    b.score - a.score ||
    a.id.localeCompare(b.id, 'en')
  );
}

// Include the entire four-recommender tier rather than splitting equal counts.
export const EDITORIAL_MIN_RECOMMENDATIONS = 4;

export function selectEditorialVideos(videos: readonly Video[]) {
  return videos
    .filter((video) => video.recommendations >= EDITORIAL_MIN_RECOMMENDATIONS)
    .sort(compareByRecommendations);
}
