import { useId, useState } from 'react';
import type { DiscoveryAtlas } from '@/types/video-catalog';
import { ArrowRight, ArrowUpRight, Network } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';

// Stable editorial placement. Only the edge weights are data, not these coordinates.
const positions: Record<string, [number, number]> = {
  software: [13, 14],
  'systems-security': [13, 37],
  hardware: [13, 60],
  'computing-history-culture': [13, 83],
  'ai-data': [38, 14],
  'math-theory': [38, 37],
  'engineering-making': [38, 60],
  games: [38, 83],
  'life-sciences-health': [63, 14],
  'physics-space': [63, 37],
  'earth-energy-environment': [63, 60],
  'design-graphics-media': [63, 83],
  'ideas-education': [87, 14],
  'business-economics': [87, 37],
  'politics-history-society': [87, 60],
  'arts-entertainment': [87, 83],
};

interface AtlasProps {
  data: DiscoveryAtlas;
  labels: Record<string, string>;
  shortLabels: Record<string, string>;
  eyebrow: string;
  title: string;
  description: string;
  legend: string;
  mobileLegend: string;
  selectionLabel: string;
  bridgeLabel: string;
  browseLabel: string;
  countLabel: (count: number) => string;
  sharedLabel: (count: number) => string;
}

export function CuriosityAtlas({
  data,
  labels,
  shortLabels,
  eyebrow,
  title,
  description,
  legend,
  mobileLegend,
  selectionLabel,
  bridgeLabel,
  browseLabel,
  countLabel,
  sharedLabel,
}: AtlasProps) {
  const [selected, setSelected] = useState('ai-data');
  const headingId = useId();
  const area = data.areas.find((item) => item.id === selected) ?? data.areas[0];
  const bridges = data.edges.filter(
    (edge) => edge.source === area.id || edge.target === area.id
  );
  const connected = new Set(
    bridges.flatMap((edge) => [edge.source, edge.target])
  );
  return (
    <section className="ht-atlas" aria-labelledby={headingId}>
      <div className="ht-atlas-heading">
        <div>
          <p className="ht-kicker">
            <Network size={15} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id={headingId}>{title}</h2>
        </div>
        <p>{description}</p>
      </div>
      <div className="ht-atlas-body">
        <div className="ht-atlas-canvas">
          <div className="ht-atlas-map" role="group" aria-label={eyebrow}>
            <svg
              className="ht-atlas-lines"
              viewBox="0 0 1000 650"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {bridges.map((edge) => {
                const [x1, y1] = positions[edge.source];
                const [x2, y2] = positions[edge.target];
                return (
                  <line
                    key={`${edge.source}-${edge.target}`}
                    x1={x1 * 10}
                    y1={y1 * 6.5}
                    x2={x2 * 10}
                    y2={y2 * 6.5}
                    strokeWidth={1 + Math.min(2, edge.sharedVideos / 100)}
                  />
                );
              })}
            </svg>
            {data.areas.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ht-atlas-node ${connected.has(item.id) ? 'is-connected' : ''}`}
                style={{
                  left: `${positions[item.id][0]}%`,
                  top: `${positions[item.id][1]}%`,
                }}
                aria-pressed={item.id === area.id}
                aria-label={`${labels[item.id]} — ${countLabel(item.count)}`}
                onClick={() => setSelected(item.id)}
              >
                <span className="ht-atlas-dot" aria-hidden="true" />
                <span>
                  {shortLabels[item.id]}
                  <small>{item.count.toLocaleString('en-US')}</small>
                </span>
              </button>
            ))}
          </div>
          <p className="ht-atlas-legend">
            <span aria-hidden="true" />
            <span className="ht-atlas-desktop-note">{legend}</span>
            <span className="ht-atlas-mobile-note">{mobileLegend}</span>
          </p>
        </div>
        <div className="ht-atlas-detail">
          <div
            className="ht-atlas-selection"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="ht-kicker">{selectionLabel}</p>
            <h3>{labels[area.id]}</h3>
            <p>{countLabel(area.count)}</p>
          </div>
          <div className="ht-atlas-previews">
            {area.previews.slice(0, 2).map((video) => (
              <Link key={video.id} href={`/watch/${video.id}`}>
                <span>
                  <strong>{video.title}</strong>
                  <small>{video.channel}</small>
                </span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
          {bridges.length > 0 && (
            <div className="ht-atlas-bridges">
              <p>{bridgeLabel}</p>
              {bridges.slice(0, 2).map((edge) => {
                const other =
                  edge.source === area.id ? edge.target : edge.source;
                return (
                  <button
                    type="button"
                    key={other}
                    onClick={() => setSelected(other)}
                  >
                    <span>{shortLabels[other]}</span>
                    <small>{sharedLabel(edge.sharedVideos)}</small>
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
          <Link href={`/topics#${area.id}`} className="ht-atlas-browse">
            {browseLabel}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
