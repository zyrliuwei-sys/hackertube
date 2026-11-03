import type { Video } from './video-catalog';

export type LearningLevel = 'beginner' | 'intermediate';

export interface LearningPathInput {
  goal: string;
  level: LearningLevel;
}

export interface LearningPathVideo {
  video: Pick<
    Video,
    | 'id'
    | 'title'
    | 'channel'
    | 'thumbnail'
    | 'recommendations'
    | 'hnUrl'
    | 'whyRecommended'
  >;
  reason: string;
}

export interface LearningStage {
  title: string;
  objective: string;
  exercise: string;
  videos: LearningPathVideo[];
}

export interface LearningPath {
  goal: string;
  level: LearningLevel;
  title: string;
  summary: string;
  mode: 'ai' | 'catalog' | 'example';
  stages: LearningStage[];
  matchedVideos: number;
}
