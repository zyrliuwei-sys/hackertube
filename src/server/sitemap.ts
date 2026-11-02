import { envConfigs } from '@/config';

const escapeXml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[char]!
  );
const absoluteUrl = (path: string) =>
  `${envConfigs.app_url.replace(/\/$/, '')}${path || '/'}`;
const declaration = '<?xml version="1.0" encoding="UTF-8"?>';

export function sitemapIndex(paths: string[]) {
  return `${declaration}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <sitemap><loc>${escapeXml(absoluteUrl(path))}</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`;
}

export function sitemapUrls(
  entries: (string | { path: string; lastModified?: string })[]
) {
  const paths = entries.map((entry) =>
    typeof entry === 'string' ? { path: entry } : entry
  );
  if (paths.length > 50_000)
    throw new Error('Split this sitemap before it exceeds 50,000 URLs');
  return `${declaration}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Map(paths.map((entry) => [entry.path, entry])).values()].map((entry) => `  <url><loc>${escapeXml(absoluteUrl(entry.path))}</loc>${entry.lastModified ? `<lastmod>${escapeXml(entry.lastModified)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
}

export function xmlResponse(xml: string) {
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
