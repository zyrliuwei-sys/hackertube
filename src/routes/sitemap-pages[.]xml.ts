import { createFileRoute } from '@tanstack/react-router';
import areas from '@/data/hackertube/areas.json';
import {
  getChannelProfiles,
  getCuratedPaths,
} from '@/server/editorial-catalog';
import { sitemapUrls, xmlResponse } from '@/server/sitemap';

import { topicPath } from '@/lib/topic-path';
import { getBlogPostsFn } from '@/content/posts/server';

export const Route = createFileRoute('/sitemap-pages.xml')({
  server: {
    handlers: {
      GET: async () => {
        const posts = (await getBlogPostsFn({ data: { locale: 'en' } })).filter(
          (post) =>
            !['blocks-vs-components', 'what-is-shipany'].includes(post.slug)
        );
        const paths = [
          '/',
          '/topics',
          '/guide',
          '/learning-paths',
          '/privacy-policy',
          '/terms-of-service',
          '/usage-guide',
          '/about',
          '/contact',
          '/channels',
          ...getChannelProfiles().map((channel) => `/channels/${channel.slug}`),
          ...getCuratedPaths().map((path) => `/learning-paths/${path.slug}`),
          ...areas.flatMap((area) =>
            area.categories.map((category) => topicPath(area.id, category.id))
          ),
        ];
        if (posts.length)
          paths.push('/blog', ...posts.map((post) => `/blog/${post.slug}`));
        return xmlResponse(sitemapUrls(paths));
      },
    },
  },
});
