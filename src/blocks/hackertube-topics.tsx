import { useState } from 'react';
import type { DiscoveryAtlas, VideoArea } from '@/types/video-catalog';
import { ArrowRight, List, Network, Search } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { topicPath } from '@/lib/topic-path';
import { m } from '@/paraglide/messages.js';
import { publicVideoLabel } from '@/blocks/-hackertube-labels';
import { HackerTubeAtlas } from '@/blocks/hackertube-atlas';
import { HackerTubeShell } from '@/blocks/hackertube-shell';

export function HackerTubeTopics({
  areas,
  atlas,
}: {
  areas: VideoArea[];
  atlas: DiscoveryAtlas;
}) {
  const [view, setView] = useState<'map' | 'directory'>('directory');
  const [query, setQuery] = useState('');
  const visible = areas.filter((area) =>
    [
      area.name,
      publicVideoLabel(`hackertube.area.${area.id}`),
      ...area.categories.map((c) => c.name),
    ]
      .join(' ')
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );
  return (
    <HackerTubeShell>
      <div className="ht-inner-header ht-topics-header">
        <p className="ht-kicker">{m['hackertube.nav.topics']()}</p>
        <h1>{m['hackertube.brand.topics_title']()}</h1>
        <p>{m['hackertube.brand.topics_description']()}</p>
        <div className="ht-topics-mode">
          <button
            type="button"
            onClick={() => setView('directory')}
            aria-pressed={view === 'directory'}
          >
            <List size={17} />
            {m['hackertube.quality.directory']()}
          </button>
          <button
            type="button"
            onClick={() => setView('map')}
            aria-pressed={view === 'map'}
          >
            <Network size={17} />
            {m['hackertube.atlas.eyebrow']()}
          </button>
        </div>
        {view === 'directory' && (
          <div className="ht-topic-search">
            <Search size={19} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={m['hackertube.brand.topics_search']()}
              aria-label={m['hackertube.brand.topics_search_label']()}
            />
          </div>
        )}
      </div>
      {view === 'map' ? (
        <HackerTubeAtlas data={atlas} />
      ) : (
        <div className="ht-topics-directory">
          {visible.length === 0 && (
            <p className="ht-topic-empty">
              {m['hackertube.brand.topics_empty']()}
            </p>
          )}
          {visible.map((area) => (
            <section className="ht-topic-group" key={area.id} id={area.id}>
              <Link
                href={`/topics#${area.id}`}
                className="ht-topic-group-heading"
              >
                <h2>{publicVideoLabel(`hackertube.area.${area.id}`)}</h2>
                <ArrowRight size={21} />
              </Link>
              <p className="ht-topic-group-count">
                {m['hackertube.library.results']({ count: area.count })}
              </p>
              <div className="ht-topic-category-links">
                {area.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={topicPath(area.id, category.id)}
                  >
                    {category.name}
                    <span>{category.count}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </HackerTubeShell>
  );
}
