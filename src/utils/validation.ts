/**
 * Constraint validation for @bquery/ui form controls.
 *
 * The library's form controls submit through a hidden-input proxy (see
 * `form.ts`), and hidden inputs are *barred from constraint validation* by the
 * HTML spec. That means `required`, `minlength`, `pattern` and friends render
 * as attributes but the browser never enforces them, and a `<form>` full of
 * `bq-*` controls submits regardless of what the user typed.
 *
 * This module closes that gap by reimplementing the parts of the Constraint
 * Validation API that apply to text-like values, and by intercepting form
 * submission for the controls that opted in.
 *
 * The rule evaluation in {@link validateValue} is a pure function, so the
 * semantics — which are fiddly, and where deviating from the platform would be
 * a bug — are testable without a DOM.
 */
import { t } from '../i18n/index.js';
import type { ComponentScope } from './component.js';

/**
 * The subset of `ValidityState` this module can determine.
 *
 * `badInput` and `stepMismatch` for date-like types are deliberately absent:
 * they depend on a native control's parsing, which a proxied value has no
 * access to.
 */
export interface ValidityFlags {
  /** A required field was left empty. */
  valueMissing: boolean;
  /** The value does not match the declared `type`. */
  typeMismatch: boolean;
  /** The value does not match the declared `pattern`. */
  patternMismatch: boolean;
  /** Shorter than `minlength`. */
  tooShort: boolean;
  /** Longer than `maxlength`. */
  tooLong: boolean;
  /** Numerically below `min`. */
  rangeUnderflow: boolean;
  /** Numerically above `max`. */
  rangeOverflow: boolean;
  /** Not on the `step` grid. */
  stepMismatch: boolean;
  /** A message was installed via `setCustomValidity()`. */
  customError: boolean;
  /** True when every other flag is false. */
  valid: boolean;
}

/** Declarative constraints, mirroring the equivalent HTML attributes. */
export interface ValidationRules {
  required?: boolean;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  pattern?: string | undefined;
  /** `email`, `url` and `number` are enforced; anything else is treated as text. */
  type?: string | undefined;
  /** Message installed by `setCustomValidity()`. */
  customError?: string | undefined;
}

const VALID: ValidityFlags = {
  valueMissing: false,
  typeMismatch: false,
  patternMismatch: false,
  tooShort: false,
  tooLong: false,
  rangeUnderflow: false,
  rangeOverflow: false,
  stepMismatch: false,
  customError: false,
  valid: true,
};

// Deliberately permissive, matching the HTML spec's definition of a valid
// email address rather than trying to be cleverer than the platform.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return Boolean(url.protocol);
  } catch {
    return false;
  }
}

/** Floating-point-safe step check. */
function offGrid(value: number, min: number, step: number): boolean {
  if (!Number.isFinite(step) || step <= 0) return false;
  const offset = (value - min) / step;
  const nearest = Math.round(offset);
  // 1e-9 absorbs the representation error of decimal steps like 0.1, which
  // would otherwise report a mismatch for values the user typed exactly.
  return Math.abs(offset - nearest) > 1e-9;
}

/**
 * Evaluates a value against a set of constraints.
 *
 * Follows the platform's ordering rules: an empty value only ever triggers
 * `valueMissing`, because the browser does not apply format or range
 * constraints to a field the user has not filled in.
 */
