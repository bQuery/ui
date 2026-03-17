/**
 * Design tokens index - exports all token groups and the CSS custom properties string.
 */
export { colors } from './colors.js';
export type { ColorToken } from './colors.js';

export { typography } from './typography.js';
export type { TypographyToken } from './typography.js';

export { motion } from './motion.js';
export type { MotionToken } from './motion.js';

/**
 * Returns the complete CSS custom property declaration block for all design tokens.
 * Embed this in a `:root` or `:host` block.
 */
export function getTokensCSS(): string {
  return `
  /* === Colors: Primary === */
  --bq-color-primary-50: #eff6ff;
  --bq-color-primary-100: #dbeafe;
  --bq-color-primary-200: #bfdbfe;
  --bq-color-primary-300: #93c5fd;
  --bq-color-primary-400: #60a5fa;
  --bq-color-primary-500: #3b82f6;
  --bq-color-primary-600: #2563eb;
  --bq-color-primary-700: #1d4ed8;
  --bq-color-primary-800: #1e40af;
  --bq-color-primary-900: #1e3a8a;

  /* === Colors: Secondary === */
  --bq-color-secondary-50: #f8fafc;
  --bq-color-secondary-100: #f1f5f9;
  --bq-color-secondary-200: #e2e8f0;
  --bq-color-secondary-300: #cbd5e1;
  --bq-color-secondary-400: #94a3b8;
  --bq-color-secondary-500: #64748b;
  --bq-color-secondary-600: #475569;
  --bq-color-secondary-700: #334155;
  --bq-color-secondary-800: #1e293b;
  --bq-color-secondary-900: #0f172a;

  /* === Colors: Danger === */
  --bq-color-danger-50: #fef2f2;
  --bq-color-danger-100: #fee2e2;
  --bq-color-danger-200: #fecaca;
  --bq-color-danger-300: #fca5a5;
  --bq-color-danger-400: #f87171;
  --bq-color-danger-500: #ef4444;
  --bq-color-danger-600: #dc2626;
  --bq-color-danger-700: #b91c1c;
  --bq-color-danger-800: #991b1b;
  --bq-color-danger-900: #7f1d1d;

  /* === Colors: Success === */
  --bq-color-success-50: #f0fdf4;
  --bq-color-success-100: #dcfce7;
  --bq-color-success-200: #bbf7d0;
  --bq-color-success-300: #86efac;
  --bq-color-success-400: #4ade80;
  --bq-color-success-500: #22c55e;
  --bq-color-success-600: #16a34a;
  --bq-color-success-700: #15803d;
  --bq-color-success-800: #166534;
  --bq-color-success-900: #14532d;

  /* === Colors: Warning === */
  --bq-color-warning-50: #fffbeb;
  --bq-color-warning-100: #fef3c7;
  --bq-color-warning-200: #fde68a;
  --bq-color-warning-300: #fcd34d;
  --bq-color-warning-400: #fbbf24;
  --bq-color-warning-500: #f59e0b;
  --bq-color-warning-600: #d97706;
  --bq-color-warning-700: #b45309;
  --bq-color-warning-800: #92400e;
  --bq-color-warning-900: #78350f;

  /* === Colors: Info === */
  --bq-color-info-50: #eff6ff;
  --bq-color-info-100: #dbeafe;
  --bq-color-info-200: #bfdbfe;
  --bq-color-info-300: #93c5fd;
  --bq-color-info-400: #60a5fa;
  --bq-color-info-500: #3b82f6;
  --bq-color-info-600: #2563eb;
  --bq-color-info-700: #1d4ed8;
  --bq-color-info-800: #1e40af;
  --bq-color-info-900: #1e3a8a;

  /* === Typography === */
  --bq-font-family-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --bq-font-family-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace;
  --bq-font-size-xs: 0.75rem;
  --bq-font-size-sm: 0.875rem;
  --bq-font-size-md: 1rem;
  --bq-font-size-lg: 1.125rem;
  --bq-font-size-xl: 1.25rem;
  --bq-font-size-2xl: 1.5rem;
  --bq-font-weight-normal: 400;
  --bq-font-weight-medium: 500;
  --bq-font-weight-semibold: 600;
  --bq-font-weight-bold: 700;
  --bq-line-height-tight: 1.25;
  --bq-line-height-normal: 1.5;
  --bq-line-height-relaxed: 1.625;

  /* === Spacing === */
  --bq-space-0: 0;
  --bq-space-1: 0.25rem;
  --bq-space-2: 0.5rem;
  --bq-space-3: 0.75rem;
  --bq-space-4: 1rem;
  --bq-space-5: 1.25rem;
  --bq-space-6: 1.5rem;
  --bq-space-8: 2rem;
  --bq-space-10: 2.5rem;
  --bq-space-12: 3rem;
  --bq-space-16: 4rem;

  /* === Border Radius === */
  --bq-radius-none: 0;
  --bq-radius-sm: 0.25rem;
  --bq-radius-md: 0.375rem;
  --bq-radius-lg: 0.5rem;
  --bq-radius-xl: 0.75rem;
  --bq-radius-2xl: 1rem;
  --bq-radius-full: 9999px;

  /* === Shadows === */
  --bq-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --bq-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --bq-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --bq-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --bq-shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

  /* === Motion === */
  --bq-duration-fast: 150ms;
  --bq-duration-normal: 200ms;
  --bq-duration-slow: 300ms;
  --bq-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --bq-easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --bq-easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
  --bq-easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* === Z-Index === */
  --bq-z-base: 0;
  --bq-z-raised: 10;
  --bq-z-dropdown: 100;
  --bq-z-sticky: 200;
  --bq-z-overlay: 300;
  --bq-z-modal: 400;
  --bq-z-popover: 500;
  --bq-z-toast: 600;
  --bq-z-tooltip: 700;
`.trim();
}
