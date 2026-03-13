/**
 * Shared style utilities – generates inline CSS strings for use in Shadow DOM.
 */
import { getDefaultThemeCSS } from '../theme/default.js';
import { getDarkThemeCSS } from '../theme/dark.js';

/** Returns the full theme + token CSS block suitable for embedding in a :host style block. */
export function getBaseStyles(): string {
  return `${getDefaultThemeCSS()}\n${getDarkThemeCSS()}`;
}

/** Focus-visible outline using the CSS custom property --bq-focus-ring. */
export const focusVisibleStyles = `
  :host(:focus-within) *:focus-visible,
  *:focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: var(--bq-focus-ring, 0 0 0 3px rgba(37, 99, 235, 0.35));
  }
`;

/** Visually-hidden utility for screen-reader-only text. */
export const srOnlyStyles = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;
