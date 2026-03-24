/**
 * Text input form field.
 * @element bq-input
 * @prop {string}  label       - Field label
 * @prop {string}  type        - text | email | password | number | tel | url | search
 * @prop {string}  value
 * @prop {string}  placeholder
 * @prop {string}  name
 * @prop {string}  size        - sm | md | lg
 * @prop {boolean} disabled
 * @prop {boolean} readonly
 * @prop {boolean} required
 * @prop {string}  error       - Error message (non-empty = error state)
 * @prop {string}  hint
 * @prop {string}  maxlength
 * @prop {boolean} show-counter - Show character counter when maxlength is set
 * @slot prefix - Leading icon/element
 * @slot suffix - Trailing icon/element
 * @fires bq-input  - { value: string }
 * @fires bq-change - { value: string }
 * @fires bq-focus
 * @fires bq-blur
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { uniqueId } from '../../utils/dom.js';
import { createFormProxy, type FormProxy } from '../../utils/form.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqInputProps = {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  name: string;
  size: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  error: string;
  hint: string;
  maxlength: string;
  'show-counter': boolean;
};
type BqInputState = { uid: string; passwordVisible: boolean };

const definition: ComponentDefinition<BqInputProps, BqInputState> = {
  props: {
    label: { type: String, default: '' },
    type: { type: String, default: 'text' },
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    name: { type: String, default: '' },
    size: { type: String, default: 'md' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    maxlength: { type: String, default: '' },
    'show-counter': { type: Boolean, default: false },
  },
  state: {
    uid: '',
    passwordVisible: false,
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; }
    .label { display: flex; align-items: center; gap: 0.25rem; font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans); }
    .required-mark { color: var(--bq-color-danger-600,#dc2626); }
    .input-wrap {
      display: flex; align-items: center;
      border: 1.5px solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-lg,0.5rem);
      background: var(--bq-bg-base,#fff);
      transition: border-color var(--bq-duration-fast) var(--bq-easing-standard), box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
      overflow: hidden;
    }
    .input-wrap:focus-within { border-color: var(--bq-border-focus,#2563eb); box-shadow: var(--bq-focus-ring); }
    :host([error]:not([error=""])) .input-wrap { border-color: var(--bq-color-danger-500,#ef4444); }
    :host([error]:not([error=""])) .input-wrap:focus-within { border-color: var(--bq-color-danger-500,#ef4444); box-shadow: var(--bq-focus-ring-danger); }
    :host([disabled]) .input-wrap { opacity: 0.5; cursor: not-allowed; background: var(--bq-bg-muted,#f1f5f9); }
    .slot-wrap { display: flex; align-items: center; padding: 0 0.5rem; color: var(--bq-text-muted,#475569); }
    input {
      flex: 1; border: none; outline: none; background: transparent;
      color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans); width: 100%;
    }
    :host([size="sm"]) input { font-size: 0.875rem; padding: 0.375rem 0.75rem; min-height: 2rem; }
    :host([size="md"]) input, :host(:not([size])) input { font-size: 1rem; padding: 0.5rem 0.875rem; min-height: 2.5rem; }
    :host([size="lg"]) input { font-size: 1.125rem; padding: 0.625rem 1rem; min-height: 3rem; }
    input::placeholder { color: var(--bq-text-subtle,#94a3b8); }
    input:disabled { cursor: not-allowed; }
    .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); }
    .error-msg { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-color-danger-600,#dc2626); font-family: var(--bq-font-family-sans); }
    .footer { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
    .counter { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); margin-left: auto; }
    .counter[data-over="true"] { color: var(--bq-color-danger-600,#dc2626); }
    .password-toggle {
      display: inline-flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; padding: 0 0.25rem;
      color: var(--bq-text-muted,#475569); font-size: 0.875rem; line-height: 1;
    }
    .password-toggle:hover { color: var(--bq-text-base,#0f172a); }
    .password-toggle:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); border-radius: var(--bq-radius-sm,0.25rem); }
    .pw-icon { font-size: 1.125rem; line-height: 1; }
    @media (prefers-reduced-motion: reduce) {
      input, .input-wrap { transition: none; }
    }
  `,
  connected() {
    type BQEl = HTMLElement & {
      setState(k: 'uid' | 'passwordVisible', v: string | boolean): void;
      getState<T>(k: string): T;
    };
    const self = this as unknown as BQEl;
    if (!self.getState<string>('uid'))
      self.setState('uid', uniqueId('bq-input'));

    // Form proxy for native <form> participation
    const name = self.getAttribute('name') ?? '';
    const value = self.getAttribute('value') ?? '';
    const disabled = self.hasAttribute('disabled');
    const proxy = createFormProxy(self, name, value, disabled);
    (self as unknown as Record<string, unknown>)['_formProxy'] = proxy;

    const ih = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (input?.tagName === 'INPUT') {
        proxy.setValue(input.value);
        self.dispatchEvent(
          new CustomEvent('bq-input', {
            detail: { value: input.value },
            bubbles: true,
            composed: true,
          })
        );
      }
    };
    const ch = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (input?.tagName === 'INPUT')
        self.dispatchEvent(
          new CustomEvent('bq-change', {
            detail: { value: input.value },
            bubbles: true,
            composed: true,
          })
        );
    };
    const fh = (e: Event) => {
      if ((e.target as Element)?.tagName === 'INPUT')
        self.dispatchEvent(
          new CustomEvent('bq-focus', { bubbles: true, composed: true })
        );
    };
    const bh = (e: Event) => {
      if ((e.target as Element)?.tagName === 'INPUT')
        self.dispatchEvent(
          new CustomEvent('bq-blur', { bubbles: true, composed: true })
        );
    };
    // Password visibility toggle
    const pwToggle = (e: Event) => {
      if (self.hasAttribute('disabled') || self.hasAttribute('readonly')) return;
      if ((e.target as Element)?.closest('.password-toggle')) {
        const current = self.getState<boolean>('passwordVisible');
        self.setState('passwordVisible', !current);
      }
    };
    const s = self as unknown as Record<string, unknown>;
    s['_ih'] = ih;
    s['_ch'] = ch;
    s['_fh'] = fh;
    s['_bh'] = bh;
    s['_pwToggle'] = pwToggle;
    self.shadowRoot?.addEventListener('input', ih);
    self.shadowRoot?.addEventListener('change', ch);
    self.shadowRoot?.addEventListener('focusin', fh);
    self.shadowRoot?.addEventListener('focusout', bh);
    self.shadowRoot?.addEventListener('click', pwToggle);
  },
  disconnected() {
    const s = this as unknown as Record<string, unknown>;
    const sr = this.shadowRoot;
    const ih = s['_ih'] as EventListener | undefined;
    if (ih) sr?.removeEventListener('input', ih);
    const ch = s['_ch'] as EventListener | undefined;
    if (ch) sr?.removeEventListener('change', ch);
    const fh = s['_fh'] as EventListener | undefined;
    if (fh) sr?.removeEventListener('focusin', fh);
    const bh = s['_bh'] as EventListener | undefined;
    if (bh) sr?.removeEventListener('focusout', bh);
    const pwToggle = s['_pwToggle'] as EventListener | undefined;
    if (pwToggle) sr?.removeEventListener('click', pwToggle);
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
  },
  render({ props, state }) {
    const hasError = Boolean(props.error);
    const uid = state.uid || 'bq-input';
    const isPassword = props.type === 'password';
    const effectiveType = isPassword && state.passwordVisible ? 'text' : props.type;
    const maxLen = props.maxlength ? parseInt(props.maxlength, 10) : 0;
    const showCounter = props['show-counter'] && maxLen > 0;
    const charCount = props.value.length;
    const isOver = showCounter && charCount > maxLen;
    const describedByParts: string[] = [];
    if (hasError) describedByParts.push(`${uid}-err`);
    else if (props.hint) describedByParts.push(`${uid}-hint`);
    if (showCounter) describedByParts.push(`${uid}-counter`);
    const describedBy = describedByParts.join(' ');
    return html`
      <div class="field" part="field">
        ${props.label
          ? `<label class="label" for="${uid}" part="label">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</label>`
          : ''}
        <div class="input-wrap" part="input-wrap">
          <span class="slot-wrap" part="prefix"
            ><slot name="prefix"></slot
          ></span>
          <input
            part="input"
            id="${uid}"
            type="${escapeHtml(effectiveType)}"
            name="${escapeHtml(props.name)}"
            placeholder="${escapeHtml(props.placeholder)}"
            value="${escapeHtml(props.value)}"
            ${props.maxlength
              ? `maxlength="${escapeHtml(props.maxlength)}"`
              : ''}
            ${props.disabled ? 'disabled' : ''}
            ${props.readonly ? 'readonly' : ''}
            ${props.required ? 'required' : ''}
            aria-invalid="${hasError ? 'true' : 'false'}"
            ${describedBy ? `aria-describedby="${describedBy}"` : ''}
          />
          ${isPassword
            ? `<button type="button" class="password-toggle" part="password-toggle" aria-label="${state.passwordVisible ? t('input.hidePassword') : t('input.showPassword')}" aria-pressed="${state.passwordVisible ? 'true' : 'false'}" ${props.disabled || props.readonly ? 'disabled aria-disabled="true"' : ''}>
                <span class="pw-icon" aria-hidden="true">${state.passwordVisible ? '&#9673;' : '&#9678;'}</span>
              </button>`
            : ''}
          <span class="slot-wrap" part="suffix"
            ><slot name="suffix"></slot
          ></span>
        </div>
        <div class="footer" part="footer">
          <span>
            ${hasError
              ? `<span class="error-msg" id="${uid}-err" role="alert" part="error">${escapeHtml(props.error)}</span>`
              : ''}
            ${props.hint && !hasError
              ? `<span class="hint" id="${uid}-hint" part="hint">${escapeHtml(props.hint)}</span>`
              : ''}
          </span>
          ${showCounter
            ? `<span class="counter" id="${uid}-counter" part="counter" data-over="${isOver ? 'true' : 'false'}" aria-live="polite">${t('input.characterCount', { count: charCount, max: maxLen })}</span>`
            : ''}
        </div>
      </div>
    `;
  },
};

component<BqInputProps, BqInputState>('bq-input', definition);
