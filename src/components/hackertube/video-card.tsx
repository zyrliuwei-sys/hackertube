import { useState } from 'react';
import type { Video } from '@/types/video-catalog';
import { ArrowUpRight, Bookmark, MessageSquare, Play } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

interface VideoCardProps {
  href?: string;
  video: Video;
  saved: boolean;
  playLabel: string;
  saveLabel: string;
  recommendationLabel: string;
  typeLabel: string;
  imageUnavailableLabel: string;
  onPlay: () => void;
  onSave: () => void;
}

export function VideoCard({
  href,
  video,
  saved,
  playLabel,
  saveLabel,
  recommendationLabel,
  typeLabel,
  imageUnavailableLabel,
  onPlay,
  onSave,
}: VideoCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="ht-video-card">
      <div className="ht-video-frame">
        <Link
          className="ht-video-open"
          href={href ?? `/watch/${video.id}`}
          onClick={
            href
              ? undefined
              : (event) => {
                  if (
                    event.button === 0 &&
                    !event.metaKey &&
                    !event.ctrlKey &&
                    !event.shiftKey &&
                    !event.altKey
                  ) {
                    event.preventDefault();
                    onPlay();
                  }
                }
          }
          aria-label={playLabel}
        >
          {!imageFailed ? (
            <img
              src={video.thumbnail}
              alt=""
              loading="lazy"
              width="480"
              height="270"
              onError={(e) => {
                const fallback = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                if (e.currentTarget.src !== fallback)
                  e.currentTarget.src = fallback;
                else setImageFailed(true);
              }}
            />
          ) : (
            <span className="ht-image-fallback">
              <Play size={30} />
              <span>{imageUnavailableLabel}</span>
            </span>
          )}
          <span className="ht-card-shade" />
          <span className="ht-play">
            <Play size={21} fill="currentColor" strokeWidth={1.5} />
          </span>
        </Link>
        <button
          className={`ht-bookmark ${saved ? 'is-saved' : ''}`}
          onClick={onSave}
          aria-label={saveLabel}
          aria-pressed={saved}
        >
          <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="ht-card-body">
        <p className="ht-card-type">{typeLabel}</p>
        <Link href={`/watch/${video.id}`} className="ht-card-title">
          {video.title}
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
        <p className="ht-channel">{video.channel}</p>
        <p className="ht-card-meta">
          <MessageSquare size={12} />
          {recommendationLabel}
        </p>
      </div>
    </article>
  );
}
