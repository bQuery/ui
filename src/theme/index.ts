/**
 * Theme system for @bquery/ui
 */
export { darkTheme, getDarkThemeCSS } from './dark.js';
export { defaultTheme, getDefaultThemeCSS } from './default.js';
export { installThemeStyles } from './root.js';
export {
  darkTokens,
  getDarkSchemeCSS,
  getLightSchemeCSS,
  getSchemeRootCSS,
  lightTokens,
} from './scheme.js';
export type { SemanticTokenName } from './scheme.js';

import { installThemeStyles } from './root.js';

export type ColorScheme = 'light' | 'dark' | 'auto';

let currentScheme: ColorScheme = 'auto';

/**
 * Sets the global color scheme.
 *
 * All three values are expressed the same way — as `data-theme` on the root
 * element — because the theme stylesheet resolves `auto` in CSS, with a
 * `prefers-color-scheme` media query. There is no `matchMedia` listener to
 * leak, and a system-level switch repaints the page without JavaScript running
 * at all.
 *
 * Scoping a scheme to part of a page needs no API: put `data-theme` on any
 * element and everything below it follows.
 */
export function setColorScheme(scheme: ColorScheme): void {
  currentScheme = scheme;
  if (typeof document === 'undefined') return;
  installThemeStyles();
  document.documentElement.setAttribute('data-theme', scheme);
}

/** Gets the current color scheme setting, as requested. */
export function getColorScheme(): ColorScheme {
  return currentScheme;
}

/**
 * Gets the scheme actually in effect, resolving `auto` against the operating
 * system preference.
 */
export function getResolvedColorScheme(): 'light' | 'dark' {
  if (currentScheme !== 'auto') return currentScheme;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Applies custom CSS variable overrides to the document root.
 *
 * Overrides set here outrank the theme, because they land in the element's
 * inline style. To override only one scheme, write the rule against
 * `[data-theme="dark"]` in your own stylesheet instead.
 */
export function applyThemeTokens(
  tokens: Record<string, string>,
  target?: HTMLElement
): void {
  const root =
    target ?? (typeof document === 'undefined' ? null : document.documentElement);
  if (!root) return;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }
}
