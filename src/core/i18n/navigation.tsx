import type { ComponentProps, ReactNode } from 'react';
import {
  defaultParseSearch,
  Link as RouterLink,
  useLocation,
  useRouter as useTanStackRouter,
} from '@tanstack/react-router';

import { getLocale } from '@/paraglide/runtime.js';

// Locale-aware navigation. Locale prefixes are handled entirely by the
// router rewrite (Paraglide localizeUrl/deLocalizeUrl) — internal hrefs
// stay locale-free and get localized on output automatically.

export function useCurrentLocale(): string {
  return getLocale();
}

type LinkProps = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  locale?: string; // kept for API compat; locale switching goes via setLocale()
  prefetch?: boolean | string;
  children?: ReactNode;
};

export function Link({ href, locale, prefetch, ...rest }: LinkProps) {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) {
    return <a href={href} {...rest} />;
  }
  const Comp = RouterLink as any;
  return <Comp {...toNavigateOptions(href)} {...rest} />;
}

export function usePathname(): string {
  // Routes are matched against the de-localized tree, so pathname here is
  // already locale-free.
  return useLocation().pathname;
}

export function toNavigateOptions(href: string) {
  const hashIndex = href.indexOf('#');
  const pathPart = hashIndex < 0 ? href : href.slice(0, hashIndex);
  const hash = hashIndex < 0 ? undefined : href.slice(hashIndex + 1);
  const searchIndex = pathPart.indexOf('?');
  const pathname = searchIndex < 0 ? pathPart : pathPart.slice(0, searchIndex);
  return {
    to: pathname || '/',
    // Match the router's incoming-URL parser. Re-wrapping numeric strings
    // would serialize ?page=2 as ?page=%222%22 and lose repeated parameters.
    search:
      searchIndex < 0 ? {} : defaultParseSearch(pathPart.slice(searchIndex)),
    hash,
  };
}

export function useRouter() {
  const router = useTanStackRouter();
  return {
    // navigate() goes through the router rewrite so outgoing URLs are
    // localized — do not switch this back to history.push.
    push: (href: string) => {
      router.navigate(toNavigateOptions(href) as any);
    },
    replace: (href: string) => {
      router.navigate({ ...toNavigateOptions(href), replace: true } as any);
    },
    back: () => router.history.back(),
    forward: () => router.history.forward(),
    refresh: () => router.invalidate(),
    prefetch: (_href: string) => {},
  };
}