export function validateValue(
  value: string,
  rules: ValidationRules = {}
): ValidityFlags {
  const flags: ValidityFlags = { ...VALID };
  const customError = Boolean(rules.customError);
  const trimmed = value.trim();

  if (rules.required && trimmed === '') {
    return { ...flags, valueMissing: true, customError, valid: false };
  }

  // An empty optional field is valid regardless of the other constraints —
  // this is what lets `minlength` coexist with an optional input.
  if (trimmed === '') {
    return { ...flags, customError, valid: !customError };
  }

  if (rules.type === 'email') flags.typeMismatch = !EMAIL_RE.test(value);
  else if (rules.type === 'url') flags.typeMismatch = !isValidUrl(value);
  else if (rules.type === 'number')
    flags.typeMismatch = !Number.isFinite(Number(value));

  if (rules.pattern) {
    try {
      // Anchored, as the platform does for the `pattern` attribute.
      flags.patternMismatch = !new RegExp(`^(?:${rules.pattern})$`, 'v').test(
        value
      );
    } catch {
      try {
        flags.patternMismatch = !new RegExp(`^(?:${rules.pattern})$`).test(
          value
        );
      } catch {
        // An unparseable pattern is ignored rather than failing the field,
        // matching how browsers treat an invalid `pattern` attribute.
        flags.patternMismatch = false;
      }
    }
  }

  if (typeof rules.minLength === 'number' && value.length < rules.minLength) {
    flags.tooShort = true;
  }
  if (typeof rules.maxLength === 'number' && value.length > rules.maxLength) {
    flags.tooLong = true;
  }

  const numeric = Number(value);
  if (!flags.typeMismatch && Number.isFinite(numeric)) {
    if (typeof rules.min === 'number' && numeric < rules.min) {
      flags.rangeUnderflow = true;
    }
    if (typeof rules.max === 'number' && numeric > rules.max) {
      flags.rangeOverflow = true;
    }
    if (typeof rules.step === 'number') {
      flags.stepMismatch = offGrid(numeric, rules.min ?? 0, rules.step);
    }
  }

  flags.customError = customError;
  flags.valid =
    !flags.valueMissing &&
    !flags.typeMismatch &&
    !flags.patternMismatch &&
    !flags.tooShort &&
    !flags.tooLong &&
    !flags.rangeUnderflow &&
    !flags.rangeOverflow &&
    !flags.stepMismatch &&
    !flags.customError;

  return flags;
}

/**
 * Picks the localized message for a set of flags.
 *
 * A custom message always wins — it is the author speaking about their own
 * field, which is more useful than a generic constraint message.
 */
export function validationMessageFor(
  flags: ValidityFlags,
  rules: ValidationRules = {}
): string {
  if (flags.valid) return '';
  if (flags.customError && rules.customError) return rules.customError;
  if (flags.valueMissing) return t('validation.valueMissing');
  if (flags.typeMismatch) {
    if (rules.type === 'email') return t('validation.typeMismatchEmail');
    if (rules.type === 'url') return t('validation.typeMismatchUrl');
    if (rules.type === 'number') return t('validation.typeMismatchNumber');
  }
  if (flags.tooShort)
    return t('validation.tooShort', { min: rules.minLength ?? 0 });
  if (flags.tooLong)
    return t('validation.tooLong', { max: rules.maxLength ?? 0 });
  if (flags.rangeUnderflow)
    return t('validation.rangeUnderflow', { min: rules.min ?? 0 });
  if (flags.rangeOverflow)
    return t('validation.rangeOverflow', { max: rules.max ?? 0 });
  if (flags.stepMismatch) return t('validation.stepMismatch');
  if (flags.patternMismatch) return t('validation.patternMismatch');
  return t('validation.invalid');
}

// ─── Host binding ────────────────────────────────────────────────────────────

/** The validation surface added to a form control's host element. */
export interface ValidatableElement extends HTMLElement {
  /** Current validity flags. */
  readonly validity: ValidityFlags;
  /** Message for the current validity, or `''` when valid. */
  readonly validationMessage: string;
  /** True when the control satisfies its constraints. Fires `bq-invalid` when it does not. */
  checkValidity(): boolean;
  /** Like `checkValidity()`, but also surfaces the message to the user. */
  reportValidity(): boolean;
  /** Installs (or clears, with `''`) an author-defined error. */
  setCustomValidity(message: string): void;
}

/** Options for {@link bindValidation}. */
export interface ValidationBindingOptions {
  /** Reads the value to validate. */
  value: () => string;
  /**
   * Reads the constraints. Called on every check so attribute changes take
   * effect without rebinding.
   */
  rules?: () => ValidationRules;
  /**
   * Displays a message on the control. Defaults to setting the `error`
   * attribute, which every form control in this library already renders.
   */
  show?: (message: string) => void;
}

/** Registry of controls per form, so submission can validate them as a group. */
const formRegistry = new WeakMap<HTMLFormElement, Set<ValidatableElement>>();
const formListeners = new WeakSet<HTMLFormElement>();

