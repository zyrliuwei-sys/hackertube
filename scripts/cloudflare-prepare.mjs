import { existsSync, readFileSync, writeFileSync } from 'node:fs';

// The working Wrangler config and env file stay gitignored. CI reconstructs
// them from public configuration; runtime secrets remain in Cloudflare.
const config = JSON.parse(
  readFileSync(
    new URL('../cloudflare/production.json', import.meta.url),
    'utf8'
  )
);
const inCI = Boolean(process.env.CI || process.env.WORKERS_CI_BUILD_UUID);
if (inCI || !existsSync('wrangler.jsonc')) {
  writeFileSync('wrangler.jsonc', JSON.stringify(config, null, 2) + '\n');
}
if (inCI || !existsSync('.env.production')) {
  const quote = (value) => "'" + String(value).replaceAll("'", "'\\''") + "'";
  const publicVars = Object.entries(config.vars).filter(
    ([key]) => key.startsWith('VITE_') || key === 'DATABASE_PROVIDER'
  );
  writeFileSync(
    '.env.production',
    publicVars.map(([key, value]) => `${key}=${quote(value)}`).join('\n') +
      '\n',
    { mode: 0o600 }
  );
}
console.log(
  'Cloudflare production configuration ready. Runtime secrets are managed by Workers.'
);
