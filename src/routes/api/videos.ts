import { createFileRoute } from '@tanstack/react-router';
import type {
  VideoCatalogQuery,
  VideoDuration,
  VideoSort,
} from '@/types/video-catalog';

import {
  listVideos,
  VIDEO_CONTENT_TYPES,
} from '@/modules/video-catalog/service';
import { respData, respErr } from '@/lib/resp';

const sorts: VideoSort[] = ['recommended', 'popular', 'newest'];
const durations: VideoDuration[] = ['all', 'short', 'medium', 'long'];
const validSlug = (value: string) =>
  value.length <= 100 && /^[a-z0-9-]+$/u.test(value);

function GET({ request }: { request: Request }) {
  const params = new URL(request.url).searchParams;
  const query: VideoCatalogQuery = {};
  const q = params.get('q');
  if (q !== null) {
    if (q.length > 200)
      return respErr('Search is limited to 200 characters', { status: 400 });
    query.q = q;
  }
  for (const key of ['area', 'category'] as const) {
    const value = params.get(key);
    if (value) {
      if (!validSlug(value)) return respErr(`Invalid ${key}`, { status: 400 });
      query[key] = value;
    }
  }
  const type = params.get('type');
  if (type) {
    if (type !== 'all' && !VIDEO_CONTENT_TYPES.includes(type)) {
      return respErr('Invalid video type', { status: 400 });
    }
    query.type = type;
  }
  const sort = params.get('sort');
  if (sort) {
    if (!sorts.includes(sort as VideoSort))
      return respErr('Invalid sort', { status: 400 });
    query.sort = sort as VideoSort;
  }
  const duration = params.get('duration');
  if (duration) {
    if (!durations.includes(duration as VideoDuration))
      return respErr('Invalid duration', { status: 400 });
    query.duration = duration as VideoDuration;
  }
  for (const [key, max] of [
    ['page', 10_000],
    ['pageSize', 100],
  ] as const) {
    const value = params.get(key);
    if (value !== null) {
      const number = Number(value);
      if (
        !/^\d+$/u.test(value) ||
        !Number.isSafeInteger(number) ||
        number < 1 ||
        number > max
      ) {
        return respErr(`Invalid ${key}`, { status: 400 });
      }
      query[key] = number;
    }
  }
  const ids = params.get('ids');
  if (ids !== null) {
    const values = ids ? ids.split(',') : [];
    if (values.length > 200 || values.some((id) => !/^[\w-]{11}$/u.test(id))) {
      return respErr('Invalid video IDs (maximum 200)', { status: 400 });
    }
    query.ids = values;
  }
  return respData(listVideos(query), {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
  });
}

export const Route = createFileRoute('/api/videos')({
  server: { handlers: { GET } },
});
