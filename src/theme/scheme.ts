/**
 * The semantic token layer, and the mechanism that lets a page switch it.
 *
 * Every component embeds its own copy of the tokens in its shadow root, which
 * is what makes the library work with no stylesheet to install. It also means
 * a component *defines* `--bq-bg-base` on its own `:host`, and a definition on
 * the element always beats a value inherited from an ancestor — so a page
 * cannot re-theme a component just by setting the variable on `<html>`.
 *
 * The library used to bridge that with `:host-context([data-theme="dark"])`.
 * That selector only exists in Chromium; worse, it appeared in a selector list
 * next to `:host([data-theme="dark"])`, and one unknown selector invalidates
 * the whole list — so Firefox and Safari dropped the entire dark theme.
 *
 * The fix is one level of indirection. Components resolve each semantic token
 * through a *scheme channel*:
 *
 * ```css
 * :host { --bq-bg-base: var(--bq-scheme-bg-base, #ffffff); }
 * ```
 *
 * `--bq-scheme-bg-base` is never defined on the host, so it resolves the
 * ordinary way — by inheritance from the document. {@link getSchemeRootCSS}
 * emits those channel values for `[data-theme="dark"]`, `[data-theme="light"]`
 * and `[data-theme="auto"]`, in plain CSS that every browser understands, and
 * they cascade into every shadow root beneath. Nested themed regions work for
 * free, because inheritance is what the cascade already does.
 */

/** Semantic tokens, without the `--bq-` prefix. */
export type SemanticTokenName = keyof typeof LIGHT_TOKENS;

const LIGHT_TOKENS = {
  'color-scheme': 'light',

  'bg-base': '#ffffff',
  'bg-subtle': '#f8fafc',
  'bg-muted': '#f1f5f9',
  'bg-emphasis': '#e2e8f0',
  'bg-inverse': '#0f172a',

  /* Surfaces stack: sunken < base < raised < overlay. In light mode they are
     told apart by shadow, in dark mode by lightness — which is why an overlay
     needs its own token instead of reusing `bg-base`. */
  'surface-sunken': '#f8fafc',
  'surface-raised': '#ffffff',
  'surface-overlay': '#ffffff',

  /* Translucent interaction layers: they tint whatever they sit on, so one
     pair works on every surface instead of one per background. */
  'bg-hover': 'rgba(15, 23, 42, 0.04)',
  'bg-active': 'rgba(15, 23, 42, 0.08)',
  'bg-selected': 'rgba(37, 99, 235, 0.1)',

  'text-base': '#0f172a',
  'text-muted': '#475569',
  'text-subtle': '#94a3b8',
  'text-inverse': '#f8fafc',
  'text-on-primary': '#ffffff',
  'text-on-danger': '#ffffff',

  'border-base': '#e2e8f0',
  'border-emphasis': '#cbd5e1',
  'border-strong': '#94a3b8',
  'border-focus': '#2563eb',

  'focus-ring': '0 0 0 3px rgba(37, 99, 235, 0.35)',
  'focus-ring-danger': '0 0 0 3px rgba(239, 68, 68, 0.35)',
  'focus-ring-success': '0 0 0 3px rgba(22, 163, 74, 0.35)',
  'focus-ring-warning': '0 0 0 3px rgba(217, 119, 6, 0.35)',

  'overlay-backdrop': 'rgba(15, 23, 42, 0.5)',

  /* Intent surfaces.
   *
   * The palette itself is scheme-independent, so a component that paints a
   * badge with `--bq-color-success-100` on `--bq-color-success-700` text is
   * hard-coding a *light* treatment: those steps are near-white and near-black
   * whatever the page is doing. Every tinted surface in the library — alerts,
   * badges, chips, avatars, tags — goes through these instead, so the tint
   * flips with the scheme while the meaning stays put. */
  'intent-primary-bg': '#dbeafe',
  'intent-primary-fg': '#1d4ed8',
  'intent-primary-border': '#bfdbfe',
  'intent-success-bg': '#dcfce7',
  'intent-success-fg': '#15803d',
  'intent-success-border': '#bbf7d0',
  'intent-danger-bg': '#fee2e2',
  'intent-danger-fg': '#b91c1c',
  'intent-danger-border': '#fecaca',
  'intent-warning-bg': '#fef3c7',
  'intent-warning-fg': '#b45309',
  'intent-warning-border': '#fde68a',
  'intent-info-bg': '#dbeafe',
  'intent-info-fg': '#1d4ed8',
  'intent-info-border': '#bfdbfe',
  'intent-neutral-bg': '#f1f5f9',
  'intent-neutral-fg': '#334155',
  'intent-neutral-border': '#e2e8f0',
} as const;

