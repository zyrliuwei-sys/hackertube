import { createFileRoute } from '@tanstack/react-router';
import { sitemapUrls, xmlResponse } from '@/server/sitemap';

import { listVideoSitemapEntries } from '@/modules/video-catalog/service';

export const Route = createFileRoute('/sitemap-videos.xml')({
  server: {
    handlers: {
      GET: () => xmlResponse(sitemapUrls(listVideoSitemapEntries())),
    },
  },
});
