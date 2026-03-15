/**
 * Theme system for @bquery/ui
 */
export { defaultTheme, getDefaultThemeCSS } from './default.js';
export { darkTheme, getDarkThemeCSS } from './dark.js';

export type ColorScheme = 'light' | 'dark' | 'auto';

export interface BqTheme {
  name: string;
  colorScheme: 'light' | 'dark';
  tokens: Record<string, string>;
}

let currentTheme: ColorScheme = 'auto';

/**
 * Set the global color scheme. Pass 'auto' to follow the user's OS preference.
 */
export function setColorScheme(scheme: ColorScheme): void {
  currentTheme = scheme;
  const root = document.documentElement;
  if (scheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (scheme === 'light') {
    root.removeAttribute('data-theme');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }
}

/** Get the current color scheme setting. */
export function getColorScheme(): ColorScheme {
  return currentTheme;
}

/**
 * Apply custom CSS variable overrides to the document root.
 */
export function applyThemeTokens(tokens: Record<string, string>): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(tokens)) {
    root.style.setProperty(key, value);
  }
}
