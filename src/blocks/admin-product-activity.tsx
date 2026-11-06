import type { ProductReport } from '@/lib/product-events';
import { m } from '@/paraglide/messages.js';

export function AdminProductActivity({ report }: { report: ProductReport }) {
  const count = report.counts;
  const cards = [
    [m['admin.product.visitors'](), report.visitors],
    [m['admin.product.returning'](), report.returning],
    [m['admin.product.active'](), report.active],
    [m['admin.product.searches'](), count.search ?? 0],
    [m['admin.product.zero_results'](), report.zeroResultSearches],
    [m['admin.product.video_open'](), count.video_open ?? 0],
    [m['admin.product.play_attempt'](), count.play_attempt ?? 0],
    [m['admin.product.youtube_open'](), count.youtube_open ?? 0],
    [m['admin.product.saved'](), count.save_video ?? 0],
    [m['admin.product.path_started'](), count.path_started ?? 0],
    [m['admin.product.path_success'](), count.path_success ?? 0],
    [m['admin.product.path_fallback'](), count.path_fallback ?? 0],
    [m['admin.product.path_unsupported'](), count.path_unsupported ?? 0],
    [m['admin.product.path_failed'](), count.path_failed ?? 0],
    [
      m['admin.product.path_time'](),
      report.averagePathMs === null
        ? '—'
        : `${(report.averagePathMs / 1000).toFixed(1)}s`,
    ],
  ];
  return (
    <section
      className="space-y-4 rounded-xl border p-4 md:p-6"
      aria-labelledby="product-activity-title"
    >
      <h2 id="product-activity-title" className="text-xl font-semibold">
        {m['admin.product.title']()}
      </h2>
      <p className="text-muted-foreground max-w-4xl text-sm leading-6">
        {m['admin.product.definition']()}
      </p>
      {!report.available ? (
        <p role="status">{m['admin.product.unavailable']()}</p>
      ) : (
        <>
          <p className="text-muted-foreground text-xs">
            {m['admin.product.since']()}{' '}
            {report.trackingSince
              ? new Date(report.trackingSince).toLocaleString('en-US', {
                  timeZone: 'Asia/Shanghai',
                }) + ' UTC+08:00'
              : m['admin.product.no_events']()}
          </p>
          <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {cards.map(([label, value]) => (
              <div key={label} className="bg-muted/40 rounded-lg p-3">
                <dt className="text-muted-foreground text-xs">{label}</dt>
                <dd className="mt-2 text-2xl tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="text-muted-foreground py-3 text-left">
                {m['admin.product.daily']()}
              </caption>
              <thead>
                <tr>
                  {[
                    m['admin.product.date'](),
                    m['admin.product.visitors'](),
                    m['admin.product.daily_returning'](),
                    m['admin.product.active'](),
                  ].map((label) => (
                    <th
                      key={label}
                      className="p-2 font-medium whitespace-nowrap"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.days.map((day) => (
                  <tr key={day.day} className="border-t">
                    <td className="p-2 whitespace-nowrap">{day.day}</td>
                    <td className="p-2">{day.visitors}</td>
                    <td className="p-2">{day.returning}</td>
                    <td className="p-2">{day.active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
