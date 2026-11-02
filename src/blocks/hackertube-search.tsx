import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { VideoCatalogResult } from '@/types/video-catalog';
import { ArrowUpRight, LoaderCircle, Search, X } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { apiGet } from '@/lib/api-client';
import { m } from '@/paraglide/messages.js';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

export function HackerTubeSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement;
      const editing =
        element.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName);
      if (
        !editing &&
        !event.repeat &&
        ((event.key.toLowerCase() === 'k' &&
          (event.metaKey || event.ctrlKey)) ||
          (event.key === '/' &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.altKey))
      ) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
  const results = useQuery({
    queryKey: ['hackertube-quick-search', debounced],
    queryFn: () =>
      apiGet<VideoCatalogResult>(
        `/api/videos?${new URLSearchParams({ q: debounced, pageSize: '6' })}`
      ),
    enabled: open,
    staleTime: 60_000,
  });
  const waiting = query.trim() !== debounced || results.isFetching;
  const close = () => setOpen(false);
  return (
    <>
      <button
        type="button"
        className="ht-quick-search-trigger"
        onClick={() => setOpen(true)}
        aria-label={m['hackertube.quick.title']()}
        aria-keyshortcuts="Control+k Meta+k /"
      >
        <Search size={17} />
        <span>{m['hackertube.search.button']()}</span>
        <kbd>⌘ K</kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="ht-quick-search"
          showCloseButton={false}
          initialFocus={inputRef}
        >
          <DialogTitle className="sr-only">
            {m['hackertube.quick.title']()}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {m['hackertube.quick.description']()}
          </DialogDescription>
          <div className="ht-quick-search-input">
            <Search size={21} aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              maxLength={200}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={m['hackertube.search.placeholder']()}
              aria-label={m['hackertube.search.label']()}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  resultsRef.current
                    ?.querySelector<HTMLAnchorElement>('a')
                    ?.focus();
                }
              }}
            />
            <DialogClose
              className="ht-quick-close"
              aria-label={m['hackertube.nav.close']()}
            >
              <X size={20} />
            </DialogClose>
          </div>
          <div
            className="ht-quick-results"
            ref={resultsRef}
            aria-busy={waiting}
            onKeyDown={(e) => {
              const links = [
                ...(resultsRef.current?.querySelectorAll<HTMLAnchorElement>(
                  'a'
                ) ?? []),
              ];
              const index = links.indexOf(
                document.activeElement as HTMLAnchorElement
              );
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                if (e.key === 'ArrowUp' && index <= 0)
                  inputRef.current?.focus();
                else
                  links[
                    Math.min(
                      links.length - 1,
                      Math.max(0, index + (e.key === 'ArrowDown' ? 1 : -1))
                    )
                  ]?.focus();
              }
            }}
          >
            <p className="ht-quick-status" role="status">
              {waiting ? (
                <>
                  <LoaderCircle
                    size={14}
                    className="ht-search-spinner"
                    aria-hidden="true"
                  />
                  {m['hackertube.library.loading']()}
                </>
              ) : query.trim() ? (
                m['hackertube.library.results']({
                  count: results.data?.total ?? 0,
                })
              ) : (
                m['hackertube.quick.suggestions']()
              )}
            </p>
            {results.isError ? (
              <div className="ht-quick-message" role="alert">
                <p>{m['hackertube.library.error']()}</p>
                <button onClick={() => results.refetch()}>
                  {m['hackertube.library.retry']()}
                </button>
              </div>
            ) : !waiting && results.data?.total === 0 ? (
              <div className="ht-quick-message">
                <p>{m['hackertube.library.empty']()}</p>
                <p>{m['hackertube.library.empty_text']()}</p>
              </div>
            ) : (
              <div className={waiting ? 'is-updating' : ''}>
                {results.data?.items.map((video) => (
                  <Link
                    key={video.id}
                    href={`/watch/${video.id}`}
                    className="ht-quick-result"
                    onClick={close}
                  >
                    <span>
                      <strong>{video.title}</strong>
                      <small>{video.channel}</small>
                    </span>
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
            <div className="ht-quick-nav">
              <Link
                href={
                  query.trim()
                    ? `/?q=${encodeURIComponent(query.trim())}#explore`
                    : '/#explore'
                }
                onClick={close}
              >
                {m['hackertube.quick.all']()}
                <ArrowUpRight size={15} />
              </Link>
              <Link href="/topics" onClick={close}>
                {m['hackertube.atlas.eyebrow']()}
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
          <p className="ht-quick-footer">
            <span>
              ↑ ↓ <span>{m['hackertube.quick.navigate']()}</span>
            </span>
            <span>
              ↵ <span>{m['hackertube.quick.open']()}</span>
            </span>
            <span>
              esc <span>{m['hackertube.nav.close']()}</span>
            </span>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
