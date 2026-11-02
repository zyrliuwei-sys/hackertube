import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { HackerTube } from '@/blocks/hackertube';

import '@/styles/hackertube.css';
import '@/styles/hackertube-editorial.css';

const getInitialCatalog = createServerFn()
  .validator((data: { q?: string; area?: string; category?: string }) => data)
  .handler(async ({ data }) => {
    const { listVideos, getDiscoveryAtlas } =
      await import('@/modules/video-catalog/service');
    return {
      catalog: listVideos({ ...data, pageSize: 12 }),
      atlas: getDiscoveryAtlas(),
    };
  });

function HomePage() {
  const { catalog, atlas } = Route.useLoaderData();
  const filters = Route.useSearch();
  return (
    <HackerTube
      key={JSON.stringify(filters)}
      initialCatalog={catalog}
      atlas={atlas}
      initialFilters={filters}
    />
  );
}

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q.slice(0, 200) : undefined,
    area:
      typeof search.area === 'string' && /^[a-z0-9-]{1,100}$/.test(search.area)
        ? search.area
        : undefined,
    category:
      typeof search.category === 'string' &&
      /^[a-z0-9-]{1,100}$/.test(search.category)
        ? search.category
        : undefined,
    collection: search.collection === 'saved' ? 'saved' : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => ({
    locale: getLocale(),
    ...(await getInitialCatalog({
      data: { q: deps.q, area: deps.area, category: deps.category },
    })),
  }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = m['hackertube.metadata.title']({}, { locale });
    const description = m['hackertube.metadata.description']({}, { locale });
    const urlFor = (loc: (typeof locales)[number]) =>
      localizeUrl(`${envConfigs.app_url}/`, { locale: loc }).href;
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'og:url', content: urlFor(locale) },
        {
          property: 'og:image',
          content: `${envConfigs.app_url}/brand/social-card.png`,
        },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
      ],
    };
  },
  component: HomePage,
});
