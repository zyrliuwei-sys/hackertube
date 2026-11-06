import { createFileRoute } from '@tanstack/react-router';
import { recordRequestProductEvent } from '@/server/product-events';
import type { LearningPath } from '@/types/learning-path';

import {
  generateLearningPath,
  type LearningPathAI,
} from '@/modules/learning-paths/service';
import { getCatalogVideos } from '@/modules/video-catalog/service';
import { learningPathInput } from '@/lib/learning-path-input';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

type PathEnv = {
  AI?: LearningPathAI;
  LEARNING_PATH_LIMITER?: {
    limit(input: { key: string }): Promise<{ success: boolean }>;
  };
};
const cache = new Map<string, { path: LearningPath; expires: number }>();
const inflight = new Map<string, Promise<LearningPath>>();

async function POST({ request }: { request: Request }) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    return respErr('Please generate paths from this website.', { status: 403 });
  if (!request.headers.get('content-type')?.startsWith('application/json'))
    return respErr('Send a JSON learning goal.', { status: 415 });
  const throttled = enforceMinIntervalRateLimit(request, {
    intervalMs: 10_000,
    keyPrefix: 'learning-paths',
  });
  if (throttled) return throttled;
  const env = (globalThis as typeof globalThis & { __CF_ENV__?: PathEnv })
    .__CF_ENV__;
  if (env?.LEARNING_PATH_LIMITER) {
    const limited = await env.LEARNING_PATH_LIMITER.limit({
      key: request.headers.get('cf-connecting-ip') || 'unknown',
    });
    if (!limited.success)
      return respErr(
        'You have reached the limit of 3 learning paths per minute. Please try again shortly.',
        { status: 429, headers: { 'Retry-After': '60' } }
      );
  }
  // Bound the streamed body as well as its declared length. No logging or
  // persistence of learning goals; only a small, short-lived result cache.
  if (Number(request.headers.get('content-length')) > 2048)
    return respErr('Learning goal is too long.', { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return respErr('Add a learning goal.', { status: 400 });
  let bytes = 0;
  let body = '';
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 2048) {
        await reader.cancel();
        return respErr('Learning goal is too long.', { status: 413 });
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
  } catch {
    return respErr('Could not read your learning goal.', { status: 400 });
  } finally {
    reader.releaseLock();
  }
  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return respErr('Send a valid JSON learning goal.', { status: 400 });
  }
  const parsed = learningPathInput.safeParse(json);
  if (!parsed.success)
    return respErr(
      parsed.error.issues[0]?.message || 'Check your learning goal.',
      { status: 400 }
    );
  const started = Date.now();
  await recordRequestProductEvent(request, 'path_started');
  const outcome = (path: LearningPath) =>
    recordRequestProductEvent(
      request,
      !path.stages.length
        ? 'path_unsupported'
        : path.mode === 'ai'
          ? 'path_success'
          : 'path_fallback',
      Date.now() - started
    );
  const input = parsed.data;
  const key = JSON.stringify(input);
  const stored = cache.get(key);
  if (stored && stored.expires > Date.now()) {
    await outcome(stored.path);
    return respData(stored.path, { headers: { 'Cache-Control': 'no-store' } });
  }
  let pending = inflight.get(key);
  if (!pending) {
    pending = generateLearningPath(input, getCatalogVideos(), env?.AI);
    inflight.set(key, pending);
  }
  try {
    const path = await pending;
    if (path.mode === 'ai' && path.stages.length) {
      if (cache.size >= 50) cache.delete(cache.keys().next().value!);
      cache.set(key, { path, expires: Date.now() + 60 * 60 * 1000 });
    }
    await outcome(path);
    return respData(path, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    await recordRequestProductEvent(
      request,
      'path_failed',
      Date.now() - started
    );
    return respErr('Could not build a learning path. Please try again.', {
      status: 503,
    });
  } finally {
    inflight.delete(key);
  }
}

export const Route = createFileRoute('/api/learning-paths')({
  server: { handlers: { POST } },
});
