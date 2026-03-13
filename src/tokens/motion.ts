/**
 * Motion / animation design tokens for @bquery/ui
 */
export const motion = {
  // Durations
  durationInstant: '0ms',
  durationFast: '150ms',
  durationNormal: '200ms',
  durationSlow: '300ms',
  durationSlower: '500ms',

  // Easing functions
  easingLinear: 'linear',
  easingStandard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easingDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  easingAccelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  easingEmphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  easingSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

export type MotionToken = keyof typeof motion;
