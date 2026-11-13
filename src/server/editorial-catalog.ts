import profiles from '@/data/hackertube/channels.json';
import paths from '@/data/hackertube/curated-paths.json';
import contexts from '@/data/hackertube/discussion-context.json';
import batch from '@/data/hackertube/editorial-batch.json';
import records from '@/data/hackertube/watch-editorials.json';
import type {
  ChannelProfile,
  CuratedPath,
  DiscussionContext,
  WatchEditorial,
} from '@/types/editorial';

import { getCatalogVideos } from '@/modules/video-catalog/service';
import { validEditorial, wordCount } from '@/lib/editorial-validation';
import { videoTopicLinks } from '@/lib/topic-path';

const videos = getCatalogVideos();
const ids = new Set(videos.map((video) => video.id));
const selected = new Set(batch.videoIds);

export function getWatchDiscussion(id: string) {
  return selected.has(id)
    ? ((contexts as Record<string, DiscussionContext>)[id] ?? null)
    : null;
}

export function getWatchEditorial(id: string) {
  const record = (records as Record<string, WatchEditorial>)[id];
  if (!selected.has(id) || !record || !validEditorial(record, id, ids))
    return null;
  const prerequisite = record.prerequisite
    ? (videos.find((video) => video.id === record.prerequisite!.videoId) ??
      null)
    : null;
  // A prerequisite must share an actual catalog topic, not an inferred subject.
  const current = videos.find((video) => video.id === id)!;
  if (
    prerequisite &&
    !prerequisite.categoryIds.some((category) =>
      current.categoryIds.includes(category)
    )
  )
    return null;
  return {
    ...record,
    prerequisite:
      prerequisite && record.prerequisite
        ? { ...record.prerequisite, title: prerequisite.title }
        : null,
    discussion: getWatchDiscussion(id),
  };
}

export function getChannelProfiles() {
  return (profiles as ChannelProfile[])
    .filter(
      (profile) =>
        profile.status === 'reviewed' &&
        profile.sources.length > 0 &&
        !/【FILL:|\bTBD\b/.test(profile.bio) &&
        wordCount(profile.bio) >= 100 &&
        wordCount(profile.bio) <= 150
    )
    .map((profile) => {
      const inventory = videos.filter(
        (video) => video.channel === profile.name
      );
      const topics = videoTopicLinks([
        ...new Set(inventory.flatMap((video) => video.categoryIds)),
      ]);
      return { ...profile, videos: inventory, count: inventory.length, topics };
    })
    .filter((profile) => profile.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getCuratedPaths() {
  return (paths as CuratedPath[]).map((path) => ({
    ...path,
    stages: path.stages.map((stage) => ({
      ...stage,
      videos: stage.videos.map((selection) => {
        const video = videos.find((item) => item.id === selection.videoId);
        if (!video)
          throw new Error(`Unknown curated video: ${selection.videoId}`);
        return { ...selection, video };
      }),
    })),
  }));
}
