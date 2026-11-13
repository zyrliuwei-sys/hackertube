import type { DiscussionContext, WatchEditorial } from '@/types/editorial';

import { Link } from '@/core/i18n/navigation';

export type WatchEditorialView = Omit<WatchEditorial, 'prerequisite'> & {
  prerequisite: { videoId: string; title: string; reason: string } | null;
  discussion: DiscussionContext | null;
};

export function WatchEditorialContent({
  editorial,
  videoId,
}: {
  editorial: WatchEditorialView;
  videoId: string;
}) {
  const discussion = editorial.discussion;
  return (
    <div data-watch-editorial className="ht-watch-description space-y-7">
      {discussion && (
        <section aria-labelledby="why-here">
          <h2 id="why-here">Why it's here</h2>
          <p>
            This video is referenced in the Hacker News discussion{' '}
            <a href={discussion.url} target="_blank" rel="noopener noreferrer">
              {discussion.title}
            </a>
            .
          </p>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {discussion.month && (
              <div>
                <dt>Discussion reference month</dt>
                <dd>
                  <time dateTime={discussion.month}>
                    {new Date(
                      `${discussion.month}-01T00:00:00Z`
                    ).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </time>
                </dd>
              </div>
            )}
            {typeof discussion.score === 'number' && (
              <div>
                <dt>HN score</dt>
                <dd>{discussion.score}</dd>
              </div>
            )}
            {typeof discussion.comments === 'number' && (
              <div>
                <dt>HN comments</dt>
                <dd>{discussion.comments}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
      <section aria-labelledby="what-covers">
        <h2 id="what-covers">What it covers</h2>
        <ul className="list-disc space-y-2 pl-5">
          {editorial.covers.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {editorial.notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </section>
      {!!editorial.moments?.length && (
        <section aria-labelledby="key-moments">
          <h2 id="key-moments">Key moments</h2>
          <ol className="space-y-2">
            {editorial.moments.map((moment) => (
              <li key={moment.seconds}>
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}&t=${moment.seconds}s`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {Math.floor(moment.seconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(moment.seconds % 60).toString().padStart(2, '0')}
                </a>{' '}
                — {moment.description}
              </li>
            ))}
          </ol>
        </section>
      )}
      <section aria-labelledby="who-for">
        <h2 id="who-for">Who it's for / Prerequisites</h2>
        <p>{editorial.audience}</p>
        {editorial.prerequisite && (
          <p>
            <Link href={`/watch/${editorial.prerequisite.videoId}`}>
              {editorial.prerequisite.title}
            </Link>{' '}
            — {editorial.prerequisite.reason}
          </p>
        )}
      </section>
      <section aria-labelledby="editorial-sources" className="text-sm">
        <h2 id="editorial-sources">Sources and review</h2>
        <ul>
          {editorial.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title}
              </a>
            </li>
          ))}
        </ul>
        <p>
          Editorial notes checked:{' '}
          <time dateTime={editorial.reviewedAt}>{editorial.reviewedAt}</time>.{' '}
          <Link href="/contact">Report a correction</Link>.
        </p>
      </section>
    </div>
  );
}
