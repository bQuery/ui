/**
 * @bquery/ui — Main entry point
 *
 * Tree-shakeable ESM package. Import only what you need, or use registerAll() for everything.
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

// Registration helpers
export { registerAll } from './register.js';
export type { RegisterOptions } from './register.js';
