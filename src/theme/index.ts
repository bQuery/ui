/**
 * Theme system for @bquery/ui
 */
export { darkTheme, getDarkThemeCSS } from './dark.js';
export { defaultTheme, getDefaultThemeCSS } from './default.js';

export type ColorScheme = 'light' | 'dark' | 'auto';

export interface BqTheme {
  name: string;
  colorScheme: 'light' | 'dark';
  tokens: Record<string, string>;
}

let currentTheme: ColorScheme = 'auto';
let autoListener: ((e: MediaQueryListEvent) => void) | null = null;

function applyAutoScheme(): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const root = document.documentElement;
  if (prefersDark) {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }
}

function cleanupAutoListener(): void {
  if (autoListener) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .removeEventListener('change', autoListener);
    autoListener = null;
  }
}

/**
 * Set the global color scheme. Pass 'auto' to follow the user's OS preference
 * (listens for changes in real time).
 */
export function setColorScheme(scheme: ColorScheme): void {
  cleanupAutoListener();
  currentTheme = scheme;
  const root = document.documentElement;
  if (scheme === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (scheme === 'light') {
    root.removeAttribute('data-theme');
  } else {
    applyAutoScheme();
    autoListener = () => applyAutoScheme();
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', autoListener);
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
