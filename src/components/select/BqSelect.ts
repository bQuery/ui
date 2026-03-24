/**
 * Select / dropdown form field.
 * @element bq-select
 * @prop {string}  label
 * @prop {string}  value
 * @prop {string}  placeholder
 * @prop {string}  name
 * @prop {boolean} disabled
 * @prop {boolean} required
 * @prop {string}  error
 * @prop {string}  hint
 * @prop {string}  size    - sm | md | lg
 * @slot - <option> elements
 * @fires bq-change - { value: string }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { uniqueId } from '../../utils/dom.js';
import { createFormProxy, type FormProxy } from '../../utils/form.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqSelectProps = {
  label: string;
  value: string;
  placeholder: string;
  name: string;
  disabled: boolean;
  required: boolean;
  error: string;
  hint: string;
  size: string;
};
type BqSelectState = { uid: string; optionsMarkup: string };

const serializeOption = (
  option: Element,
  selectedValue: string,
  hasExplicitValue: boolean
): string => {
  const optionValue =
    option.getAttribute('value') ?? option.textContent?.trim() ?? '';
  const attrs = [`value="${escapeHtml(optionValue)}"`];
  if (option.hasAttribute('disabled')) attrs.push('disabled');
  if (
    hasExplicitValue
      ? optionValue === selectedValue
      : option.hasAttribute('selected')
  ) {
    attrs.push('selected');
  }
  return `<option ${attrs.join(' ')}>${escapeHtml(option.textContent?.trim() ?? '')}</option>`;
};

const serializeOptGroup = (
  group: Element,
  selectedValue: string,
  hasExplicitValue: boolean
): string => {
  const optionsMarkup = Array.from(group.children)
    .filter((child) => child.tagName.toLowerCase() === 'option')
    .map((option) => serializeOption(option, selectedValue, hasExplicitValue))
    .join('');
  const disabled = group.hasAttribute('disabled') ? ' disabled' : '';
  return `<optgroup label="${escapeHtml(group.getAttribute('label') ?? '')}"${disabled}>${optionsMarkup}</optgroup>`;
};

const buildOptionsMarkup = (host: HTMLElement, placeholder: string): string => {
  const selectedValue = host.getAttribute('value') ?? '';
  const hasExplicitValue = host.hasAttribute('value');
  const placeholderMarkup = placeholder
    ? `<option value="" ${!selectedValue ? 'selected' : ''} disabled>${escapeHtml(placeholder)}</option>`
    : '';
  const childrenMarkup = Array.from(host.children)
    .map((child) => {
      if (child.tagName.toLowerCase() === 'option') {
        return serializeOption(child, selectedValue, hasExplicitValue);
      }
      if (child.tagName.toLowerCase() === 'optgroup') {
        return serializeOptGroup(child, selectedValue, hasExplicitValue);
      }
      return '';
    })
    .join('');
  return `${placeholderMarkup}${childrenMarkup}`;
};

const syncSelectValue = (host: HTMLElement): void => {
  const select = host.shadowRoot?.querySelector(
    'select'
  ) as HTMLSelectElement | null;
  if (!select) return;

  const attrValue = host.getAttribute('value');
  const options = Array.from(select.options);
  const hasMatchingValue =
    attrValue !== null && options.some((option) => option.value === attrValue);

  if (hasMatchingValue) {
    select.value = attrValue;
  }

  const normalizedValue = select.value;
  if ((attrValue ?? '') !== normalizedValue) {
    host.setAttribute('value', normalizedValue);
  }

  const proxy = (host as unknown as Record<string, unknown>)['_formProxy'] as
    | FormProxy
    | undefined;
  proxy?.setValue(normalizedValue);
};

const definition: ComponentDefinition<BqSelectProps, BqSelectState> = {
  props: {
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    name: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    size: { type: String, default: 'md' },
  },
  state: {
    uid: '',
    optionsMarkup: '',
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; }
    .label { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans); }
    .required-mark { color: var(--bq-color-danger-600,#dc2626); }
    .select-wrap { position: relative; }
    select {
      display: block; width: 100%;
      border: 1.5px solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-lg,0.5rem); background: var(--bq-bg-base,#fff);
      color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans);
      appearance: none; -webkit-appearance: none;
      padding-right: 2rem; outline: none; cursor: pointer;
      transition: border-color var(--bq-duration-fast) var(--bq-easing-standard), box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    :host([size="sm"]) select { font-size: 0.875rem; padding: 0.375rem 2rem 0.375rem 0.75rem; min-height: 2rem; }
    :host([size="md"]) select, :host(:not([size])) select { font-size: 1rem; padding: 0.5rem 2rem 0.5rem 0.875rem; min-height: 2.5rem; }
    :host([size="lg"]) select { font-size: 1.125rem; padding: 0.625rem 2rem 0.625rem 1rem; min-height: 3rem; }
    select:focus { border-color: var(--bq-border-focus,#2563eb); box-shadow: var(--bq-focus-ring); }
    :host([error]:not([error=""])) select { border-color: var(--bq-color-danger-500,#ef4444); }
    :host([disabled]) select { opacity: 0.5; cursor: not-allowed; background: var(--bq-bg-muted,#f1f5f9); }
    .arrow { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--bq-text-muted,#475569); font-size: 0.75rem; }
    .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); }
    .error-msg { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-color-danger-600,#dc2626); font-family: var(--bq-font-family-sans); }
    @media (prefers-reduced-motion: reduce) {
      select { transition: none; }
    }
  `,
  connected() {
    type BQEl = HTMLElement & {
      setState(k: 'uid' | 'optionsMarkup', v: string): void;
      getState<T>(k: string): T;
    };
    const self = this as unknown as BQEl;
    if (!self.getState<string>('uid'))
      self.setState('uid', uniqueId('bq-select'));
    const syncOptions = () => {
      const markup = buildOptionsMarkup(
        self,
        self.getAttribute('placeholder') ?? ''
      );
      if (self.getState<string>('optionsMarkup') !== markup) {
        self.setState('optionsMarkup', markup);
      }
      requestAnimationFrame(() => syncSelectValue(self));
    };

    // Form proxy for native <form> participation
    const name = self.getAttribute('name') ?? '';
    const value = self.getAttribute('value') ?? '';
    const disabled = self.hasAttribute('disabled');
    const proxy = createFormProxy(self, name, value, disabled);
    (self as unknown as Record<string, unknown>)['_formProxy'] = proxy;

    const handler = (e: Event) => {
      const select = e.target as HTMLSelectElement | null;
      if (select?.tagName === 'SELECT') {
        self.setAttribute('value', select.value);
        proxy.setValue(select.value);
        self.dispatchEvent(
          new CustomEvent('bq-change', {
            detail: { value: select.value },
            bubbles: true,
            composed: true,
          })
        );
      }
    };
    const syncValue = () => syncSelectValue(self);
    const observer = new MutationObserver(() => {
      syncOptions();
    });
    observer.observe(self, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['disabled', 'label', 'selected', 'value'],
    });

    (self as unknown as Record<string, unknown>)['_handler'] = handler;
    (self as unknown as Record<string, unknown>)['_syncValue'] = syncValue;
    (self as unknown as Record<string, unknown>)['_syncOptions'] = syncOptions;
    (self as unknown as Record<string, unknown>)['_observer'] = observer;
    self.shadowRoot?.addEventListener('change', handler);
    syncOptions();
  },
  disconnected() {
    const s = this as unknown as Record<string, unknown>;
    const h = s['_handler'] as EventListener | undefined;
    if (h) this.shadowRoot?.removeEventListener('change', h);
    const observer = s['_observer'] as MutationObserver | undefined;
    observer?.disconnect();
    (s['_formProxy'] as FormProxy | undefined)?.cleanup();
  },
  updated() {
    const s = this as unknown as Record<string, unknown>;
    const proxy = s['_formProxy'] as FormProxy | undefined;
    if (proxy) {
      proxy.setName(this.getAttribute('name') ?? '');
      proxy.setValue(this.getAttribute('value') ?? '');
      proxy.setDisabled(this.hasAttribute('disabled'));
    }
    (s['_syncOptions'] as (() => void) | undefined)?.();
  },
  render({ props, state }) {
    const hasError = Boolean(props.error);
    const hasHint = Boolean(props.hint) && !hasError;
    const uid = state.uid || 'bq-select';
    const optionsMarkup = state.optionsMarkup || '';
    const describedParts: string[] = [];
    if (hasError) describedParts.push(`${uid}-err`);
    if (hasHint) describedParts.push(`${uid}-hint`);
    const describedBy = describedParts.join(' ');
    return html`
      <div class="field" part="field">
        ${props.label
          ? `<label class="label" for="${uid}" part="label">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</label>`
          : ''}
        <div class="select-wrap">
          <select
            part="select"
            id="${uid}"
            name="${escapeHtml(props.name)}"
            ${props.disabled ? 'disabled' : ''}
            ${props.required ? 'required' : ''}
            aria-invalid="${hasError ? 'true' : 'false'}"
            ${props.required ? 'aria-required="true"' : ''}
            ${describedBy ? `aria-describedby="${describedBy}"` : ''}
          >
            ${optionsMarkup}
          </select>
          <span class="arrow" aria-hidden="true">&#9660;</span>
        </div>
        ${hasHint
          ? `<span class="hint" id="${uid}-hint" part="hint">${escapeHtml(props.hint)}</span>`
          : ''}
        ${hasError
          ? `<span class="error-msg" id="${uid}-err" role="alert" part="error">${escapeHtml(props.error)}</span>`
          : ''}
      </div>
    `;
  },
};

component<BqSelectProps, BqSelectState>('bq-select', definition);
