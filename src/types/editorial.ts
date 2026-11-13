export interface EditorialSource {
  title: string;
  url: string;
  checkedAt: string;
  kind?: 'transcript' | 'chapters';
}

export interface WatchEditorial {
  status: 'draft' | 'reviewed';
  reviewedAt: string;
  notes: string[];
  covers: string[];
  audience: string;
  prerequisite?: { videoId: string; reason: string };
  moments?: { seconds: number; description: string; sourceUrl: string }[];
  sources: EditorialSource[];
}

export interface DiscussionContext {
  title: string;
  url: string;
  /** The source export supplies only a month, never invent a day. */
  month?: string;
  score?: number;
  comments?: number;
  sourceUrl: string;
}

export interface ChannelProfile {
  slug: string;
  name: string;
  summary: string;
  bio: string;
  status: 'draft' | 'reviewed';
  sources: EditorialSource[];
}

export interface CuratedPath {
  slug: string;
  title: string;
  description: string;
  goal: string;
  /** An editorial study budget including exercises, not measured video runtime. */
  studyHours: [number, number];
  stages: {
    title: string;
    objective: string;
    videos: { videoId: string; reason: string }[];
  }[];
}
