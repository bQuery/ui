/**
 * The icon set, delivered as CSS masks.
 *
 * Rendered markup goes through the framework sanitizer, and `svg` is on its
 * *forbidden* list — a list `sanitize.allowTags` cannot re-open. So a component
 * cannot emit an inline `<svg>` no matter how it is configured, which is why
 * this library used to draw its affordances with text glyphs (`&times;`,
 * `&#9660;`, `✓`). Those inherit whatever the platform font decides: different
 * weights, different baselines, no way to control the stroke, and a close
 * button that looks like a lowercase x on one OS and a heavy cross on another.
 *
 * Component *styles* are not sanitized, so the icons live there instead. Each
 * one is a `mask-image` data URI painted with `background-color: currentColor`,
 * which means it inherits text colour, scales with `font-size`, and stays a
 * single crisp path at any DPI.
 *
 * ```ts
 * styles: css`
 *   ${baseStyles}
 *   ${iconCss('chevron-down', 'x')}
 * `,
 * render: () => html`<span class="icon" data-icon="x" aria-hidden="true"></span>`
 * ```
 *
 * Pull only the icons a component actually draws: {@link iconCss} emits one
 * rule per name, so an unused icon costs nothing. To decorate an element the
 * component already renders, {@link iconMask} returns the declarations on their
 * own for use inside any selector, including `::before`/`::after`.
 *
 * Geometry follows the common 24×24, 2px-stroke, round-cap convention, so the
 * set sits comfortably next to Lucide, Feather or Heroicons if an application
 * mixes in its own.
 */
import { rawCss } from './styles.js';
import type { ComponentStyles } from '@bquery/bquery/component';

