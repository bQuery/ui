import { getTokensCSS } from '../tokens/index.js';

/**
 * Default (light) theme for @bquery/ui
 */
export const defaultTheme = {
  name: 'default',
  colorScheme: 'light' as const,
  tokens: {
    // Semantic color mappings
    '--bq-bg-base': '#ffffff',
    '--bq-bg-subtle': '#f8fafc',
    '--bq-bg-muted': '#f1f5f9',
    '--bq-bg-emphasis': '#e2e8f0',

    '--bq-text-base': '#0f172a',
    '--bq-text-muted': '#475569',
    '--bq-text-subtle': '#94a3b8',
    '--bq-text-on-primary': '#ffffff',
    '--bq-text-on-danger': '#ffffff',

    '--bq-border-base': '#e2e8f0',
    '--bq-border-emphasis': '#cbd5e1',
    '--bq-border-focus': '#2563eb',

    '--bq-focus-ring': '0 0 0 3px rgba(37, 99, 235, 0.35)',
    '--bq-focus-ring-danger': '0 0 0 3px rgba(239, 68, 68, 0.35)',
  },
};

/**
 * Generates the CSS for the default light theme, including all design tokens.
 */
export function getDefaultThemeCSS(): string {
  return `
:host {
  ${getTokensCSS()}

  /* Semantic tokens (light) */
  --bq-bg-base: #ffffff;
  --bq-bg-subtle: #f8fafc;
  --bq-bg-muted: #f1f5f9;
  --bq-bg-emphasis: #e2e8f0;

  --bq-text-base: #0f172a;
  --bq-text-muted: #475569;
  --bq-text-subtle: #94a3b8;
  --bq-text-on-primary: #ffffff;
  --bq-text-on-danger: #ffffff;

  --bq-border-base: #e2e8f0;
  --bq-border-emphasis: #cbd5e1;
  --bq-border-focus: #2563eb;

  --bq-focus-ring: 0 0 0 3px rgba(37, 99, 235, 0.35);
  --bq-focus-ring-danger: 0 0 0 3px rgba(239, 68, 68, 0.35);
}
`.trim();
}
