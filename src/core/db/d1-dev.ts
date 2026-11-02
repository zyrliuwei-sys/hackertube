import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { createD1HttpBinding } from './d1-http';

const run = promisify(execFile);

/** Node/Vite only. Reuse Wrangler login; never persist tokens in the project. */
export async function getDevD1Env() {
  const WRANGLER_MODULE = 'wrangler';
  const { unstable_readConfig: readConfig, getPlatformProxy } = await import(
    /* @vite-ignore */ WRANGLER_MODULE
  );
  const configPath = resolve('wrangler.jsonc');
  const config = readConfig({ config: configPath });
  const binding = config.d1_databases?.find(
    (item: { binding: string }) => item.binding === 'DB'
  );
  if (!binding?.remote) {
    return (await getPlatformProxy({ configPath, envFiles: [] })).env;
  }
  if (!config.account_id || !binding.database_id) {
    throw new Error(
      'Remote D1 needs account_id and DB.database_id in wrangler.jsonc.'
    );
  }

  const require = createRequire(import.meta.url);
  const wranglerCli = require.resolve('wrangler');
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.account_id)}/d1/database/${encodeURIComponent(binding.database_id)}/raw`;
  let credentials: Promise<Record<string, string>> | undefined;

  function getCredentials() {
    return (credentials ??= run(
      process.execPath,
      [wranglerCli, 'auth', 'token', '--json', '--config', configPath],
      { timeout: 30_000, maxBuffer: 1024 * 1024 }
    )
      .then(({ stdout }) => JSON.parse(stdout))
      .catch(() => {
        credentials = undefined;
        throw new Error(
          'Could not load Cloudflare credentials. Run pnpm exec wrangler login.'
        );
      }));
  }

  const DB = createD1HttpBinding(async (queries) => {
    async function request() {
      const auth = await getCredentials();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (auth.type === 'api_key') {
        headers['X-Auth-Key'] = auth.key;
        headers['X-Auth-Email'] = auth.email;
      } else {
        headers.Authorization = `Bearer ${auth.token}`;
      }
      // Importing Wrangler configures Node fetch for the user's HTTP proxy.
      // Unlike workerd's remote preview, this reaches D1 behind that proxy.
      return fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ batch: queries }),
        signal: AbortSignal.timeout(30_000),
      });
    }
    let response = await request();
    if (response.status === 401 || response.status === 403) {
      await response.body?.cancel();
      credentials = undefined;
      response = await request(); // Wrangler refreshes expired OAuth credentials.
    }
    const data = await response.json();
    if (
      !response.ok ||
      !data.success ||
      data.result?.some((r: { success: boolean }) => !r.success)
    ) {
      throw new Error(
        data.errors
          ?.map((error: { message: string }) => error.message)
          .join('; ') || `D1 request failed (${response.status})`
      );
    }
    return data.result;
  });
  return { DB };
}
