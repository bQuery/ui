/**
 * Form participation utility for custom elements.
 *
 * Since @bquery/bquery does not support `static formAssociated = true`,
 * this module provides a hidden-input proxy pattern that allows custom
 * elements to participate in native `<form>` submission.
 */

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
 */
export function createFormProxy(
  host: HTMLElement,
  name: string,
  value: string,
  disabled = false
): FormProxy {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = name;
  input.value = value;
  input.disabled = disabled;
  input.setAttribute('data-bq-form-proxy', '');

  host.insertAdjacentElement('afterend', input);

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
      input.remove();
    },
  };
}
