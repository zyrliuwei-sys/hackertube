import { useState } from 'react';
import type { DiscoveryAtlas, VideoArea } from '@/types/video-catalog';
import { ArrowRight, List, Network, Search } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { m } from '@/paraglide/messages.js';
import { publicVideoLabel } from '@/blocks/-hackertube-labels';
import { HackerTubeAtlas } from '@/blocks/hackertube-atlas';
import { HackerTubeShell } from '@/blocks/hackertube-shell';

export function HackerTubeTopics({
  areas,
  atlas,
  view,
}: {
  areas: VideoArea[];
  atlas: DiscoveryAtlas;
  view: 'map' | 'directory';
}) {
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
          <Link
            href="/topics?view=directory"
            aria-current={view === 'directory' ? 'page' : false}
          >
            <List size={17} />
            {m['hackertube.quality.directory']()}
          </Link>
          <Link
            href="/topics?view=map"
            aria-current={view === 'map' ? 'page' : false}
          >
            <Network size={17} />
            {m['hackertube.atlas.eyebrow']()}
          </Link>
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
            <section className="ht-topic-group" key={area.id}>
              <Link
                href={`/?area=${area.id}#explore`}
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
                    href={`/?area=${area.id}&category=${category.id}#explore`}
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
