/**
 * Utilities for @bquery/ui
 */
export {
  announce,
  ariaBoolean,
  linkDescribedBy,
  setLabelledBy,
  unlinkDescribedBy,
} from './aria.js';
export { cn } from './cn.js';
export {
  captureFocus,
  markFocus,
  restoreFocus,
  restorePreservedFocus,
  trackFocus,
} from './focus.js';
export type { FocusSnapshot } from './focus.js';
export {
  allIconCss,
  iconBase,
  iconCss,
  iconMask,
  iconMaskText,
  iconNames,
  iconUrl,
  isIconName,
} from './icons.js';
export type { IconName } from './icons.js';
export { bind, host, release, store } from './component.js';
export type { ComponentScope, Disposer } from './component.js';
export {
  dispatch,
  getFocusableElements,
  getSlotted,
  isFocusable,
  trapFocus,
  uniqueId,
} from './dom.js';
export { bindFormProxy, createFormProxy, syncFormProxy } from './form.js';
export type {
  FormProxy,
  FormProxyBinding,
  FormProxyBindingOptions,
} from './form.js';
export {
  bindValidation,
  validateValue,
  validationMessageFor,
} from './validation.js';
export type {
  ValidatableElement,
  ValidationBindingOptions,
  ValidationRules,
  ValidityFlags,
} from './validation.js';
export {
  autoPosition,
  computePosition,
  formatPlacement,
  parsePlacement,
  positionElement,
  resolvePosition,
} from './position.js';
export type {
  Align,
  Placement,
  PlacementInput,
  PositionOptions,
  PositionResult,
  Rect,
  ResolvePositionInput,
  Side,
} from './position.js';
export {
  baseStyles,
  fieldStyles,
  fieldStylesText,
  focusRing,
  focusRingStyles,
  focusVisible,
  focusVisibleStyles,
  getBaseStyles,
  rawCss,
  reset,
  srOnly,
  srOnlyStyles,
} from './styles.js';
