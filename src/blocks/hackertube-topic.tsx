import type { Video, VideoArea, VideoCategory } from '@/types/video-catalog';
import { toast } from 'sonner';

import { Link, useRouter } from '@/core/i18n/navigation';
import { topicPageUrl } from '@/lib/topic-pagination';
import { topicPath } from '@/lib/topic-path';
import { m } from '@/paraglide/messages.js';
import { useVideoCollection } from '@/hooks/use-video-collection';
import { publicVideoLabel } from '@/blocks/-hackertube-labels';
import { HackerTubeShell } from '@/blocks/hackertube-shell';
import { VideoCard } from '@/components/hackertube/video-card';

export function HackerTubeTopic({
  area,
  category,
  videos,
  description,
  total,
  page,
  pages,
}: {
  area: VideoArea;
  category: VideoCategory;
  videos: Video[];
  description: string[];
  total: number;
  page: number;
  pages: number;
}) {
  const { savedIds, toggleSaved } = useVideoCollection();
  const router = useRouter();
  return (
    <HackerTubeShell>
      <div className="ht-watch-wrap">
        <nav
          className="ht-breadcrumb"
          aria-label={m['hackertube.seo.breadcrumb']()}
        >
          <Link href="/">{m['hackertube.seo.home']()}</Link>
          <Link href="/topics">{m['hackertube.nav.topics']()}</Link>
          <span aria-current="page">{category.name}</span>
        </nav>
        <header className="ht-inner-header ht-topic-intro">
          <p className="ht-kicker">{area.name}</p>
          <h1>{category.name}</h1>
          {description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </header>
        <section aria-label={`${category.name} videos`}>
          <p className="ht-results-count">
            {m['hackertube.library.results']({ count: total })}
          </p>
          <div className="ht-video-grid">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                saved={savedIds.includes(video.id)}
                href={`/watch/${video.id}`}
                playLabel={m['hackertube.brand.watch_now']()}
                saveLabel={
                  savedIds.includes(video.id)
                    ? m['hackertube.card.saved']()
                    : m['hackertube.card.save']()
                }
                recommendationLabel={
                  video.recommendations > 0
                    ? m['hackertube.card.recommendations']({
                        count: video.recommendations,
                      })
                    : m['hackertube.card.mentions']({ count: video.mentions })
                }
                typeLabel={publicVideoLabel(
                  `hackertube.type.${video.contentType}`
                )}
                imageUnavailableLabel={m['hackertube.card.image_unavailable']()}
                onPlay={() => router.push(`/watch/${video.id}`)}
                onSave={() => {
                  const result = toggleSaved(video.id);
                  if (result === 'error')
                    toast.error(m['hackertube.notice.storage']());
                  else
                    toast.success(
                      result === 'saved'
                        ? m['hackertube.notice.saved']()
                        : m['hackertube.notice.removed']()
                    );
                }}
              />
            ))}
          </div>
          {pages > 1 && (
            <nav
              aria-label={m['hackertube.pagination.label']()}
              className="mt-8 flex flex-wrap items-center justify-between gap-4"
            >
              {page > 1 ? (
                <Link
                  rel="prev"
                  className="rounded-lg border px-4 py-3"
                  href={topicPageUrl(topicPath(area.id, category.id), page - 1)}
                >
                  {m['hackertube.pagination.previous']()}
                </Link>
              ) : (
                <span />
              )}
              <span className="text-muted-foreground text-sm">
                {m['hackertube.pagination.status']({ page, pages })}
              </span>
              {page < pages ? (
                <Link
                  rel="next"
                  className="rounded-lg border px-4 py-3"
                  href={topicPageUrl(topicPath(area.id, category.id), page + 1)}
                >
                  {m['hackertube.pagination.next']()}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </section>
        <section className="ht-related" aria-labelledby="related-topics">
          <h2 id="related-topics">{m['hackertube.seo.related_topics']()}</h2>
          <nav
            className="ht-topic-category-links"
            aria-label={m['hackertube.seo.related_topics']()}
          >
            {area.categories
              .filter((item) => item.id !== category.id)
              .slice(0, 6)
              .map((item) => (
                <Link key={item.id} href={topicPath(area.id, item.id)}>
                  {item.name}
                </Link>
              ))}
          </nav>
        </section>
      </div>
    </HackerTubeShell>
  );
}
