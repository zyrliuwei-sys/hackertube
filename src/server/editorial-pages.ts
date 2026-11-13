import { createServerFn } from '@tanstack/react-start';

const slug = (value: string) => {
  if (!/^[a-z0-9-]{1,100}$/.test(value)) throw new Error('Invalid page');
  return value;
};

export const getChannelDirectory = createServerFn().handler(async () => {
  const { getChannelProfiles } = await import('./editorial-catalog');
  return getChannelProfiles().map(
    ({ videos: _, topics: __, ...profile }) => profile
  );
});

export const getChannelPage = createServerFn()
  .validator(slug)
  .handler(async ({ data }) => {
    const { getChannelProfiles } = await import('./editorial-catalog');
    return (
      getChannelProfiles().find((profile) => profile.slug === data) ?? null
    );
  });

export const getCuratedPathDirectory = createServerFn().handler(async () => {
  const { getCuratedPaths } = await import('./editorial-catalog');
  return getCuratedPaths().map(({ stages: _, ...path }) => path);
});

export const getCuratedPathPage = createServerFn()
  .validator(slug)
  .handler(async ({ data }) => {
    const { getCuratedPaths } = await import('./editorial-catalog');
    return getCuratedPaths().find((path) => path.slug === data) ?? null;
  });
