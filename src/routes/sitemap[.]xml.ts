import { createFileRoute } from '@tanstack/react-router';
import { sitemapIndex, xmlResponse } from '@/server/sitemap';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () =>
        xmlResponse(
          sitemapIndex(['/sitemap-pages.xml', '/sitemap-videos.xml'])
        ),
    },
  },
});
