/**
 * Form participation utility for custom elements.
 *
 * Since @bquery/bquery does not support `static formAssociated = true`,
 * this module provides a hidden-input proxy pattern that allows custom
 * elements to participate in native `<form>` submission.
 */

import type { ComponentScope } from './component.js';

export type FormProxyOptions = {
  /**
   * Optional callback invoked just before native form submission to
   * return the most-current value. Lets components avoid stale state
   * caused by missed `setValue` calls during fast user interaction
   * (e.g. slider drag-end racing with submit).
   */
  getLiveValue?: () => string;
};

export type FormProxy = {
  /** Update the proxied form value */
  setValue(value: string): void;
  /** Update the proxied name attribute */
  setName(name: string): void;
  /** Enable or disable the proxy */
  setDisabled(disabled: boolean): void;
  /** Remove the proxy from the DOM */
  cleanup(): void;
};

/**
 * Creates a hidden `<input type="hidden">` in the light DOM immediately
 * after the host element. The hidden input mirrors name/value/disabled
 * so that the custom element data is included in native form submission.
 *
 * Pass `options.getLiveValue` to refresh the value lazily on the
 * `formdata` event of the closest ancestor `<form>`.
 */
export function createFormProxy(
  host: HTMLElement,
  name: string,
  value: string,
  disabled = false,
  options: FormProxyOptions = {}
): FormProxy {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  input.disabled = disabled;
  input.setAttribute('data-bq-form-proxy', '');

  host.insertAdjacentElement('afterend', input);

  let form: HTMLFormElement | null = null;
  let onFormData: ((event: FormDataEvent) => void) | null = null;

  if (options.getLiveValue) {
    form = host.closest('form');
    if (form) {
      const liveValue = options.getLiveValue;
      onFormData = () => {
        try {
          input.value = liveValue();
        } catch {
          /* best-effort sync — ignore */
        }
      };
      form.addEventListener('formdata', onFormData);
    }
  }

  return {
    setValue(v: string) {
      input.value = v;
    },
    setName(n: string) {
      input.name = n;
    },
    setDisabled(d: boolean) {
      input.disabled = d;
    },
    cleanup() {
      if (form && onFormData) {
        form.removeEventListener('formdata', onFormData);
        form = null;
        onFormData = null;
      }
      // Defer the sibling removal: removing a sibling synchronously inside
      // the host's `disconnectedCallback` re-enters DOM mutation while the
      // parent is still iterating, which trips happy-dom's child-tracking
      // and is at best wasteful in real browsers. Microtask is enough to
      // let the current removal settle.
      const drop = () => {
        if (input.isConnected) input.remove();
      };
      if (typeof queueMicrotask === 'function') queueMicrotask(drop);
      else Promise.resolve().then(drop);
    },
  };
}

// ─── Scope-managed binding ───────────────────────────────────────────────────

/**
 * How a component derives the values mirrored into its hidden input.
 *
 * `name` and `disabled` default to reading the host's `name` attribute and
 * `disabled` presence, which is what every current caller wants; pass them
 * only when the component's public API differs.
 */
export interface FormProxyBindingOptions {
  /** The value to submit. Read on every sync and on `formdata`. */
  value: () => string;
  /** Field name. @default the host's `name` attribute */
  name?: () => string;
  /** Whether the field is excluded from submission. @default the host's `disabled` attribute */
  disabled?: () => boolean;
}

/** Handle returned by {@link bindFormProxy}. */
export interface FormProxyBinding {
  /** Pushes name, value and disabled onto the hidden input. */
  sync(): void;
  /** Mirrors a value directly, for use inside change handlers. */
  setValue(value: string): void;
}

const bindings = new WeakMap<object, FormProxyBinding>();

