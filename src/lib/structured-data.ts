import type { Video } from '@/types/video-catalog';

import { envConfigs } from '@/config';
import { durationSeconds, validTimestamp } from '@/lib/video-metadata';

export const siteUrl = (path = '/') =>
  `${envConfigs.app_url.replace(/\/$/, '')}${path}`;

/** Inline JSON is raw script text: escape HTML delimiters before SSR output. */
export function jsonLdScripts(data: Record<string, unknown>) {
  return [
    {
      type: 'application/ld+json',
      children: JSON.stringify(data)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029'),
    },
  ];
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: envConfigs.app_name,
    url: siteUrl(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl()}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

export function topicSchema(name: string, path: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': siteUrl(path),
        name,
        url: siteUrl(path),
        description,
      },
      breadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: 'Topics', path: '/topics' },
        { name, path },
      ]),
    ],
  };
}

export function videoSchema(video: Video) {
  if (
    video.metadataSource !== 'youtube-data-api-v3' ||
    !validTimestamp(video.publishedAt) ||
    Date.parse(video.publishedAt) > Date.now()
  )
    return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': siteUrl(`/watch/${video.id}`),
    url: siteUrl(`/watch/${video.id}`),
    name: video.title,
    description: video.summary,
    thumbnailUrl: [new URL(video.thumbnail, siteUrl()).href],
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
    uploadDate: video.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: envConfigs.app_name,
      url: siteUrl(),
    },
    ...(video.duration && video.duration > 0
      ? {
          duration:
            video.durationIso &&
            durationSeconds(video.durationIso) === video.duration
              ? video.durationIso
              : `PT${Math.round(video.duration)}S`,
        }
      : {}),
  };
}
