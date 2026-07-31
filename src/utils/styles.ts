/**
 * Shared style utilities – provides the token/theme CSS consumed by every
 * component's Shadow DOM.
 *
 * Components should compose their styles with the `css` tagged template from
 * `@bquery/bquery/component` and interpolate the {@link ComponentStyles}
 * exports from this module (`baseStyles`, `focusVisible`, `srOnly`, `reset`):
 *
 * ```ts
 * styles: css`
 *   ${baseStyles}
 *   .thing { color: var(--bq-text-base); }
 * `
 * ```
 *
 * Doing so lets the bQuery component runtime hand the CSS to
 * `adoptedStyleSheets`, which means the stylesheet is constructed once and
 * shared by every instance of that component instead of being duplicated into
 * — and rewritten on every re-render of — a per-instance `<style>` element.
 * Environments without Constructable Stylesheets transparently fall back to
 * the `<style>` element.
 *
 * Interpolating a plain string into `css` escapes it, so raw CSS fragments
 * must be `ComponentStyles` values to survive composition intact.
 */
import { css } from '@bquery/bquery/component';
import type { ComponentStyles } from '@bquery/bquery/component';
import { getDefaultThemeCSS } from '../theme/default.js';
import { getDarkThemeCSS } from '../theme/dark.js';

/**
 * Wraps already-trusted CSS text in a {@link ComponentStyles} payload.
 *
 * `css` only escapes *interpolated* values; the static template chunks are
 * passed through verbatim. Calling the tag directly with a single-chunk
 * template therefore preserves the text exactly, which is what we need for
 * CSS we generate ourselves from the token/theme modules.
 */
export function rawCss(text: string): ComponentStyles {
  const chunks = [text] as string[] & { raw?: readonly string[] };
  chunks.raw = [text];
  return css(chunks as unknown as TemplateStringsArray);
}

const BASE_STYLE_TEXT = `${getDefaultThemeCSS()}\n${getDarkThemeCSS()}`;

/**
 * The full token + light/dark theme CSS block, ready to interpolate into a
 * component's `css` template. Shared across every component instance.
 */
export const baseStyles: ComponentStyles = rawCss(BASE_STYLE_TEXT);

/** Returns the full theme + token CSS block suitable for embedding in a :host style block. */
export function getBaseStyles(): string {
  return BASE_STYLE_TEXT;
}

const FOCUS_VISIBLE_TEXT = `
  :host(:focus-within) *:focus-visible,
  *:focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: var(--bq-focus-ring, 0 0 0 3px rgba(37, 99, 235, 0.35));
  }
`;

/** Focus-visible outline using the CSS custom property --bq-focus-ring. */
export const focusVisibleStyles = FOCUS_VISIBLE_TEXT;

/** {@link focusVisibleStyles} as a composable `css` payload. */
export const focusVisible: ComponentStyles = rawCss(FOCUS_VISIBLE_TEXT);

const SR_ONLY_TEXT = `
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

/** Visually-hidden utility for screen-reader-only text. */
export const srOnlyStyles = SR_ONLY_TEXT;

/** {@link srOnlyStyles} as a composable `css` payload. */
export const srOnly: ComponentStyles = rawCss(SR_ONLY_TEXT);

const RESET_TEXT = `
  *, *::before, *::after { box-sizing: border-box; }
  :host([hidden]) { display: none !important; }
`;

/**
 * Minimal per-component reset. Every component repeats the same box-sizing and
 * `[hidden]` rules, so they live here once.
 */
export const reset: ComponentStyles = rawCss(RESET_TEXT);
