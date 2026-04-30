/**
 * Form participation utility for custom elements.
 *
 * Since @bquery/bquery does not support `static formAssociated = true`,
 * this module provides a hidden-input proxy pattern that allows custom
 * elements to participate in native `<form>` submission.
 */

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
