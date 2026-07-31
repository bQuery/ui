import { getTokensCSS } from '../tokens/index.js';
import { getLightSchemeCSS, lightTokens } from './scheme.js';

/**
 * Default (light) theme for @bquery/ui
 */
export const defaultTheme = {
  name: 'default',
  colorScheme: 'light' as const,
  tokens: lightTokens,
};

/**
 * Generates the CSS for the default light theme, including all design tokens.
 *
 * The semantic half is written as `var(--bq-scheme-*, light-value)` so a page
 * can re-theme components from the document; see `./scheme.ts` for why the
 * indirection is needed at all.
 */
export function getDefaultThemeCSS(): string {
  return `
:host {
  ${getTokensCSS()}

  /* Semantic tokens (light) */
${getLightSchemeCSS()}
}
`.trim();
}
