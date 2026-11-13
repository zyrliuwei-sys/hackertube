import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { adsTxt } from '@/lib/adsense';

export const Route = createFileRoute('/ads.txt')({
  server: {
    handlers: {
      GET: () => {
        const body = adsTxt(envConfigs.adsense_client);
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      },
    },
  },
});
