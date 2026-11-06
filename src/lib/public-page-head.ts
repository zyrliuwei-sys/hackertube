import { envConfigs } from '@/config';

/** Fill sharing fields from the same title, description and canonical as SEO. */
export function withSocialMetadata<
  T extends {
    meta?: Record<string, unknown>[];
    links?: { rel: string; href: string }[];
  },
>(head: T): T {
  const meta = head.meta ?? [];
  const title = meta.find((item) => typeof item.title === 'string')?.title;
  const description = meta.find((item) => item.name === 'description')?.content;
  const url = head.links?.find((item) => item.rel === 'canonical')?.href;
  if (!title || !url) return head;
  const image =
    meta.find((item) => item.property === 'og:image')?.content ??
    `${envConfigs.app_url.replace(/\/$/, '')}/brand/social-card.png`;
  const values = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description ?? '' },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description ?? '' },
    { name: 'twitter:image', content: image },
  ];
  return {
    ...head,
    meta: [
      ...meta,
      ...values.filter(
        (item) =>
          !meta.some((existing) =>
            item.name
              ? existing.name === item.name
              : existing.property === item.property
          )
      ),
    ],
  };
}
