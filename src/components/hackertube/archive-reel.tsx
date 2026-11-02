import type { DiscoveryAtlas } from '@/types/video-catalog';
import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

export function ArchiveReel({
  videos,
  label,
  note,
}: {
  videos: DiscoveryAtlas['featured'];
  label: string;
  note: string;
}) {
  return (
    <aside className="ht-reel" aria-label={label}>
      <div className="ht-reel-heading">
        <span>{label}</span>
        <span aria-hidden="true">01—04</span>
      </div>
      <div className="ht-reel-grid">
        {videos.map((video, i) => (
          <Link
            key={video.id}
            href={`/watch/${video.id}`}
            className="ht-reel-item"
          >
            <div className="ht-reel-image">
              <img
                src={video.thumbnail}
                alt=""
                width="480"
                height="360"
                fetchPriority={i === 0 ? 'high' : 'auto'}
              />
              <span className="ht-reel-index" aria-hidden="true">
                0{i + 1}
              </span>
              <ArrowUpRight size={22} aria-hidden="true" />
            </div>
            <h2>{video.title}</h2>
            <p>{video.channel}</p>
          </Link>
        ))}
      </div>
      <p className="ht-reel-note">
        {note}
        <span aria-hidden="true">↗</span>
      </p>
    </aside>
  );
}
