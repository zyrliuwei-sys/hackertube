import type { CuratedPath } from '@/types/editorial';
import type { Video } from '@/types/video-catalog';

import { Link } from '@/core/i18n/navigation';

export function CuratedPathDirectory({
  paths,
}: {
  paths: Omit<CuratedPath, 'stages'>[];
}) {
  return (
    <section className="ht-path-about" aria-labelledby="curated-paths">
      <h2 id="curated-paths">Curated learning paths</h2>
      <p>
        Fixed sequences selected from the archive, with a goal and a reason for
        each video. Study-time ranges are suggested planning budgets for
        viewing, notes and exercises; they are not measured playback durations.
      </p>
      <div className="ht-related-grid">
        {paths.map((path) => (
          <article key={path.slug} className="ht-watch-description">
            <h3>
              <Link href={`/learning-paths/${path.slug}`}>{path.title}</Link>
            </h3>
            <p>{path.description}</p>
            <p>
              Suggested study time: {path.studyHours[0]}–{path.studyHours[1]}{' '}
              hours
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

type PathView = Omit<CuratedPath, 'stages'> & {
  stages: {
    title: string;
    objective: string;
    videos: { videoId: string; reason: string; video: Video }[];
  }[];
};

export function CuratedPathContent({ path }: { path: PathView }) {
  return (
    <article className="ht-watch-wrap">
      <nav className="ht-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <Link href="/learning-paths">Learning paths</Link>
        <span>{path.title}</span>
      </nav>
      <header className="ht-inner-header ht-topic-intro">
        <h1>{path.title}</h1>
        <p>{path.goal}</p>
        <p>
          Suggested study time: {path.studyHours[0]}–{path.studyHours[1]} hours,
          including viewing, notes and practice. This is an editorial estimate,
          not the sum of video runtimes.
        </p>
      </header>
      <ol className="space-y-9">
        {path.stages.map((stage, index) => (
          <li key={stage.title} className="ht-watch-description">
            <h2>
              {index + 1}. {stage.title}
            </h2>
            <p>{stage.objective}</p>
            <ul className="space-y-4">
              {stage.videos.map(({ video, reason }) => (
                <li key={video.id}>
                  <h3>
                    <Link href={`/watch/${video.id}`}>{video.title}</Link>
                  </h3>
                  <p>{reason}</p>
                  {video.duration != null && (
                    <p>
                      Video duration: {Math.ceil(video.duration / 60)} minutes
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="ht-watch-note mt-8">
        These videos are independent works, not an accredited course. Complete
        the suggested exercises to check your understanding.{' '}
        <Link href="/contact">Report a broken link or correction</Link>.
      </p>
    </article>
  );
}
