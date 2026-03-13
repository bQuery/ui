/**
 * registerAll() — registers every @bquery/ui component with the custom element registry.
 *
 * @param prefix - Tag prefix to use (default: 'bq'). All tags will be `{prefix}-{component}`.
 *
 * @example
 *   import { registerAll } from '@bquery/ui/register';
 *   registerAll(); // registers bq-button, bq-input, etc.
 *   registerAll('my'); // registers my-button, my-input, etc.
 */
import { registerBqButton } from './components/button/index.js';
import { registerBqIconButton } from './components/icon-button/index.js';
import { registerBqCard } from './components/card/index.js';
import { registerBqBadge } from './components/badge/index.js';
import { registerBqAvatar } from './components/avatar/index.js';
import { registerBqChip } from './components/chip/index.js';
import { registerBqAlert } from './components/alert/index.js';
import { registerBqSpinner } from './components/spinner/index.js';
import { registerBqSkeleton } from './components/skeleton/index.js';
import { registerBqProgress } from './components/progress/index.js';
import { registerBqTooltip } from './components/tooltip/index.js';
import { registerBqDivider } from './components/divider/index.js';
import { registerBqInput } from './components/input/index.js';
import { registerBqTextarea } from './components/textarea/index.js';
import { registerBqCheckbox } from './components/checkbox/index.js';
import { registerBqRadio } from './components/radio/index.js';
import { registerBqSwitch } from './components/switch/index.js';
import { registerBqSelect } from './components/select/index.js';
import { registerBqSlider } from './components/slider/index.js';
import { registerBqTabs } from './components/tabs/index.js';
import { registerBqAccordion } from './components/accordion/index.js';
import { registerBqDialog } from './components/dialog/index.js';
import { registerBqDrawer } from './components/drawer/index.js';
import { registerBqToast } from './components/toast/index.js';
import { registerBqBreadcrumbs } from './components/breadcrumbs/index.js';
import { registerBqPagination } from './components/pagination/index.js';
import { registerBqTable } from './components/table/index.js';
import { registerBqEmptyState } from './components/empty-state/index.js';

export interface RegisterOptions {
  /** Element tag prefix. Defaults to 'bq'. */
  prefix?: string;
}

export function registerAll(options: RegisterOptions = {}): void {
  const { prefix = 'bq' } = options;
  registerBqButton(prefix);
  registerBqIconButton(prefix);
  registerBqCard(prefix);
  registerBqBadge(prefix);
  registerBqAvatar(prefix);
  registerBqChip(prefix);
  registerBqAlert(prefix);
  registerBqSpinner(prefix);
  registerBqSkeleton(prefix);
  registerBqProgress(prefix);
  registerBqTooltip(prefix);
  registerBqDivider(prefix);
  registerBqInput(prefix);
  registerBqTextarea(prefix);
  registerBqCheckbox(prefix);
  registerBqRadio(prefix);
  registerBqSwitch(prefix);
  registerBqSelect(prefix);
  registerBqSlider(prefix);
  registerBqTabs(prefix);
  registerBqAccordion(prefix);
  registerBqDialog(prefix);
  registerBqDrawer(prefix);
  registerBqToast(prefix);
  registerBqBreadcrumbs(prefix);
  registerBqPagination(prefix);
  registerBqTable(prefix);
  registerBqEmptyState(prefix);
}
