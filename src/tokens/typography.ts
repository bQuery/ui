/**
 * Typography design tokens for @bquery/ui
 */
export const typography = {
  // Font families
  fontFamilySans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyMono: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
  fontFamilySerif: "Georgia, Cambria, 'Times New Roman', Times, serif",

  // Font sizes
  fontSizeXs: '0.75rem',    // 12px
  fontSizeSm: '0.875rem',   // 14px
  fontSizeMd: '1rem',       // 16px
  fontSizeLg: '1.125rem',   // 18px
  fontSizeXl: '1.25rem',    // 20px
  fontSize2xl: '1.5rem',    // 24px
  fontSize3xl: '1.875rem',  // 30px
  fontSize4xl: '2.25rem',   // 36px

  // Font weights
  fontWeightLight: '300',
  fontWeightNormal: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  fontWeightBold: '700',
  fontWeightExtrabold: '800',

  // Line heights
  lineHeightNone: '1',
  lineHeightTight: '1.25',
  lineHeightSnug: '1.375',
  lineHeightNormal: '1.5',
  lineHeightRelaxed: '1.625',
  lineHeightLoose: '2',

  // Letter spacing
  letterSpacingTighter: '-0.05em',
  letterSpacingTight: '-0.025em',
  letterSpacingNormal: '0em',
  letterSpacingWide: '0.025em',
  letterSpacingWider: '0.05em',
  letterSpacingWidest: '0.1em',
} as const;

export type TypographyToken = keyof typeof typography;
