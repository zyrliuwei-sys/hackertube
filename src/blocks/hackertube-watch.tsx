import { useState } from 'react';
import type { Video, VideoArea } from '@/types/video-catalog';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  MessageSquare,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { useVideoCollection } from '@/hooks/use-video-collection';
import { publicVideoLabel } from '@/blocks/-hackertube-labels';
import { HackerTubeShell } from '@/blocks/hackertube-shell';

export function HackerTubeWatch({
  video,
  related,
  area,
}: {
  video: Video;
  related: Video[];
  area: VideoArea | null;
}) {
  const [playing, setPlaying] = useState(false);
  const { savedIds, toggleSaved } = useVideoCollection();
  const saved = savedIds.includes(video.id);
  const save = () => {
    const result = toggleSaved(video.id);
    if (result === 'error') toast.error(m['hackertube.notice.storage']());
    else
      toast.success(
        result === 'saved'
          ? m['hackertube.notice.saved']()
          : m['hackertube.notice.removed']()
      );
  };
  return (
    <HackerTubeShell>
      <div className="ht-watch-wrap">
        <div className="ht-breadcrumb">
          <Link href="/#explore">
            <ArrowLeft size={14} />
            {m['hackertube.brand.back_archive']()}
          </Link>
          {area && (
            <Link href={`/?area=${area.id}#explore`}>
              {publicVideoLabel(`hackertube.area.${area.id}`)}
            </Link>
          )}
        </div>
        <div className="ht-watch-layout">
          <article className="ht-watch-main">
            <div className="ht-watch-stage">
              {playing ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <button
                  onClick={() => setPlaying(true)}
                  aria-label={m['hackertube.brand.watch_now']()}
                >
                  <img
                    src={
                      video.id === 'wupToqz1e2g'
                        ? '/imgs/hackertube/thumbs/wupToqz1e2g.jpg'
                        : video.thumbnail
                    }
                    alt=""
                    onError={(e) => {
                      if (
                        e.currentTarget.src !==
                        `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`
                      )
                        e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                    }}
                  />
                  <span className="ht-watch-play">
                    <Play size={27} fill="currentColor" />
                  </span>
                  <span className="ht-watch-play-label">
                    {m['hackertube.brand.watch_now']()}
                  </span>
                </button>
              )}
            </div>
            <div className="ht-watch-title-row">
              <div>
                <p className="ht-kicker">{video.channel}</p>
                <h1>{video.title}</h1>
              </div>
              <button
                className={`ht-save-button ${saved ? 'is-saved' : ''}`}
                onClick={save}
                aria-label={
                  saved
                    ? m['hackertube.card.saved']()
                    : m['hackertube.card.save']()
                }
                aria-pressed={saved}
              >
                {saved ? <Check size={18} /> : <Bookmark size={18} />}
              </button>
            </div>
            <section className="ht-watch-description">
              <h2>{m['hackertube.brand.watch_about']()}</h2>
              <p>{video.summary}</p>
              <div className="ht-watch-tags">
                {video.topics.slice(0, 6).map((topic) => (
                  <Link
                    key={topic}
                    href={`/?q=${encodeURIComponent(topic)}#explore`}
                  >
                    {topic}
                  </Link>
                ))}
              </div>
            </section>
          </article>
          <aside className="ht-watch-aside">
            <section className="ht-watch-context">
              <MessageSquare size={24} strokeWidth={1.3} />
              <h2>{m['hackertube.player.why']()}</h2>
              <p>{video.whyRecommended || video.summary}</p>
              <div className="ht-watch-recommendations">
                {video.recommendations > 0
                  ? m['hackertube.card.recommendations']({
                      count: video.recommendations,
                    })
                  : m['hackertube.card.mentions']({ count: video.mentions })}
              </div>
              {video.hnUrl && (
                <a
                  className="ht-primary-link"
                  href={video.hnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {m['hackertube.player.hn']()}
                  <ArrowUpRight size={15} />
                </a>
              )}
            </section>
            <dl className="ht-watch-facts">
              <div>
                <dt>{m['hackertube.brand.watch_type']()}</dt>
                <dd>
                  {publicVideoLabel(`hackertube.type.${video.contentType}`)}
                </dd>
              </div>
              <div>
                <dt>{m['hackertube.brand.watch_years']()}</dt>
                <dd>
                  {video.firstRecommendedYear}-{video.lastRecommendedYear}
                </dd>
              </div>
            </dl>
            <a
              className="ht-watch-youtube"
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {m['hackertube.player.youtube']()}
              <ArrowUpRight size={15} />
            </a>
            <p className="ht-watch-note">{m['hackertube.player.note']()}</p>
          </aside>
        </div>
        {related.length > 0 && (
          <section className="ht-related">
            <h2>{m['hackertube.brand.watch_more']()}</h2>
            <p>{m['hackertube.brand.watch_more_text']()}</p>
            <div className="ht-related-grid">
              {related.map((item) => (
                <Link key={item.id} href={`/watch/${item.id}`}>
                  <div className="ht-related-image">
                    <img src={item.thumbnail} alt="" loading="lazy" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.channel}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </HackerTubeShell>
  );
}
