import handler from '@tanstack/react-start/server-entry';

import { envConfigs } from './config';
import { runWithDbScope } from './core/db/request-scope';
import { attributionCookies } from './lib/attribution';
import { withSecurityHeaders } from './lib/security-headers';
import { legacyTopicPath } from './lib/topic-path';
import { getAllConfigs } from './modules/config/service';
import { paraglideMiddleware } from './paraglide/server.js';

// On Cloudflare Workers, stash the binding env (D1, ASSETS, …) on globalThis
// so synchronous code paths (e.g. the db() singleton with DATABASE_PROVIDER=d1)
// can reach bindings without threading the request context through every call.
// The specifier is kept non-literal so bundlers leave the import to runtime;
// outside workerd the import rejects and we just move on.
const CF_WORKERS_MODULE = 'cloudflare:workers';
let cfEnvPromise: Promise<void> | null = null;

function ensureCloudflareEnv(): Promise<void> {
  if (!cfEnvPromise) {
    cfEnvPromise = import(/* @vite-ignore */ CF_WORKERS_MODULE)
      .then((mod) => {
        (globalThis as any).__CF_ENV__ = mod.env;
        ensureDefaultUserAgent();
      })
      .catch(async () => {
        // Vite runs in Node. Use the same D1 as production when remote: true
        // is configured, including on machines behind an HTTP proxy.
        if (import.meta.env.DEV && envConfigs.database_provider === 'd1') {
          const { getDevD1Env } = await import('./core/db/d1-dev');
          (globalThis as any).__CF_ENV__ = await getDevD1Env();
        }
      });
  }
  return cfEnvPromise;
}

// Cloudflare Workers' fetch sends no User-Agent, while Node's adds one. Some
// APIs reject UA-less requests (GitHub → 403, WeChat Pay v3 → 400), so on
// Workers give every outbound request a default UA unless it sets its own.
let fetchPatched = false;

function ensureDefaultUserAgent() {
  if (fetchPatched) return;
  fetchPatched = true;
  const nativeFetch = globalThis.fetch;
  const userAgent = `${envConfigs.app_name || 'ShipAny'} (+${envConfigs.app_url})`;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined)
    );
    if (headers.has('user-agent')) return nativeFetch(input, init);
    headers.set('user-agent', userAgent);
    return nativeFetch(input, { ...init, headers });
  }) as typeof fetch;
}

// Behind a proxy req.url can carry an internal host, so also treat the public
// app URL as "self" when filtering referrers.
function appHost(): string {
  try {
    return new URL(envConfigs.app_url).host;
  } catch {
    return '';
  }
}

// Identifies the stack, like WordPress's generator tag (see also the
// generator <meta> in __root.tsx). Not a link; adds no SEO value.
// Response.redirect() and fetched responses have immutable headers: copy
// those, which also lets the cookie writes below succeed.
function withPoweredBy(response: Response): Response {
  try {
    if (!response.headers.has('X-Powered-By')) {
      response.headers.set('X-Powered-By', 'ShipAny');
    }
    return response;
  } catch {
    const copy = new Response(response.body, response);
    if (!copy.headers.has('X-Powered-By')) {
      copy.headers.set('X-Powered-By', 'ShipAny');
    }
    return copy;
  }
}

// Custom server entry — wraps every request in a db scope (one db client per
// request on Workers, see core/db/request-scope.ts) and Paraglide's middleware
// so getLocale() resolves per-request (AsyncLocalStorage) during SSR.
export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (
      (req.method === 'GET' || req.method === 'HEAD') &&
      url.pathname === '/'
    ) {
      const topic = legacyTopicPath(Object.fromEntries(url.searchParams));
      if (topic) {
        url.pathname = topic;
        url.searchParams.delete('area');
        url.searchParams.delete('category');
        return withSecurityHeaders(Response.redirect(url, 301), url);
      }
    }
    if (url.pathname === '/zh' || url.pathname.startsWith('/zh/')) {
      url.pathname = url.pathname.slice(3) || '/';
      return withSecurityHeaders(Response.redirect(url, 308), url);
    }
    await ensureCloudflareEnv();
    // Wrap the whole request so anything before/after the handler shares
    // the same db client too.
    return runWithDbScope(() => handleRequest(req));
  },
};

async function handleRequest(req: Request): Promise<Response> {
  const response = withPoweredBy(
    await paraglideMiddleware(req, () => handler.fetch(req))
  );
  // Attribution is analytics too: honor withdrawal and the banner before
  // setting first-touch cookies. Config failure must not block the page.
  if (
    req.method === 'GET' &&
    req.headers.get('accept')?.includes('text/html')
  ) {
    const configs = await getAllConfigs().catch(() => null);
    if (configs)
      for (const cookie of attributionCookies(
        req,
        configs.cookie_consent_enabled === 'true',
        appHost()
      ))
        response.headers.append('Set-Cookie', cookie);
  }
  return withSecurityHeaders(response, new URL(req.url));
}