/** Inner SVG markup for each icon, on a 24×24 canvas. */
const ICON_BODY = {
  // ── Status ───────────────────────────────────────────────────────────────
  check: `<path d='M20 6 9 17l-5-5'/>`,
  'check-circle': `<path d='M21.8 10A10 10 0 1 1 15.9 2.6'/><path d='m9 11 3 3L22 4'/>`,
  x: `<path d='M18 6 6 18'/><path d='m6 6 12 12'/>`,
  'x-circle': `<circle cx='12' cy='12' r='10'/><path d='m15 9-6 6'/><path d='m9 9 6 6'/>`,
  info: `<circle cx='12' cy='12' r='10'/><path d='M12 16v-4'/><path d='M12 8h.01'/>`,
  'alert-circle': `<circle cx='12' cy='12' r='10'/><path d='M12 8v4'/><path d='M12 16h.01'/>`,
  'alert-triangle': `<path d='m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z'/><path d='M12 9v4'/><path d='M12 17h.01'/>`,
  'help-circle': `<circle cx='12' cy='12' r='10'/><path d='M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3'/><path d='M12 17h.01'/>`,
  circle: `<circle cx='12' cy='12' r='10'/>`,
  dot: `<circle cx='12' cy='12' r='5' fill='#000' stroke='none'/>`,

  // ── Direction ────────────────────────────────────────────────────────────
  'chevron-up': `<path d='m18 15-6-6-6 6'/>`,
  'chevron-down': `<path d='m6 9 6 6 6-6'/>`,
  'chevron-left': `<path d='m15 18-6-6 6-6'/>`,
  'chevron-right': `<path d='m9 18 6-6-6-6'/>`,
  'chevrons-left': `<path d='m11 17-5-5 5-5'/><path d='m18 17-5-5 5-5'/>`,
  'chevrons-right': `<path d='m6 17 5-5-5-5'/><path d='m13 17 5-5-5-5'/>`,
  'chevrons-up-down': `<path d='m7 15 5 5 5-5'/><path d='m7 9 5-5 5 5'/>`,
  'arrow-up': `<path d='M12 19V5'/><path d='m5 12 7-7 7 7'/>`,
  'arrow-down': `<path d='M12 5v14'/><path d='m19 12-7 7-7-7'/>`,
  'arrow-left': `<path d='M19 12H5'/><path d='m12 19-7-7 7-7'/>`,
  'arrow-right': `<path d='M5 12h14'/><path d='m12 5 7 7-7 7'/>`,
  'external-link': `<path d='M15 3h6v6'/><path d='M10 14 21 3'/><path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'/>`,

  // ── Actions ──────────────────────────────────────────────────────────────
  plus: `<path d='M12 5v14'/><path d='M5 12h14'/>`,
  minus: `<path d='M5 12h14'/>`,
  search: `<circle cx='11' cy='11' r='8'/><path d='m21 21-4.3-4.3'/>`,
  menu: `<path d='M4 6h16'/><path d='M4 12h16'/><path d='M4 18h16'/>`,
  'more-horizontal': `<circle cx='12' cy='12' r='1.4' fill='#000' stroke='none'/><circle cx='19' cy='12' r='1.4' fill='#000' stroke='none'/><circle cx='5' cy='12' r='1.4' fill='#000' stroke='none'/>`,
  'more-vertical': `<circle cx='12' cy='12' r='1.4' fill='#000' stroke='none'/><circle cx='12' cy='5' r='1.4' fill='#000' stroke='none'/><circle cx='12' cy='19' r='1.4' fill='#000' stroke='none'/>`,
  trash: `<path d='M3 6h18'/><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'/><path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/><path d='M10 11v6'/><path d='M14 11v6'/>`,
  copy: `<rect width='14' height='14' x='8' y='8' rx='2'/><path d='M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2'/>`,
  edit: `<path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'/><path d='M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z'/>`,
  download: `<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><path d='m7 10 5 5 5-5'/><path d='M12 15V3'/>`,
  upload: `<path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><path d='m17 8-5-5-5 5'/><path d='M12 3v12'/>`,
  refresh: `<path d='M3 12a9 9 0 0 1 9-9 9.8 9.8 0 0 1 6.7 2.7L21 8'/><path d='M21 3v5h-5'/><path d='M21 12a9 9 0 0 1-9 9 9.8 9.8 0 0 1-6.7-2.7L3 16'/><path d='M8 16H3v5'/>`,
  filter: `<path d='M22 3H2l8 9.5V19l4 2v-8.5L22 3Z'/>`,
  settings: `<circle cx='12' cy='12' r='3'/><path d='M13.8 2.2a1.8 1.8 0 0 0-3.6 0 1.8 1.8 0 0 1-2.7 1.1 1.8 1.8 0 0 0-2.5 2.5 1.8 1.8 0 0 1-1.1 2.7 1.8 1.8 0 0 0 0 3.6 1.8 1.8 0 0 1 1.1 2.7 1.8 1.8 0 0 0 2.5 2.5 1.8 1.8 0 0 1 2.7 1.1 1.8 1.8 0 0 0 3.6 0 1.8 1.8 0 0 1 2.7-1.1 1.8 1.8 0 0 0 2.5-2.5 1.8 1.8 0 0 1 1.1-2.7 1.8 1.8 0 0 0 0-3.6 1.8 1.8 0 0 1-1.1-2.7 1.8 1.8 0 0 0-2.5-2.5 1.8 1.8 0 0 1-2.7-1.1Z'/>`,

  // ── Objects ──────────────────────────────────────────────────────────────
  eye: `<path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z'/><circle cx='12' cy='12' r='3'/>`,
  'eye-off': `<path d='M9.9 4.2A11 11 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.2 3.2'/><path d='M6.6 6.6A18 18 0 0 0 2 12s3.5 7 10 7a11 11 0 0 0 5.4-1.4'/><path d='M14.1 14.1a3 3 0 1 1-4.2-4.2'/><path d='m2 2 20 20'/>`,
  lock: `<rect width='18' height='11' x='3' y='11' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/>`,
  calendar: `<path d='M8 2v4'/><path d='M16 2v4'/><rect width='18' height='18' x='3' y='4' rx='2'/><path d='M3 10h18'/>`,
  clock: `<circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/>`,
  star: `<path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z'/>`,
  'star-filled': `<path d='m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z' fill='#000'/>`,
  heart: `<path d='M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z'/>`,
  user: `<path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/>`,
  users: `<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/><circle cx='9' cy='7' r='4'/><path d='M22 21v-2a4 4 0 0 0-3-3.9'/><path d='M16 3.1a4 4 0 0 1 0 7.8'/>`,
  mail: `<rect width='20' height='16' x='2' y='4' rx='2'/><path d='m22 7-8.9 5.3a2 2 0 0 1-2.1 0L2 7'/>`,
  link: `<path d='M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.8 1.7'/><path d='M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'/>`,
  image: `<rect width='18' height='18' x='3' y='3' rx='2'/><circle cx='9' cy='9' r='2'/><path d='m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21'/>`,
  file: `<path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/><path d='M14 2v4a2 2 0 0 0 2 2h4'/>`,
  folder: `<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9L9.6 3.9A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>`,
  home: `<path d='M3 9.5 12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'/><path d='M9 22V12h6v10'/>`,
  sun: `<circle cx='12' cy='12' r='4'/><path d='M12 2v2'/><path d='M12 20v2'/><path d='m4.9 4.9 1.4 1.4'/><path d='m17.7 17.7 1.4 1.4'/><path d='M2 12h2'/><path d='M20 12h2'/><path d='m6.3 17.7-1.4 1.4'/><path d='m19.1 4.9-1.4 1.4'/>`,
  moon: `<path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'/>`,
  loader: `<path d='M12 2v4'/><path d='m16.2 7.8 2.9-2.9'/><path d='M18 12h4'/><path d='m16.2 16.2 2.9 2.9'/><path d='M12 18v4'/><path d='m4.9 19.1 2.9-2.9'/><path d='M2 12h4'/><path d='m4.9 4.9 2.9 2.9'/>`,
} as const;

