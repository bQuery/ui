import { darkTokens, getDarkSchemeChannelCSS } from './scheme.js';

/**
 * Dark theme for @bquery/ui
 */
export const darkTheme = {
  name: 'dark',
  colorScheme: 'dark' as const,
  tokens: darkTokens,
};

/**
 * Generates the CSS for a component told to be dark directly
 * (`<bq-button data-theme="dark">`). The values go through the scheme channel
 * with dark fallbacks (see `getDarkSchemeChannelCSS`), so a page's own dark
 * palette applies here too.
 *
 * An ancestor's `data-theme` reaches components through the document-level
 * scheme channel (`./scheme.ts`, installed automatically), in every browser.
 * There is deliberately no `:host-context([data-theme="dark"])` rule: it only
 * exists in Chromium, and since it set the tokens as literals it overrode a
 * page's own `--bq-scheme-*` palette there and nowhere else.
 */
export function getDarkThemeCSS(): string {
  return `
:host([data-theme="dark"]) {
${getDarkSchemeChannelCSS()}
}
`.trim();
}
