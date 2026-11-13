import type { WatchEditorial } from '@/types/editorial';

export const wordCount = (value: string) =>
  (value.match(/[A-Za-z0-9]+(?:['’.-][A-Za-z0-9]+)*/g) ?? []).length;

export function editorialText(record: WatchEditorial) {
  return [
    ...record.notes,
    ...record.covers,
    record.audience,
    record.prerequisite?.reason ?? '',
    ...(record.moments ?? []).map((moment) => moment.description),
  ].join(' ');
}

export function validEditorial(
  record: WatchEditorial,
  id: string,
  videos: ReadonlySet<string>
) {
  return (
    record.status === 'reviewed' &&
    /^\d{4}-\d{2}-\d{2}$/.test(record.reviewedAt) &&
    record.sources.length > 0 &&
    record.sources.every((source) => /^https:\/\//.test(source.url)) &&
    record.covers.length >= 3 &&
    record.covers.length <= 6 &&
    record.covers.every(
      (point) => wordCount(point) >= 12 && wordCount(point) <= 25
    ) &&
    wordCount(editorialText(record)) >= 250 &&
    wordCount(editorialText(record)) <= 300 &&
    !/【FILL:|\bTBD\b/.test(JSON.stringify(record)) &&
    (!record.prerequisite ||
      (record.prerequisite.videoId !== id &&
        videos.has(record.prerequisite.videoId))) &&
    (!record.moments?.length ||
      (record.moments.length >= 3 &&
        record.moments.length <= 5 &&
        record.moments.every(
          (moment, index, list) =>
            Number.isInteger(moment.seconds) &&
            moment.seconds >= 0 &&
            (index === 0 || moment.seconds > list[index - 1].seconds) &&
            record.sources.some(
              (source) =>
                source.url === moment.sourceUrl &&
                (source.kind === 'transcript' || source.kind === 'chapters')
            )
        )))
  );
}
