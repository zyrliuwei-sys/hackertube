import { useRouter, useRouterState } from '@tanstack/react-router';

import {
  appearanceStyle,
  COLOR_MODES,
  DEFAULT_APPEARANCE,
  DEFAULT_COLOR_MODE,
  FONT_SIZES,
  FONTS,
  SIDEBAR_COLLAPSIBLES,
  SIDEBAR_VARIANTS,
  THEME_COOKIE,
  THEMES,
  type Appearance,
  type AppearanceKey,
  type ColorModeId,
  type ThemeId,
} from '@/config/appearance';
import { deleteCookie, setCookie } from '@/lib/cookie';
import { m } from '@/paraglide/messages.js';
import type { AppearanceOption } from '@/components/appearance-options';

// Appearance (theme, font, size, sidebar), resolved server-side by the root
// loader so SSR renders the right <html> attributes with no flash.
export function useAppearance() {
  const router = useRouter();
  const data = useRouterState({
    select: (s) => s.matches[0]?.loaderData,
  }) as
    | {
        appearanceEnabled?: boolean;
        appearance?: Appearance;
        siteAppearance?: Appearance;
        userTheme?: ThemeId | null;
        userThemeEnabled?: boolean;
        colorMode?: ColorModeId;
        colorModeForced?: boolean;
      }
    | undefined;

  // Off: the code's own styles; nothing below touches <html>.
  const appearanceEnabled = data?.appearanceEnabled === true;
  const appearance = data?.appearance ?? DEFAULT_APPEARANCE;
  const siteAppearance = data?.siteAppearance ?? DEFAULT_APPEARANCE;
  const userThemeEnabled = data?.userThemeEnabled === true;
  // Site default for light/dark; when forced, users can't switch it.
  const colorMode: ColorModeId = data?.colorMode ?? DEFAULT_COLOR_MODE;
  const colorModeForced = data?.colorModeForced === true;
  // null = following the site theme.
  const userTheme = data?.userTheme ?? null;

  /** Pick a theme color for this browser, or `null` to follow the site. */
  function setUserTheme(id: ThemeId | null) {
    if (id) setCookie(THEME_COOKIE, id, 365);
    else deleteCookie(THEME_COOKIE);
    // Repaint now; the loader refetch then confirms the same value.
    paintAppearance({ ...appearance, theme: id ?? siteAppearance.theme });
    router.invalidate();
  }

  /**
   * After the admin saved a site setting: repaint at once. For the theme,
   * also drop the admin's own override, which would hide the change.
   */
  function applySiteAppearance<K extends AppearanceKey>(
    key: K,
    value: Appearance[K]
  ) {
    if (key === 'theme' && userTheme) deleteCookie(THEME_COOKIE);
    paintAppearance({ ...appearance, [key]: value });
    router.invalidate();
  }

  return {
    appearanceEnabled,
    appearance,
    siteAppearance,
    userTheme,
    userThemeEnabled,
    colorMode,
    colorModeForced,
    setUserTheme,
    applySiteAppearance,
  };
}

/** Apply an appearance to <html> without waiting for a re-render. */
export function paintAppearance(a: Appearance) {
  const root = document.documentElement;
  root.dataset.theme = a.theme;
  const style = appearanceStyle(a);
  root.style.setProperty('--font-sans', style['--font-sans'] ?? null);
  root.style.fontSize = style.fontSize ?? '';
}

/** Localized picker options for one appearance part. */
export function appearanceOptions(key: AppearanceKey): AppearanceOption[] {
  if (key === 'theme') {
    return THEMES.map((t) => ({
      id: t.id,
      label: appearanceLabel(`common.themes.${t.id}`),
      swatch: t.swatch,
    }));
  }
  if (key === 'font') {
    return FONTS.map((f) => ({
      id: f.id,
      label: appearanceLabel(`common.fonts.${f.id}`),
      fontFamily: f.stack,
    }));
  }
  if (key === 'sidebarVariant') {
    return SIDEBAR_VARIANTS.map((v) => ({
      id: v.id,
      label: appearanceLabel(`common.sidebar_variants.${v.id}`),
    }));
  }
  if (key === 'sidebarCollapsible') {
    return SIDEBAR_COLLAPSIBLES.map((v) => ({
      id: v.id,
      label: appearanceLabel(`common.sidebar_collapsibles.${v.id}`),
    }));
  }
  return FONT_SIZES.map((f) => ({
    id: f.id,
    label: appearanceLabel(`common.font_sizes.${f.id}`),
  }));
}

/** Localized picker options for light/dark. */
export function colorModeOptions(): AppearanceOption[] {
  return COLOR_MODES.map((c) => ({
    id: c.id,
    label: appearanceLabel(`common.color_modes.${c.id}`),
  }));
}

// Known appearance keys preserve all picker choices without importing every message.
const appearanceLabels: Record<string, () => string> = {
  'common.themes.site_default': m['common.themes.site_default'],
  'common.themes.forest': m['common.themes.forest'],
  'common.themes.ocean': m['common.themes.ocean'],
  'common.themes.violet': m['common.themes.violet'],
  'common.themes.sunset': m['common.themes.sunset'],
  'common.themes.rose': m['common.themes.rose'],
  'common.themes.slate': m['common.themes.slate'],
  'common.font_sizes.sm': m['common.font_sizes.sm'],
  'common.font_sizes.md': m['common.font_sizes.md'],
  'common.font_sizes.lg': m['common.font_sizes.lg'],
  'common.fonts.inter': m['common.fonts.inter'],
  'common.fonts.system': m['common.fonts.system'],
  'common.fonts.rounded': m['common.fonts.rounded'],
  'common.fonts.serif': m['common.fonts.serif'],
  'common.sidebar_variants.inset': m['common.sidebar_variants.inset'],
  'common.sidebar_variants.floating': m['common.sidebar_variants.floating'],
  'common.sidebar_variants.sidebar': m['common.sidebar_variants.sidebar'],
  'common.sidebar_collapsibles.offcanvas':
    m['common.sidebar_collapsibles.offcanvas'],
  'common.sidebar_collapsibles.icon': m['common.sidebar_collapsibles.icon'],
  'common.color_modes.system': m['common.color_modes.system'],
  'common.color_modes.light': m['common.color_modes.light'],
  'common.color_modes.dark': m['common.color_modes.dark'],
  'common.themes.classic': m['common.themes.classic'],
  'common.fonts.manrope': m['common.fonts.manrope'],
};

function appearanceLabel(key: string): string {
  return appearanceLabels[key]?.() ?? key;
}