function readAttributeRules(el: HTMLElement): ValidationRules {
  const num = (name: string): number | undefined => {
    const raw = el.getAttribute(name);
    if (raw === null || raw.trim() === '') return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const rules: ValidationRules = { required: el.hasAttribute('required') };
  const minLength = num('minlength');
  if (minLength !== undefined) rules.minLength = minLength;
  const maxLength = num('maxlength');
  if (maxLength !== undefined) rules.maxLength = maxLength;
  const min = num('min');
  if (min !== undefined) rules.min = min;
  const max = num('max');
  if (max !== undefined) rules.max = max;
  const step = num('step');
  if (step !== undefined) rules.step = step;
  const pattern = el.getAttribute('pattern');
  if (pattern) rules.pattern = pattern;
  const type = el.getAttribute('type');
  if (type) rules.type = type;
  return rules;
}

/**
 * Validates every registered control in a form, blocking submission and
 * focusing the first offender when one fails.
 */
function attachFormGuard(form: HTMLFormElement, scope: ComponentScope): void {
  if (formListeners.has(form)) return;
  formListeners.add(form);
  // Capture phase, so the guard runs before author-supplied submit handlers
  // and a rejected submission never reaches application code.
  scope.on(
    form,
    'submit',
    (event) => {
      if (form.hasAttribute('novalidate')) return;
      const controls = formRegistry.get(form);
      if (!controls || controls.size === 0) return;
      let firstInvalid: ValidatableElement | null = null;
      for (const control of controls) {
        if (!control.isConnected) continue;
        if (!control.reportValidity() && !firstInvalid) firstInvalid = control;
      }
      if (!firstInvalid) return;
      event.preventDefault();
      event.stopPropagation();
      firstInvalid.focus();
    },
    true
  );
  scope.add(() => formListeners.delete(form));
}

/**
 * Gives a component the Constraint Validation surface and enrols it in its
 * form's submit guard.
 *
 * ```ts
 * connected() {
 *   const self = host(this);
 *   const scope = bind(self);
 *   bindValidation(self, scope, { value: () => self.getAttribute('value') ?? '' });
 * }
 * ```
 */
export function bindValidation(
  el: HTMLElement,
  scope: ComponentScope,
  options: ValidationBindingOptions
): ValidatableElement {
  const target = el as ValidatableElement;
  let customError = '';

  const readRules = (): ValidationRules => {
    const base = options.rules?.() ?? readAttributeRules(el);
    return customError ? { ...base, customError } : base;
  };

  const show =
    options.show ??
    ((message: string) => {
      if (message) el.setAttribute('error', message);
      else el.removeAttribute('error');
    });

  const evaluate = (): ValidityFlags =>
    validateValue(options.value(), readRules());

  Object.defineProperties(target, {
    validity: {
      get: evaluate,
      configurable: true,
      enumerable: false,
    },
    validationMessage: {
      get: () => validationMessageFor(evaluate(), readRules()),
      configurable: true,
      enumerable: false,
    },
  });

  target.checkValidity = function checkValidity(): boolean {
    const flags = evaluate();
    el.setAttribute('aria-invalid', flags.valid ? 'false' : 'true');
    if (flags.valid) return true;
    // Cancelable, mirroring the platform's `invalid` event: cancelling it
    // suppresses the default reporting in `reportValidity()`.
    el.dispatchEvent(
      new CustomEvent('bq-invalid', {
        detail: {
          validity: flags,
          message: validationMessageFor(flags, readRules()),
        },
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
    return false;
  };

  target.reportValidity = function reportValidity(): boolean {
    const flags = evaluate();
    el.setAttribute('aria-invalid', flags.valid ? 'false' : 'true');
    if (flags.valid) {
      show('');
      return true;
    }
    const message = validationMessageFor(flags, readRules());
    const notCancelled = el.dispatchEvent(
      new CustomEvent('bq-invalid', {
        detail: { validity: flags, message },
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
    if (notCancelled) show(message);
    return false;
  };

  target.setCustomValidity = function setCustomValidity(
    message: string
  ): void {
    customError = message ?? '';
  };

  const form = el.closest('form');
  if (form) {
    let controls = formRegistry.get(form);
    if (!controls) {
      controls = new Set();
      formRegistry.set(form, controls);
    }
    controls.add(target);
    attachFormGuard(form, scope);
    scope.add(() => {
      formRegistry.get(form)?.delete(target);
    });
  }

  scope.add(() => {
    delete (target as Partial<ValidatableElement>).checkValidity;
    delete (target as Partial<ValidatableElement>).reportValidity;
    delete (target as Partial<ValidatableElement>).setCustomValidity;
  });

  return target;
}
