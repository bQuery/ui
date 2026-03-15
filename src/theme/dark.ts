/**
 * Dark theme for @bquery/ui
 */
export const darkTheme = {
  name: 'dark',
  colorScheme: 'dark' as const,
  tokens: {
    '--bq-bg-base': '#0f172a',
    '--bq-bg-subtle': '#1e293b',
    '--bq-bg-muted': '#334155',
    '--bq-bg-emphasis': '#475569',

    '--bq-text-base': '#f8fafc',
    '--bq-text-muted': '#cbd5e1',
    '--bq-text-subtle': '#94a3b8',
    '--bq-text-on-primary': '#ffffff',
    '--bq-text-on-danger': '#ffffff',

    '--bq-border-base': '#334155',
    '--bq-border-emphasis': '#475569',
    '--bq-border-focus': '#60a5fa',

    '--bq-focus-ring': '0 0 0 3px rgba(96, 165, 250, 0.35)',
    '--bq-focus-ring-danger': '0 0 0 3px rgba(248, 113, 113, 0.35)',
  },
};

/**
 * Generates the CSS for the dark theme overrides.
 */
export function getDarkThemeCSS(): string {
  return `
:host([data-theme="dark"]),
:host-context([data-theme="dark"]) {
  /* Semantic tokens (dark) */
  --bq-bg-base: #0f172a;
  --bq-bg-subtle: #1e293b;
  --bq-bg-muted: #334155;
  --bq-bg-emphasis: #475569;

  --bq-text-base: #f8fafc;
  --bq-text-muted: #cbd5e1;
  --bq-text-subtle: #94a3b8;
  --bq-text-on-primary: #ffffff;
  --bq-text-on-danger: #ffffff;

  --bq-border-base: #334155;
  --bq-border-emphasis: #475569;
  --bq-border-focus: #60a5fa;

  --bq-focus-ring: 0 0 0 3px rgba(96, 165, 250, 0.35);
  --bq-focus-ring-danger: 0 0 0 3px rgba(248, 113, 113, 0.35);

  /* Dark color overrides */
  --bq-color-primary-600: #3b82f6;
  --bq-color-primary-700: #2563eb;
  --bq-color-danger-600: #ef4444;
  --bq-color-success-600: #22c55e;
  --bq-color-warning-600: #f59e0b;
}
`.trim();
}
