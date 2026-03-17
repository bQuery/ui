/**
 * Design token color definitions for @bquery/ui
 */
export const colors = {
  // Brand - Primary (Blue)
  primary50: '#eff6ff',
  primary100: '#dbeafe',
  primary200: '#bfdbfe',
  primary300: '#93c5fd',
  primary400: '#60a5fa',
  primary500: '#3b82f6',
  primary600: '#2563eb',
  primary700: '#1d4ed8',
  primary800: '#1e40af',
  primary900: '#1e3a8a',

  // Secondary (Slate)
  secondary50: '#f8fafc',
  secondary100: '#f1f5f9',
  secondary200: '#e2e8f0',
  secondary300: '#cbd5e1',
  secondary400: '#94a3b8',
  secondary500: '#64748b',
  secondary600: '#475569',
  secondary700: '#334155',
  secondary800: '#1e293b',
  secondary900: '#0f172a',

  // Danger (Red)
  danger50: '#fef2f2',
  danger100: '#fee2e2',
  danger200: '#fecaca',
  danger300: '#fca5a5',
  danger400: '#f87171',
  danger500: '#ef4444',
  danger600: '#dc2626',
  danger700: '#b91c1c',
  danger800: '#991b1b',
  danger900: '#7f1d1d',

  // Success (Green)
  success50: '#f0fdf4',
  success100: '#dcfce7',
  success200: '#bbf7d0',
  success300: '#86efac',
  success400: '#4ade80',
  success500: '#22c55e',
  success600: '#16a34a',
  success700: '#15803d',
  success800: '#166534',
  success900: '#14532d',

  // Warning (Amber)
  warning50: '#fffbeb',
  warning100: '#fef3c7',
  warning200: '#fde68a',
  warning300: '#fcd34d',
  warning400: '#fbbf24',
  warning500: '#f59e0b',
  warning600: '#d97706',
  warning700: '#b45309',
  warning800: '#92400e',
  warning900: '#78350f',

  // Info (Blue alias)
  info50: '#eff6ff',
  info100: '#dbeafe',
  info200: '#bfdbfe',
  info300: '#93c5fd',
  info400: '#60a5fa',
  info500: '#3b82f6',
  info600: '#2563eb',
  info700: '#1d4ed8',
  info800: '#1e40af',
  info900: '#1e3a8a',

  // Neutral
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;
