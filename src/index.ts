/**
 * @bquery/ui — Main entry point
 *
 * Importing this package registers all bq components via the native @bquery/bquery component API.
 */

// Design tokens
export * from './tokens/index.js';

// Theme system
export * from './theme/index.js';

// i18n
export * from './i18n/index.js';

// Utilities
export * from './utils/index.js';

// Components
export * from './components/index.js';

// Legacy compatibility helpers
export { registerAll } from './register.js';
export type { RegisterOptions } from './register.js';
