export const TOPIC_PAGE_SIZE = 24;
export function topicPageNumber(value: unknown): number {
  const number = Number(value ?? 1);
  return Number.isSafeInteger(number) && number > 0 && number <= 10000
    ? number
    : 1;
}
export function topicPageUrl(path: string, page: number): string {
  return page === 1 ? path : `${path}?page=${page}`;
}