/**
 * Creates a form proxy owned by the component's disposer scope and registers
 * it for {@link syncFormProxy}.
 *
 * Every form control repeated the same four steps: create the proxy in
 * `connected()`, stash it on the host, push name/value/disabled from
 * `updated()`, and tear it down in `disconnected()`. That boilerplate is what
 * this collapses — the scope owns the teardown, so a control removed from the
 * DOM can no longer leave its hidden input behind.
 *
 * ```ts
 * connected() {
 *   const self = host(this);
 *   const scope = bind(self);
 *   bindFormProxy(self, scope, { value: () => readValue(self) });
 * },
 * updated() { syncFormProxy(this); },
 * disconnected() { release(this); },
 * ```
 */
export function bindFormProxy(
  el: HTMLElement,
  scope: ComponentScope,
  options: FormProxyBindingOptions
): FormProxyBinding {
  const readName = options.name ?? (() => el.getAttribute('name') ?? '');
  const readDisabled = options.disabled ?? (() => el.hasAttribute('disabled'));

  const proxy = createFormProxy(
    el,
    readName(),
    options.value(),
    readDisabled(),
    // The lazy read matters for controls whose value changes faster than
    // their attributes settle — a slider released as the form submits, say.
    { getLiveValue: options.value }
  );

  const binding: FormProxyBinding = {
    sync() {
      proxy.setName(readName());
      proxy.setValue(options.value());
      proxy.setDisabled(readDisabled());
    },
    setValue(value: string) {
      proxy.setValue(value);
    },
  };

  bindings.set(el, binding);
  scope.add(() => {
    bindings.delete(el);
    proxy.cleanup();
  });

  return binding;
}

/**
 * Syncs the form proxy registered for a component instance, if any.
 * Safe to call from `updated()` before `connected()` has ever run.
 */
export function syncFormProxy(owner: object): void {
  bindings.get(owner)?.sync();
}

// ─── Submission ──────────────────────────────────────────────────────────────

/**
 * The form a host belongs to: the `<form>` named by its `form` attribute, or
 * the closest ancestor `<form>`.
 *
 * A native control inside a shadow root has no form owner in the light DOM,
 * so components resolve the form from the host instead.
 */
export function formOf(host: Element): HTMLFormElement | null {
  const id = host.getAttribute('form');
  if (id) {
    const named = host.ownerDocument?.getElementById(id);
    return named?.tagName === 'FORM' ? (named as HTMLFormElement) : null;
  }
  return host.closest('form');
}

/** Selector for the controls that can act as a form's default button. */
const SUBMIT_BUTTONS =
  'button:not([type]), button[type="submit" i], input[type="submit" i], input[type="image" i], bq-button[type="submit" i]';

/** Submits the host's form like a native submit button would. */
export function submitForm(host: Element): void {
  const form = formOf(host);
  if (!form) return;
  if (typeof form.requestSubmit === 'function') form.requestSubmit();
  else form.submit();
}

/** Resets the host's form like a native reset button would. */
export function resetForm(host: Element): void {
  formOf(host)?.reset();
}

/**
 * Implicit submission — what pressing Enter in a native text field does.
 *
 * The form's default button (its first submit button) is activated. When it
 * is disabled, nothing happens, as in the platform. A form without a submit
 * button is submitted directly.
 */
export function implicitSubmit(host: Element): void {
  const form = formOf(host);
  if (!form) return;
  const button = Array.from(form.querySelectorAll<HTMLElement>(SUBMIT_BUTTONS)).find(
    (el) => formOf(el) === form,
  );
  if (!button) {
    submitForm(host);
    return;
  }
  if (button.tagName === 'BQ-BUTTON') {
    if (button.hasAttribute('disabled') || button.hasAttribute('loading')) return;
    submitForm(button);
    return;
  }
  if ((button as HTMLButtonElement).disabled) return;
  button.click();
}

/**
 * True for an Enter keydown that should submit: no modifier, not repeated
 * from a held key, and not confirming an IME composition.
 */
export function isSubmitKey(event: KeyboardEvent): boolean {
  return (
    event.key === 'Enter' &&
    !event.defaultPrevented &&
    !event.isComposing &&
    event.keyCode !== 229 &&
    !event.repeat &&
    !event.shiftKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey
  );
}