/** Every icon this library ships. */
export type IconName = keyof typeof ICON_BODY;

/** Sorted list of every available icon name. */
export const iconNames: readonly IconName[] = Object.keys(
  ICON_BODY
).sort() as IconName[];

/** Whether a string names an icon in the set. */
export function isIconName(value: string): value is IconName {
  return Object.prototype.hasOwnProperty.call(ICON_BODY, value);
}

/**
 * Percent-encodes the characters a data URI cannot carry literally.
 *
 * Deliberately not `encodeURIComponent`: the SVG source is written with single
 * quotes and no `?`/`&`, so escaping the five characters that actually matter
 * keeps the URI roughly a third shorter and still readable in devtools.
 */
function encodeSvg(svg: string): string {
  return svg
    .replace(/%/g, '%25')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/#/g, '%23')
    .replace(/"/g, '%22')
    .replace(/\s+/g, ' ');
}

const svgCache = new Map<IconName, string>();

/**
 * The `url(...)` value for one icon, ready to assign to `mask-image`.
 *
 * The mask is painted from the source's *alpha*, so the stroke colour in the
 * document is irrelevant — what shows through is whatever
 * `background-color` the rule sets.
 */
export function iconUrl(name: IconName): string {
  const cached = svgCache.get(name);
  if (cached) return cached;
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' ` +
    `stroke='#000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'>` +
    `${ICON_BODY[name]}</svg>`;
  const url = `url("data:image/svg+xml,${encodeSvg(svg)}")`;
  svgCache.set(name, url);
  return url;
}

/**
 * The mask declarations for one icon, without a selector.
 *
 * Use inside a rule that already sizes and colours the box — typically a
 * `::before` on an element the component renders anyway:
 *
 * ```ts
 * `.chip::after { ${iconMaskText('x')} background: currentColor; }`
 * ```
 */
export function iconMaskText(name: IconName): string {
  const url = iconUrl(name);
  return `-webkit-mask-image: ${url}; mask-image: ${url};`;
}

/** {@link iconMaskText} as a composable `css` payload. */
export function iconMask(name: IconName): ComponentStyles {
  return rawCss(iconMaskText(name));
}

/**
 * The shared `.icon` box: a square that tracks the current font size and takes
 * its colour from the text around it.
 *
 * `flex: none` matters — an icon inside a flex row is the one thing that must
 * never be squeezed, and a squeezed mask silently crops the glyph rather than
 * overflowing visibly.
 */
const ICON_BASE_TEXT = `
  .icon {
    display: inline-block;
    flex: none;
    inline-size: var(--bq-icon-size, 1em);
    block-size: var(--bq-icon-size, 1em);
    background-color: currentColor;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-mask-size: contain;
    mask-size: contain;
  }
  /* Windows high-contrast paints backgrounds away; keep the glyph visible. */
  @media (forced-colors: active) {
    .icon { background-color: CanvasText; }
  }
`;

/** The `.icon` base rule on its own, for components that build their own set. */
export const iconBase: ComponentStyles = rawCss(ICON_BASE_TEXT);

function iconRules(names: readonly IconName[]): string {
  const seen = new Set<IconName>();
  let out = '';
  for (const name of names) {
    if (seen.has(name)) continue;
    seen.add(name);
    out += `\n  .icon[data-icon="${name}"] { ${iconMaskText(name)} }`;
  }
  return out;
}

/**
 * A stylesheet fragment carrying the `.icon` box plus the named icons.
 *
 * Name only what the component renders. Every icon is a data URI of a few
 * hundred bytes, and a component that pulls the whole set pays for all of it
 * in every shadow root that adopts the sheet.
 */
export function iconCss(...names: IconName[]): ComponentStyles {
  return rawCss(`${ICON_BASE_TEXT}${iconRules(names)}`);
}

/** Every icon in one fragment. Sized for `bq-icon`; too heavy for anything else. */
export function allIconCss(): ComponentStyles {
  return rawCss(`${ICON_BASE_TEXT}${iconRules(iconNames)}`);
}
