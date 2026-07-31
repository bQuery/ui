/**
 * Shared style utilities – provides the token/theme CSS consumed by every
 * component's Shadow DOM.
 *
 * Components should compose their styles with the `css` tagged template from
 * `@bquery/bquery/component` and interpolate the {@link ComponentStyles}
 * exports from this module (`baseStyles`, `reset`, `focusRing`, `fieldStyles`,
 * `srOnly`):
 *
 * ```ts
 * styles: css`
 *   ${baseStyles}
 *   ${reset}
 *   ${focusRing}
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
import { installThemeStyles } from '../theme/root.js';

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

// Every component imports this module for its base styles, so this is the one
// place guaranteed to run no matter which entrypoint an application uses —
// the bundle root, a single `@bquery/ui/components/button` import, or the CDN
// build. The rules it installs are inert until a page sets `data-theme`.
installThemeStyles();

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

/**
 * Elements that should show a focus ring when keyboard-focused.
 *
 * Written as `:where(...)` so the whole selector has zero specificity: a
 * component that wants a different ring on one element only has to name it,
 * without an `!important` or an id-strength selector to outrank this.
 */
const FOCUSABLE_SELECTOR = `:where(a[href], button, input, select, summary, textarea, [tabindex]:not([tabindex="-1"]))`;

const FOCUS_RING_TEXT = `
  ${FOCUSABLE_SELECTOR}:focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: var(--bq-focus-ring, 0 0 0 3px rgba(37, 99, 235, 0.35));
  }
  /* Windows high-contrast throws box-shadow away, so the ring has to come
     back as a real outline or keyboard focus becomes invisible. */
  @media (forced-colors: active) {
    ${FOCUSABLE_SELECTOR}:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: 2px;
    }
  }
`;

/** The standard keyboard focus ring, applied to the usual focusable elements. */
export const focusRingStyles = FOCUS_RING_TEXT;

/** {@link focusRingStyles} as a composable `css` payload. */
export const focusRing: ComponentStyles = rawCss(FOCUS_RING_TEXT);

const FOCUS_VISIBLE_TEXT = `
  :host(:focus-within) *:focus-visible,
  *:focus-visible {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: var(--bq-focus-ring, 0 0 0 3px rgba(37, 99, 235, 0.35));
  }
`;

/**
 * Focus-visible outline using the CSS custom property --bq-focus-ring.
 *
 * @deprecated Prefer {@link focusRing}: this variant matches `*`, so it also
 * rings non-interactive containers and outranks a component's own rules.
 */
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
  /* Honour the OS "reduce motion" setting everywhere at once. Durations are
     collapsed rather than set to \`none\` so transition/animation events still
     fire and any logic waiting on them keeps working. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

/**
 * Minimal per-component reset. Every component repeats the same box-sizing and
 * `[hidden]` rules, so they live here once — together with the reduced-motion
 * opt-out, which is far too easy to forget one component at a time.
 */
export const reset: ComponentStyles = rawCss(RESET_TEXT);

const FIELD_TEXT = `
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    font-family: var(--bq-font-family-sans);
  }
  .label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: var(--bq-font-size-sm, 0.875rem);
    font-weight: var(--bq-font-weight-medium, 500);
    line-height: var(--bq-line-height-normal, 1.5);
    color: var(--bq-text-base, #0f172a);
  }
  .required-mark { color: var(--bq-color-danger-600, #dc2626); }
  .hint,
  .error-msg {
    font-size: var(--bq-font-size-sm, 0.875rem);
    line-height: var(--bq-line-height-normal, 1.5);
    font-family: var(--bq-font-family-sans);
  }
  .hint { color: var(--bq-text-muted, #475569); }
  .error-msg {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--bq-color-danger-600, #dc2626);
  }
  :host([disabled]) .label,
  :host([disabled]) .hint { opacity: 0.6; }
`;

/**
 * Label, hint, error and required-marker typography shared by every form
 * control, so a hint under a text field and a hint under a slider are the same
 * size, colour and rhythm.
 */
export const fieldStyles: ComponentStyles = rawCss(FIELD_TEXT);

/** {@link fieldStyles} as raw CSS text. */
export const fieldStylesText = FIELD_TEXT;