const DARK_TOKENS: Record<SemanticTokenName, string> = {
  'color-scheme': 'dark',

  'bg-base': '#0f172a',
  'bg-subtle': '#1e293b',
  'bg-muted': '#334155',
  'bg-emphasis': '#475569',
  'bg-inverse': '#f8fafc',

  'surface-sunken': '#020617',
  'surface-raised': '#1e293b',
  'surface-overlay': '#1e293b',

  'bg-hover': 'rgba(248, 250, 252, 0.06)',
  'bg-active': 'rgba(248, 250, 252, 0.12)',
  'bg-selected': 'rgba(96, 165, 250, 0.18)',

  'text-base': '#f8fafc',
  'text-muted': '#cbd5e1',
  'text-subtle': '#94a3b8',
  'text-inverse': '#0f172a',
  'text-on-primary': '#ffffff',
  'text-on-danger': '#ffffff',

  'border-base': '#334155',
  'border-emphasis': '#475569',
  'border-strong': '#64748b',
  'border-focus': '#60a5fa',

  'focus-ring': '0 0 0 3px rgba(96, 165, 250, 0.4)',
  'focus-ring-danger': '0 0 0 3px rgba(248, 113, 113, 0.4)',
  'focus-ring-success': '0 0 0 3px rgba(74, 222, 128, 0.4)',
  'focus-ring-warning': '0 0 0 3px rgba(251, 191, 36, 0.4)',

  'overlay-backdrop': 'rgba(2, 6, 23, 0.72)',

  /* Deep, desaturated tints of the same hue: dark enough to sit on the page
   * without glowing, saturated enough to keep the intent readable. The
   * foreground jumps to the 300 step, which is the lightest one that still
   * carries the hue at small text sizes. */
  'intent-primary-bg': '#172554',
  'intent-primary-fg': '#93c5fd',
  'intent-primary-border': '#1e40af',
  'intent-success-bg': '#052e16',
  'intent-success-fg': '#86efac',
  'intent-success-border': '#166534',
  'intent-danger-bg': '#450a0a',
  'intent-danger-fg': '#fca5a5',
  'intent-danger-border': '#991b1b',
  'intent-warning-bg': '#451a03',
  'intent-warning-fg': '#fcd34d',
  'intent-warning-border': '#92400e',
  'intent-info-bg': '#172554',
  'intent-info-fg': '#93c5fd',
  'intent-info-border': '#1e40af',
  'intent-neutral-bg': '#1e293b',
  'intent-neutral-fg': '#cbd5e1',
  'intent-neutral-border': '#334155',
};

/**
 * Palette and elevation corrections that only make sense in dark mode.
 *
 * The 600-step accents are a shade too dark to read on a slate background, and
 * a shadow tuned for white paper is invisible on one — dark elevation has to be
 * carried by near-opaque black instead.
 */
const DARK_OVERRIDES: Record<string, string> = {
  'color-primary-600': '#3b82f6',
  'color-primary-700': '#2563eb',
  'color-danger-600': '#ef4444',
  'color-success-600': '#22c55e',
  'color-warning-600': '#f59e0b',

  'shadow-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 0 rgba(0, 0, 0, 0.3)',
  'shadow-md':
    '0 2px 4px -1px rgba(0, 0, 0, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.35)',
  'shadow-lg':
    '0 4px 6px -2px rgba(0, 0, 0, 0.4), 0 12px 20px -4px rgba(0, 0, 0, 0.45)',
  'shadow-xl':
    '0 8px 10px -6px rgba(0, 0, 0, 0.45), 0 24px 40px -8px rgba(0, 0, 0, 0.55)',
  'shadow-inner': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.35)',
};

/** Light values, keyed by full custom property name. */
export const lightTokens: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(LIGHT_TOKENS)
    .filter(([name]) => name !== 'color-scheme')
    .map(([name, value]) => [`--bq-${name}`, value])
);

/** Dark values, keyed by full custom property name. */
export const darkTokens: Readonly<Record<string, string>> = Object.fromEntries(
  [...Object.entries(DARK_TOKENS), ...Object.entries(DARK_OVERRIDES)]
    .filter(([name]) => name !== 'color-scheme')
    .map(([name, value]) => [`--bq-${name}`, value])
);

function declarations(
  entries: Iterable<readonly [string, string]>,
  indent = '  '
): string {
  return Array.from(entries)
    .map(([name, value]) => `${indent}--bq-${name}: ${value};`)
    .join('\n');
}

/**
 * The light defaults, each routed through its scheme channel so a document
 * that sets the channel wins without needing `:host-context`.
 */
export function getLightSchemeCSS(indent = '  '): string {
  return Object.entries(LIGHT_TOKENS)
    .map(([name, value]) =>
      name === 'color-scheme'
        ? `${indent}color-scheme: var(--bq-scheme-color-scheme, ${value});`
        : `${indent}--bq-${name}: var(--bq-scheme-${name}, ${value});`
    )
    .join('\n');
}

/**
 * The dark values as literals.
 *
 * Used for the rules that target an explicitly themed element, where the
 * author has said which scheme they want and the ambient channel must not
 * second-guess it.
 */
export function getDarkSchemeCSS(indent = '  '): string {
  return [
    `${indent}color-scheme: dark;`,
    declarations(
      Object.entries(DARK_TOKENS).filter(([name]) => name !== 'color-scheme'),
      indent
    ),
    declarations(Object.entries(DARK_OVERRIDES), indent),
  ].join('\n');
}

function channel(
  tokens: Record<string, string>,
  scheme: string,
  indent = '  '
): string {
  return Object.entries(tokens)
    .map(([name, value]) =>
      name === 'color-scheme'
        ? `${indent}color-scheme: ${scheme};\n${indent}--bq-scheme-color-scheme: ${scheme};`
        : `${indent}--bq-scheme-${name}: ${value};`
    )
    .join('\n');
}

/**
 * Document-level CSS that drives the scheme channel.
 *
 * Install it once (see `installThemeStyles`) and `data-theme` works on any
 * element, in any browser: `dark` and `light` pin a scheme for that subtree,
 * `auto` follows the operating system and re-resolves live with no JavaScript
 * listening for the change.
 */
export function getSchemeRootCSS(): string {
  const dark = channel(DARK_TOKENS, 'dark');
  const light = channel(LIGHT_TOKENS, 'light');
  const darkOverrides = Object.entries(DARK_OVERRIDES)
    .map(([name, value]) => `  --bq-scheme-${name}: ${value};`)
    .join('\n');

  return `[data-theme="dark"] {
${dark}
${darkOverrides}
}

[data-theme="light"] {
${light}
}

@media (prefers-color-scheme: dark) {
  [data-theme="auto"] {
${dark
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
${darkOverrides
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
  }
}`;
}
