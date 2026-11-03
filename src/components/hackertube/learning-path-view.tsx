import { useEffect, useState } from 'react';
import type { LearningPath } from '@/types/learning-path';
import { ArrowUpRight, Check, Download, Play } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

export interface LearningPathLabels {
  example: string;
  ai: string;
  catalog: string;
  fallback: string;
  stages: string;
  videos: string;
  why: string;
  context: string;
  discussion: string;
  practice: string;
  complete: string;
  completed: string;
  progress: string;
  local: string;
  download: string;
  source: string;
  emptyTitle: string;
  emptyText: string;
  browse: string;
  recommenders: string;
}

export function LearningPathView({
  path,
  labels,
}: {
  path: LearningPath;
  labels: LearningPathLabels;
}) {
  const identity = path.stages
    .flatMap((stage) => stage.videos.map(({ video }) => video.id))
    .join(',');
  const storageKey = `hackertube:learning-progress:${identity}`;
  const [completed, setCompleted] = useState<number[]>([]);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      );
      setCompleted(
        Array.isArray(saved)
          ? saved.filter(
              (n) => Number.isInteger(n) && n >= 0 && n < path.stages.length
            )
          : []
      );
    } catch {
      setCompleted([]);
    }
  }, [storageKey, path.stages.length]);
  const toggle = (index: number) => {
    const next = completed.includes(index)
      ? completed.filter((n) => n !== index)
      : [...completed, index];
    setCompleted(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* Progress still works for this visit. */
    }
  };
  const download = () => {
    const text = [
      `# ${path.title}`,
      '',
      path.summary,
      '',
      labels[path.mode],
      '',
      ...path.stages.flatMap((stage, i) => [
        `## ${i + 1}. ${stage.title}`,
        '',
        stage.objective,
        '',
        ...stage.videos.flatMap(({ video, reason }) => [
          `### ${video.title}`,
          `${location.origin}/watch/${video.id}`,
          reason,
          video.hnUrl ? `${labels.discussion}: ${video.hnUrl}` : '',
          '',
        ]),
        `${labels.practice}: ${stage.exercise}`,
        '',
      ]),
      labels.source,
    ].join('\n');
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/markdown;charset=utf-8' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'hackertube-learning-path.md';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  if (!path.stages.length)
    return (
      <div className="ht-path-empty" role="status">
        <h2>{labels.emptyTitle}</h2>
        <p>{labels.emptyText}</p>
        <Link href="/topics">
          {labels.browse}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
    );
  return (
    <div className="ht-path-result">
      <div className="ht-path-result-heading">
        <div>
          <p className="ht-path-mode">{labels[path.mode]}</p>
          <h2 id="ht-path-result-title" tabIndex={-1}>
            {path.title}
          </h2>
          <p className="ht-path-summary">{path.summary}</p>
        </div>
        <button type="button" className="ht-path-export" onClick={download}>
          <Download size={17} aria-hidden="true" />
          {labels.download}
        </button>
      </div>
      {path.mode === 'catalog' && (
        <p className="ht-path-fallback" role="status">
          {labels.fallback}
        </p>
      )}
      <div className="ht-path-meta">
        <span>
          {path.stages.length} {labels.stages}
        </span>
        <span>
          {path.stages.reduce((sum, stage) => sum + stage.videos.length, 0)}{' '}
          {labels.videos}
        </span>
        <span>
          {completed.length}/{path.stages.length} {labels.progress}
        </span>
      </div>
      <ol className="ht-path-stages">
        {path.stages.map((stage, index) => (
          <li
            key={`${identity}:${index}`}
            id={`learning-stage-${index + 1}`}
            className={completed.includes(index) ? 'is-complete' : ''}
          >
            <div className="ht-path-stage-number" aria-hidden="true">
              {completed.includes(index) ? (
                <Check size={20} />
              ) : (
                String(index + 1).padStart(2, '0')
              )}
            </div>
            <div className="ht-path-stage-body">
              <div className="ht-path-stage-heading">
                <h3>{stage.title}</h3>
                <button
                  type="button"
                  className="ht-path-complete"
                  aria-pressed={completed.includes(index)}
                  aria-label={`${labels.complete}: ${stage.title}`}
                  onClick={() => toggle(index)}
                >
                  <Check size={16} aria-hidden="true" />
                  <span>
                    {completed.includes(index)
                      ? labels.completed
                      : labels.complete}
                  </span>
                </button>
              </div>
              <p className="ht-path-objective">{stage.objective}</p>
              <div className="ht-path-video-list">
                {stage.videos.map(({ video, reason }) => (
                  <article className="ht-path-video" key={video.id}>
                    <Link
                      href={`/watch/${video.id}`}
                      className="ht-path-video-image"
                      aria-label={video.title}
                    >
                      <img
                        src={video.thumbnail}
                        alt=""
                        loading="lazy"
                        width="320"
                        height="180"
                        onError={(event) => {
                          const fallback = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                          if (event.currentTarget.src !== fallback)
                            event.currentTarget.src = fallback;
                          else event.currentTarget.hidden = true;
                        }}
                      />
                      <Play size={24} aria-hidden="true" />
                    </Link>
                    <div className="ht-path-video-text">
                      <p className="ht-path-channel">{video.channel}</p>
                      <h4>
                        <Link href={`/watch/${video.id}`}>
                          {video.title}
                          <ArrowUpRight size={15} aria-hidden="true" />
                        </Link>
                      </h4>
                      <p className="ht-path-reason">
                        <strong>{labels.why} </strong>
                        {reason}
                      </p>
                      <details className="ht-path-context">
                        <summary>{labels.context}</summary>
                        <p>{video.whyRecommended}</p>
                        <span>
                          {video.recommendations} {labels.recommenders}
                        </span>
                        {video.hnUrl && (
                          <a
                            href={video.hnUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {labels.discussion}
                            <ArrowUpRight size={14} aria-hidden="true" />
                          </a>
                        )}
                      </details>
                    </div>
                  </article>
                ))}
              </div>
              <div className="ht-path-exercise">
                <span>{labels.practice}</span>
                <p>{stage.exercise}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="ht-path-source">
        {labels.source}
        <br />
        {labels.local}
      </p>
    </div>
  );
}
