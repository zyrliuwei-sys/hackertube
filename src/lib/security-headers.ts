export function withSecurityHeaders(response: Response, url: URL): Response {
  const copy = new Response(response.body, response);
  const headers = copy.headers;
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict embedding and plugins without breaking Start's inline hydration,
  // Workers AI, YouTube or the configured analytics scripts.
  headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self'; object-src 'none'; base-uri 'self'"
  );
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (url.protocol === 'https:')
    headers.set('Strict-Transport-Security', 'max-age=15552000');
  return copy;
}
