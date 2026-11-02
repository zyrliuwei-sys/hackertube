import type { DiscoveryAtlas } from '@/types/video-catalog';

import { m } from '@/paraglide/messages.js';
import { publicVideoLabel } from '@/blocks/-hackertube-labels';
import { CuriosityAtlas } from '@/components/hackertube/curiosity-atlas';

export function HackerTubeAtlas({ data }: { data: DiscoveryAtlas }) {
  return (
    <CuriosityAtlas
      data={data}
      labels={Object.fromEntries(
        data.areas.map((a) => [
          a.id,
          publicVideoLabel(`hackertube.area.${a.id}`),
        ])
      )}
      shortLabels={Object.fromEntries(
        data.areas.map((a) => [
          a.id,
          publicVideoLabel(`hackertube.atlas.node.${a.id}`),
        ])
      )}
      eyebrow={m['hackertube.atlas.eyebrow']()}
      title={m['hackertube.atlas.title']()}
      description={m['hackertube.atlas.description']()}
      legend={m['hackertube.atlas.legend']()}
      mobileLegend={m['hackertube.atlas.mobile_legend']()}
      selectionLabel={m['hackertube.atlas.selection']()}
      bridgeLabel={m['hackertube.atlas.bridges']()}
      browseLabel={m['hackertube.atlas.browse']()}
      countLabel={(count) =>
        m['hackertube.library.results']({
          count: count.toLocaleString('en-US'),
        })
      }
      sharedLabel={(count) => m['hackertube.atlas.shared']({ count })}
    />
  );
}
