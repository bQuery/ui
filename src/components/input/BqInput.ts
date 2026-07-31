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
import { bool, component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { uniqueId } from '../../utils/dom.js';
import { bindFormProxy, syncFormProxy } from '../../utils/form.js';
import { bind, release } from '../../utils/component.js';
import {
  markFocus,
  restorePreservedFocus,
  trackFocus,
} from '../../utils/focus.js';
import { iconCss } from '../../utils/icons.js';
import { bindValidation } from '../../utils/validation.js';
import {
  baseStyles,
  fieldStyles,
  focusRing,
  reset,
} from '../../utils/styles.js';

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
  clearable: boolean;
};
type BqInputState = { uid: string; passwordVisible: boolean };
type BqInputEl = HTMLElement & {
  setState(k: 'uid' | 'passwordVisible', v: string | boolean): void;
  getState<T>(k: string): T;
};

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
    clearable: { type: Boolean, default: false },
  },
  state: {
    uid: '',
    passwordVisible: false,
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${fieldStyles}
    ${focusRing}
    ${iconCss('eye', 'eye-off', 'x')}
    :host { display: block; }
    .input-wrap {
      display: flex; align-items: center;
      border: var(--bq-border-width-control,1.5px) solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-lg,0.5rem);
      background: var(--bq-bg-base,#fff);
      transition: border-color var(--bq-duration-fast) var(--bq-easing-standard),
                  box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
      overflow: hidden;
    }
    .input-wrap:hover { border-color: var(--bq-border-strong,#94a3b8); }
    .input-wrap:focus-within { border-color: var(--bq-border-focus,#2563eb); box-shadow: var(--bq-focus-ring); }
    :host([error]:not([error=""])) .input-wrap { border-color: var(--bq-color-danger-500,#ef4444); }
    :host([error]:not([error=""])) .input-wrap:focus-within { border-color: var(--bq-color-danger-500,#ef4444); box-shadow: var(--bq-focus-ring-danger); }
    :host([disabled]) .input-wrap { opacity: 0.55; cursor: not-allowed; background: var(--bq-bg-muted,#f1f5f9); }
    :host([disabled]) .input-wrap:hover { border-color: var(--bq-border-emphasis,#cbd5e1); }
    :host([readonly]) .input-wrap { background: var(--bq-bg-subtle,#f8fafc); }

    /* Spacing lives on the slotted content, not on the wrapper: a wrapper with
       padding reserves it even when nothing is slotted, which left every field
       without a prefix looking lopsided next to one that had it. */
    .slot-wrap { display: flex; align-items: center; color: var(--bq-text-muted,#475569); }
    .slot-wrap ::slotted(*) { margin-inline: 0.5rem; }

    input {
      flex: 1; border: none; outline: none; background: transparent;
      color: var(--bq-text-base,#0f172a);
      font-family: var(--bq-font-family-sans);
      inline-size: 100%; min-inline-size: 0;
    }
    :host([size="sm"]) input { font-size: var(--bq-font-size-sm,0.875rem); padding: 0.375rem var(--bq-control-padding-sm,0.75rem); min-block-size: var(--bq-control-height-sm,2rem); }
    :host([size="md"]) input, :host(:not([size])) input { font-size: var(--bq-font-size-md,1rem); padding: 0.5rem var(--bq-control-padding-md,0.875rem); min-block-size: var(--bq-control-height-md,2.5rem); }
    :host([size="lg"]) input { font-size: var(--bq-font-size-lg,1.125rem); padding: 0.625rem var(--bq-control-padding-lg,1rem); min-block-size: var(--bq-control-height-lg,3rem); }
    input::placeholder { color: var(--bq-text-subtle,#94a3b8); }
    input:disabled { cursor: not-allowed; }
    /* The browser's own search affordance duplicates the clear button. */
    input[type="search"]::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }

    .footer { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
    .counter {
      font-size: var(--bq-font-size-sm,0.875rem);
      color: var(--bq-text-muted,#475569);
      font-family: var(--bq-font-family-sans);
      margin-inline-start: auto;
      font-variant-numeric: tabular-nums;
    }
    .counter[data-over="true"] { color: var(--bq-color-danger-600,#dc2626); }

    .affix-btn {
      display: inline-flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer;
      padding-inline: 0.5rem; align-self: stretch;
      color: var(--bq-text-muted,#475569);
      --bq-icon-size: 1.125rem;
      transition: color var(--bq-duration-fast) var(--bq-easing-standard),
                  background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .affix-btn:hover { color: var(--bq-text-base,#0f172a); background: var(--bq-bg-hover,rgba(15,23,42,0.04)); }
    .affix-btn:disabled { cursor: not-allowed; opacity: 0.5; }
    .password-toggle { border-inline-start: 1px solid var(--bq-border-base,#e2e8f0); }
  `,
  connected() {
    const self = this as unknown as BqInputEl;
    if (!self.getState<string>('uid'))
      self.setState('uid', uniqueId('bq-input'));

    const scope = bind(self);

    const readValue = () => {
        const input = self.shadowRoot?.querySelector(
          'input'
        ) as HTMLInputElement | null;
        return input ? input.value : (self.getAttribute('value') ?? '');
    };

    // Form proxy for native <form> participation
    const proxy = bindFormProxy(self, scope, { value: readValue });

    // The proxy submits through a hidden input, which the platform bars from
    // constraint validation — so `required`/`pattern`/`minlength` have to be
    // enforced here or they would render but never apply.
    bindValidation(self, scope, { value: readValue });

    const ih = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (input?.tagName === 'INPUT') {
        self.setAttribute('value', input.value);
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
      if (self.hasAttribute('disabled') || self.hasAttribute('readonly'))
        return;
      if ((e.target as Element)?.closest('.password-toggle')) {
        const current = self.getState<boolean>('passwordVisible');
        self.setState('passwordVisible', !current);
      }
    };
    // Toggling the password eye or clearing the field writes state, which
    // re-renders and would otherwise drop the caret on the floor.
    trackFocus(self, scope);

    const clear = (e: Event) => {
      if (self.hasAttribute('disabled') || self.hasAttribute('readonly')) return;
      if (!(e.target as Element)?.closest('.clear-btn')) return;
      self.setAttribute('value', '');
      proxy.setValue('');
      const field = self.shadowRoot?.querySelector(
        'input'
      ) as HTMLInputElement | null;
      if (field) field.value = '';
      field?.focus();
      self.dispatchEvent(
        new CustomEvent('bq-input', {
          detail: { value: '' },
          bubbles: true,
          composed: true,
        })
      );
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: { value: '' },
          bubbles: true,
          composed: true,
        })
      );
    };

    const shadow = self.shadowRoot;
    scope.on(shadow, 'input', ih);
    scope.on(shadow, 'change', ch);
    scope.on(shadow, 'focusin', fh);
    scope.on(shadow, 'focusout', bh);
    scope.on(shadow, 'click', pwToggle);
    scope.on(shadow, 'click', clear);
  },
  disconnected() {
    release(this);
  },
  beforeUpdate() {
    markFocus(this);
  },
  updated() {
    restorePreservedFocus(this);
    const self = this as unknown as BqInputEl;
    if (
      this.getAttribute('type') !== 'password' &&
      self.getState<boolean>('passwordVisible')
    ) {
      self.setState('passwordVisible', false);
    }
    syncFormProxy(this);
  },
  render({ props, state }) {
    const hasError = Boolean(props.error);
    const uid = state.uid || 'bq-input';
    const isPassword = props.type === 'password';
    const effectiveType =
      isPassword && state.passwordVisible ? 'text' : props.type;
    const maxLen = props.maxlength ? parseInt(props.maxlength, 10) : 0;
    const showCounter = props['show-counter'] && maxLen > 0;
    const charCount = props.value.length;
    const isOver = showCounter && charCount > maxLen;
    const hasFooter = hasError || Boolean(props.hint) || showCounter;
    const showClear =
      props.clearable &&
      props.value.length > 0 &&
      !props.disabled &&
      !props.readonly;
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
            ${bool('disabled', props.disabled)}
            ${bool('readonly', props.readonly)}
            ${bool('required', props.required)}
            aria-invalid="${hasError ? 'true' : 'false'}"
            ${props.required ? 'aria-required="true"' : ''}
            ${describedBy ? `aria-describedby="${describedBy}"` : ''}
            ${hasError ? `aria-errormessage="${uid}-err"` : ''}
          />
          ${
            showClear
              ? `<button type="button" class="affix-btn clear-btn" part="clear" aria-label="${escapeHtml(t('input.clearValue'))}" tabindex="-1"><span class="icon" data-icon="x" aria-hidden="true"></span></button>`
              : ''
          }
          ${isPassword
            ? `<button type="button" class="affix-btn password-toggle" part="password-toggle" aria-label="${escapeHtml(state.passwordVisible ? t('input.hidePassword') : t('input.showPassword'))}" aria-pressed="${state.passwordVisible ? 'true' : 'false'}" ${props.disabled || props.readonly ? 'disabled aria-disabled="true"' : ''}>
                <span class="icon" data-icon="${state.passwordVisible ? 'eye-off' : 'eye'}" aria-hidden="true"></span>
              </button>`
            : ''}
          <span class="slot-wrap" part="suffix"
            ><slot name="suffix"></slot
          ></span>
        </div>
        ${hasFooter
          ? `<div class="footer" part="footer">
              <span>
                ${
                  hasError
                    ? `<span class="error-msg" id="${uid}-err" role="alert" part="error">${escapeHtml(props.error)}</span>`
                    : ''
                }
                ${
                  props.hint && !hasError
                    ? `<span class="hint" id="${uid}-hint" part="hint">${escapeHtml(props.hint)}</span>`
                    : ''
                }
              </span>
              ${
                showCounter
                  ? `<span class="counter" id="${uid}-counter" part="counter" data-over="${isOver ? 'true' : 'false'}" aria-live="polite">${escapeHtml(t('input.characterCount', { count: charCount, max: maxLen }))}</span>`
                  : ''
              }
            </div>`
          : ''}
      </div>
    `;
  },
};

component<BqInputProps, BqInputState>('bq-input', definition);
