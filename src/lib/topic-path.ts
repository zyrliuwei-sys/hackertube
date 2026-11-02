import areas from '@/data/hackertube/areas.json';

export function topicPath(area: string, category: string) {
  return `/topics/${area}/${category}`;
}

export function videoTopicLinks(categoryIds: string[]) {
  return categoryIds.flatMap((id) => {
    const area = areas.find((item) =>
      item.categories.some((category) => category.id === id)
    );
    const category = area?.categories.find((item) => item.id === id);
    return area && category
      ? [{ name: category.name, path: topicPath(area.id, category.id) }]
      : [];
  });
}

/** Only redirect a real category in its configured parent area. */
export function legacyTopicPath(search: {
  area?: unknown;
  category?: unknown;
}) {
  if (typeof search.category !== 'string') return undefined;
  const area = areas.find(
    (item) =>
      (!search.area || item.id === search.area) &&
      item.categories.some((category) => category.id === search.category)
  );
  return area ? topicPath(area.id, search.category) : undefined;
}
