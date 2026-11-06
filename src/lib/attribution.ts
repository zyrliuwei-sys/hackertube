import { analyticsAllowed } from './analytics-permission';
import {
  getCookieFromHeader,
  REFERRER_COOKIE,
  sanitizeReferrer,
  sanitizeUtm,
} from './cookie';

export const ATTRIBUTION_COOKIES = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  REFERRER_COOKIE,
];

export function attributionCookies(
  request: Request,
  consentRequired: boolean,
  appHost: string
): string[] {
  if (
    request.method !== 'GET' ||
    !request.headers.get('accept')?.includes('text/html')
  )
    return [];
  const existing = request.headers.get('cookie');
  if (
    !analyticsAllowed({
      consent: getCookieFromHeader(existing, 'cookie_consent'),
      consentRequired,
      dnt: request.headers.get('dnt'),
      gpc: request.headers.get('sec-gpc'),
    })
  )
    return [];
  const url = new URL(request.url);
  const attrs = `Max-Age=2592000; Path=/; SameSite=Lax${url.protocol === 'https:' ? '; Secure' : ''}`;
  const cookies: string[] = [];
  for (const key of ATTRIBUTION_COOKIES.filter((k) => k !== REFERRER_COOKIE)) {
    const value = sanitizeUtm(url.searchParams.get(key) || '');
    if (value && !getCookieFromHeader(existing, key))
      cookies.push(`${key}=${encodeURIComponent(value)}; ${attrs}`);
  }
  const referrer = sanitizeReferrer(request.headers.get('referer') || '', [
    url.host,
    appHost,
  ]);
  if (referrer && !getCookieFromHeader(existing, REFERRER_COOKIE))
    cookies.push(
      `${REFERRER_COOKIE}=${encodeURIComponent(referrer)}; ${attrs}`
    );
  return cookies;
}
