import { darkTokens, getDarkSchemeCSS } from './scheme.js';

/**
 * Dark theme for @bquery/ui
 */
export const darkTheme = {
  name: 'dark',
  colorScheme: 'dark' as const,
  tokens: darkTokens,
};

/**
 * Generates the CSS for the dark theme overrides.
 *
 * The two selectors are deliberately **separate rules**. `:host-context()`
 * exists only in Chromium, and an unknown selector invalidates the entire
 * selector list it appears in — so writing them as `a, b { … }` meant Firefox
 * and Safari threw away the dark theme wholesale.
 *
 * `:host([data-theme="dark"])` covers a component told to be dark directly.
 * `:host-context()` is kept as a Chromium-only convenience for pages that set
 * an ancestor attribute without installing the theme stylesheet; everywhere
 * else that path is handled by the scheme channel in `./scheme.ts`.
 */
export function getDarkThemeCSS(): string {
  const declarations = getDarkSchemeCSS();
  return `
:host([data-theme="dark"]) {
${declarations}
}

:host-context([data-theme="dark"]) {
${declarations}
}
`.trim();
}
