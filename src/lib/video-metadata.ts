import type { Video } from '@/types/video-catalog';

export interface YouTubeMetadata {
  source: 'youtube-data-api-v3';
  publishedAt: string;
  duration: string;
  fetchedAt: string;
  updatedAt: string;
}

export const validTimestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
    value
  ) &&
  Number.isFinite(Date.parse(value));

export function durationSeconds(iso: string): number | null {
  const match =
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/.exec(iso);
  if (!match || !match.slice(1).some(Boolean)) return null;
  return (
    Number(match[1] || 0) * 86400 +
    Number(match[2] || 0) * 3600 +
    Number(match[3] || 0) * 60 +
    Number(match[4] || 0)
  );
}

export function enrichVideo(
  video: Video,
  metadata: YouTubeMetadata | undefined
): Video {
  if (
    !metadata ||
    metadata.source !== 'youtube-data-api-v3' ||
    !validTimestamp(metadata.publishedAt) ||
    !validTimestamp(metadata.fetchedAt) ||
    Date.parse(metadata.publishedAt) > Date.now()
  )
    return video;
  const seconds = durationSeconds(metadata.duration);
  return {
    ...video,
    publishedAt: metadata.publishedAt,
    duration: seconds,
    durationIso: seconds && seconds > 0 ? metadata.duration : undefined,
    metadataSource: metadata.source,
    metadataUpdatedAt: metadata.updatedAt,
  };
}
