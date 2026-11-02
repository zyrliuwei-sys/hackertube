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

const normalizeTopic = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const tagAliases: Record<string, string> = {
  'linear-algebra': 'pure-mathematics',
  vectors: 'pure-mathematics',
  'machine-learning-math': 'pure-mathematics',
  'visual-math': 'recreational-math',
  'neural-networks': 'machine-learning',
  'deep-learning': 'machine-learning',
  'generative-ai': 'llms-generative-ai',
  llms: 'llms-generative-ai',
  'functional-programming': 'functional-programming',
  compilers: 'compilers-interpreters',
  interpreters: 'compilers-interpreters',
};
const topicTagIndex = new Map(
  areas.flatMap((area) =>
    area.categories.flatMap((category) => [
      [
        normalizeTopic(category.name),
        { name: category.name, path: topicPath(area.id, category.id) },
      ] as const,
      [
        category.id,
        { name: category.name, path: topicPath(area.id, category.id) },
      ] as const,
    ])
  )
);

export function topicTagLink(tag: string) {
  const normalized = normalizeTopic(tag);
  return topicTagIndex.get(tagAliases[normalized] ?? normalized);
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
