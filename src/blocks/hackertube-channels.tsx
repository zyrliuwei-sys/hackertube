import type { ChannelProfile } from '@/types/editorial';
import type { Video } from '@/types/video-catalog';
import { toast } from 'sonner';

import { Link, useRouter } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { useVideoCollection } from '@/hooks/use-video-collection';
import { VideoCard } from '@/components/hackertube/video-card';

import { publicVideoLabel } from './-hackertube-labels';
import { HackerTubeShell } from './hackertube-shell';

export function ChannelDirectory({
  channels,
}: {
  channels: (ChannelProfile & { count: number })[];
}) {
  return (
    <HackerTubeShell>
      <div className="ht-watch-wrap">
        <nav className="ht-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>Channels</span>
        </nav>
        <header className="ht-inner-header ht-topic-intro">
          <h1>Channels in the archive</h1>
          <p>
            Explore the creators and organizations behind videos discussed on
            Hacker News. Counts refer to videos in this catalog, not a channel's
            complete uploads. Profiles with a sourced introduction are listed
            below, ordered by catalog size.
          </p>
        </header>
        <div className="ht-related-grid">
          {channels.map((channel) => (
            <article key={channel.slug} className="ht-watch-description">
              <h2>
                <Link href={`/channels/${channel.slug}`}>{channel.name}</Link>
              </h2>
              <p>{channel.count} videos in this archive</p>
              <p>{channel.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </HackerTubeShell>
  );
}

export function ChannelDetail({
  channel,
}: {
  channel: ChannelProfile & {
    count: number;
    videos: Video[];
    topics: { name: string; path: string }[];
  };
}) {
  const { savedIds, toggleSaved } = useVideoCollection();
  const router = useRouter();
  return (
    <HackerTubeShell>
      <div className="ht-watch-wrap">
        <nav className="ht-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <Link href="/channels">Channels</Link>
          <span>{channel.name}</span>
        </nav>
        <header className="ht-inner-header ht-topic-intro">
          <h1>{channel.name}</h1>
          <p>{channel.bio}</p>
          <p className="text-sm">
            Source:{' '}
            {channel.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.title}
              </a>
            ))}
          </p>
        </header>
        <p className="ht-results-count">
          {channel.count} videos in this archive
        </p>
        <div className="ht-video-grid">
          {channel.videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              href={`/watch/${video.id}`}
              saved={savedIds.includes(video.id)}
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
              }}
            />
          ))}
        </div>
        <section className="ht-related">
          <h2>Related topics</h2>
          <nav className="ht-topic-category-links" aria-label="Related topics">
            {channel.topics.map((topic) => (
              <Link key={topic.path} href={topic.path}>
                {topic.name}
              </Link>
            ))}
          </nav>
        </section>
      </div>
    </HackerTubeShell>
  );
}
