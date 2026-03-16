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

import { registerAll } from './register.js';

// Components
import { __bqComponentEntry as accordionComponentEntry } from './components/accordion/index.js';
import { __bqComponentEntry as alertComponentEntry } from './components/alert/index.js';
import { __bqComponentEntry as avatarComponentEntry } from './components/avatar/index.js';
import { __bqComponentEntry as badgeComponentEntry } from './components/badge/index.js';
import { __bqComponentEntry as breadcrumbsComponentEntry } from './components/breadcrumbs/index.js';
import { __bqComponentEntry as buttonComponentEntry } from './components/button/index.js';
import { __bqComponentEntry as cardComponentEntry } from './components/card/index.js';
import { __bqComponentEntry as checkboxComponentEntry } from './components/checkbox/index.js';
import { __bqComponentEntry as chipComponentEntry } from './components/chip/index.js';
import { __bqComponentEntry as dialogComponentEntry } from './components/dialog/index.js';
import { __bqComponentEntry as dividerComponentEntry } from './components/divider/index.js';
import { __bqComponentEntry as drawerComponentEntry } from './components/drawer/index.js';
import { __bqComponentEntry as emptyStateComponentEntry } from './components/empty-state/index.js';
import { __bqComponentEntry as iconButtonComponentEntry } from './components/icon-button/index.js';
import { __bqComponentEntry as inputComponentEntry } from './components/input/index.js';
import { __bqComponentEntry as paginationComponentEntry } from './components/pagination/index.js';
import { __bqComponentEntry as progressComponentEntry } from './components/progress/index.js';
import { __bqComponentEntry as radioComponentEntry } from './components/radio/index.js';
import { __bqComponentEntry as selectComponentEntry } from './components/select/index.js';
import { __bqComponentEntry as skeletonComponentEntry } from './components/skeleton/index.js';
import { __bqComponentEntry as sliderComponentEntry } from './components/slider/index.js';
import { __bqComponentEntry as spinnerComponentEntry } from './components/spinner/index.js';
import { __bqComponentEntry as switchComponentEntry } from './components/switch/index.js';
import { __bqComponentEntry as tableComponentEntry } from './components/table/index.js';
import { __bqComponentEntry as tabsComponentEntry } from './components/tabs/index.js';
import { __bqComponentEntry as textareaComponentEntry } from './components/textarea/index.js';
import { __bqComponentEntry as tooltipComponentEntry } from './components/tooltip/index.js';
// Toast is imported directly because its wrapper both registers the component and re-exports showToast().
import './components/toast/index.js';

// Keep component wrappers reachable from a private symbol-keyed property so the root bundle
// preserves import-time registration without adding a typed public API surface.
const COMPONENT_ENTRY_MAP_KEY = Symbol.for('@bquery/ui.componentEntryMap');

Object.defineProperty(registerAll, COMPONENT_ENTRY_MAP_KEY, {
  value: {
    'accordion': accordionComponentEntry,
    'alert': alertComponentEntry,
    'avatar': avatarComponentEntry,
    'badge': badgeComponentEntry,
    'breadcrumbs': breadcrumbsComponentEntry,
    'button': buttonComponentEntry,
    'card': cardComponentEntry,
    'checkbox': checkboxComponentEntry,
    'chip': chipComponentEntry,
    'dialog': dialogComponentEntry,
    'divider': dividerComponentEntry,
    'drawer': drawerComponentEntry,
    'empty-state': emptyStateComponentEntry,
    'icon-button': iconButtonComponentEntry,
    'input': inputComponentEntry,
    'pagination': paginationComponentEntry,
    'progress': progressComponentEntry,
    'radio': radioComponentEntry,
    'select': selectComponentEntry,
    'skeleton': skeletonComponentEntry,
    'slider': sliderComponentEntry,
    'spinner': spinnerComponentEntry,
    'switch': switchComponentEntry,
    'table': tableComponentEntry,
    'tabs': tabsComponentEntry,
    'textarea': textareaComponentEntry,
    'tooltip': tooltipComponentEntry,
  },
  writable: false,
  enumerable: false,
  configurable: false,
});

// Re-export the toast API while other components continue to register via import side effects only.
export * from './components/toast/index.js';

// Legacy compatibility helpers
export { registerAll };
export type { RegisterOptions } from './register.js';
