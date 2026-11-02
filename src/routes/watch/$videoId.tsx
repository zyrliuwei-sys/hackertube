import { createFileRoute, notFound } from '@tanstack/react-router';
import { getVideoPage } from '@/server/video-pages';

import { envConfigs } from '@/config';
import { metaDescription } from '@/lib/meta-description';
import { jsonLdScripts, videoSchema } from '@/lib/structured-data';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { HackerTubeWatch } from '@/blocks/hackertube-watch';

export const Route = createFileRoute('/watch/$videoId')({
  loader: async ({ params }) => {
    if (!/^[\w-]{11}$/.test(params.videoId)) throw notFound();
    const result = await getVideoPage({ data: params.videoId });
    if (!result.video) throw notFound();
    return { ...result, video: result.video, locale: getLocale() };
  },
  head: ({ loaderData }) => ({
    scripts:
      loaderData && videoSchema(loaderData.video)
        ? jsonLdScripts(videoSchema(loaderData.video)!)
        : [],
    meta: loaderData
      ? [
          { title: `${loaderData.video.title} | ${envConfigs.app_name}` },
          {
            name: 'description',
            content: metaDescription(loaderData.video.summary),
          },
          { property: 'og:title', content: loaderData.video.title },
          {
            property: 'og:image',
            content: `https://i.ytimg.com/vi/${loaderData.video.id}/hqdefault.jpg`,
          },
        ]
      : [],
    links: loaderData
      ? [
          {
            rel: 'canonical',
            href: localizeUrl(
              `${envConfigs.app_url}/watch/${loaderData.video.id}`,
              { locale: loaderData.locale }
            ).href,
          },
        ]
      : [],
  }),
  component: () => {
    const data = Route.useLoaderData();
    return (
      <HackerTubeWatch
        key={data.video.id}
        video={data.video}
        related={data.related}
      />
    );
  },
});
