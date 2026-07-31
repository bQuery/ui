/**
 * Number input component — numeric field with stepper buttons.
 * @element bq-number-input
 * @prop {number}  value
 * @prop {number}  min
 * @prop {number}  max
 * @prop {number}  step
 * @prop {number}  precision - Decimal places to display (-1 = derive from step)
 * @prop {string}  label
 * @prop {string}  placeholder
 * @prop {string}  name      - Form field name
 * @prop {string}  size      - sm | md | lg
 * @prop {boolean} disabled
 * @prop {boolean} readonly
 * @prop {boolean} required
 * @prop {string}  error     - Error message; marks the field invalid
 * @prop {string}  hint      - Helper text
 * @slot prefix - Content before the field (e.g. a currency symbol)
 * @slot suffix - Content after the field (e.g. a unit)
 * @fires bq-input  - { value: number }
 * @fires bq-change - { value: number }
 */
import { bool, component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { createFormProxy, type FormProxy } from '../../utils/form.js';
import { bindValidation } from '../../utils/validation.js';
import { baseStyles, reset, srOnly } from '../../utils/styles.js';

type BqNumberInputProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  precision: number;
  label: string;
  placeholder: string;
  name: string;
  size: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  error: string;
  hint: string;
};
type BqNumberInputState = { uid: string };

const inputStore = (owner: object) =>
  store<{ proxy?: FormProxy }>(owner, () => ({}));

/** Decimal places implied by `step`, so 0.1 + 0.2 does not surface as 0.30000000000000004. */
export function precisionFor(step: number, explicit: number): number {
  if (explicit >= 0) return Math.trunc(explicit);
  if (!Number.isFinite(step)) return 0;
  const text = String(step);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
}

/** Clamps to `[min, max]` and snaps to the nearest `step` offset from `min`. */
export function normalizeNumber(
  raw: number,
  min: number,
  max: number,
  step: number,
  precision: number
): number {
  if (!Number.isFinite(raw)) return Number.isFinite(min) ? min : 0;
  let value = raw;
  if (Number.isFinite(step) && step > 0) {
    const origin = Number.isFinite(min) ? min : 0;
    value = origin + Math.round((value - origin) / step) * step;
  }
  if (Number.isFinite(min)) value = Math.max(value, min);
  if (Number.isFinite(max)) value = Math.min(value, max);
  return Number(value.toFixed(precision));
}

const definition: ComponentDefinition<BqNumberInputProps, BqNumberInputState> = {
  // `inputmode` is outside the framework's base allowlist; it is a fixed
  // literal here, not user input.
  sanitize: { allowAttributes: ['inputmode'] },
  props: {
    value: { type: Number, default: 0 },
    min: { type: Number, default: Number.NEGATIVE_INFINITY },
    max: { type: Number, default: Number.POSITIVE_INFINITY },
    step: { type: Number, default: 1 },
    precision: { type: Number, default: -1 },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    name: { type: String, default: '' },
    size: { type: String, default: 'md' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
  },
  state: {
    uid: '',
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    :host { display: block; }
    .field { font-family: var(--bq-font-family-sans); }
    .label {
      display: block;
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-medium,500);
      color: var(--bq-text-base,#0f172a);
      margin-bottom: 0.375rem;
    }
    .required { color: var(--bq-color-danger-600,#dc2626); margin-left: 0.125rem; }
    .control {
      display: flex; align-items: stretch;
      border: 1.5px solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-lg,0.5rem);
      background: var(--bq-bg-base,#fff);
      overflow: hidden;
      transition: border-color var(--bq-duration-fast) var(--bq-easing-standard),
                  box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .control:focus-within { border-color: var(--bq-border-focus,#2563eb); box-shadow: var(--bq-focus-ring); }
    :host([error]) .control { border-color: var(--bq-color-danger-600,#dc2626); }
    :host([error]) .control:focus-within { box-shadow: var(--bq-focus-ring-danger); }
    :host([disabled]) .control { opacity: 0.55; background: var(--bq-bg-muted,#f1f5f9); }

    input {
      flex: 1 1 auto; min-width: 0; width: 100%;
      border: none; outline: none; background: transparent;
      font-family: inherit; color: var(--bq-text-base,#0f172a);
      text-align: var(--bq-number-input-align, left);
      /* The custom stepper replaces the native one. */
      -moz-appearance: textfield; appearance: textfield;
    }
    input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
      -webkit-appearance: none; margin: 0;
    }
    .control[data-size="sm"] input { font-size: 0.875rem; padding: 0.375rem 0.625rem; }
    .control[data-size="md"] input { font-size: 1rem;     padding: 0.5rem 0.75rem; }
    .control[data-size="lg"] input { font-size: 1.125rem; padding: 0.625rem 0.875rem; }

    .step {
      display: inline-flex; align-items: center; justify-content: center;
      width: 2rem; flex: 0 0 auto;
      border: none; background: var(--bq-bg-subtle,#f8fafc);
      color: var(--bq-text-muted,#475569);
      cursor: pointer; font-size: 1rem; line-height: 1;
      transition: background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .step:hover:not(:disabled) { background: var(--bq-bg-emphasis,#e2e8f0); color: var(--bq-text-base,#0f172a); }
    .step:disabled { opacity: 0.4; cursor: not-allowed; }
    .step:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); z-index: 1; }
    .step[data-action="decrement"] { border-right: 1px solid var(--bq-border-base,#e2e8f0); }
    .step[data-action="increment"] { border-left: 1px solid var(--bq-border-base,#e2e8f0); }

    .affix { display: inline-flex; align-items: center; padding: 0 0.5rem; color: var(--bq-text-subtle,#94a3b8); }
    .message { font-size: var(--bq-font-size-xs,0.75rem); margin-top: 0.375rem; }
    .hint  { color: var(--bq-text-subtle,#94a3b8); }
    .error { color: var(--bq-color-danger-600,#dc2626); }
    @media (prefers-reduced-motion: reduce) {
      .control, .step { transition: none; }
    }
  `,
  connected() {
    const self = host<BqNumberInputState>(this);
    const scope = bind(self);
    const local = inputStore(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-number'));

    const numAttr = (name: string, fallback: number): number => {
      const raw = self.getAttribute(name);
      if (raw === null || raw.trim() === '') return fallback;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const readSettings = () => {
      const step = numAttr('step', 1);
      return {
        min: numAttr('min', Number.NEGATIVE_INFINITY),
        max: numAttr('max', Number.POSITIVE_INFINITY),
        step,
        precision: precisionFor(step, numAttr('precision', -1)),
      };
    };
    const readValue = (): number => {
      const { min, max, step, precision } = readSettings();
      return normalizeNumber(numAttr('value', 0), min, max, step, precision);
    };

    const name = self.getAttribute('name') ?? '';
    if (name) {
      local.proxy = createFormProxy(
        self,
        name,
        String(readValue()),
        self.hasAttribute('disabled'),
        { getLiveValue: () => String(readValue()) }
      );
      scope.add(() => {
        local.proxy?.cleanup();
        delete local.proxy;
      });
    }

    // The value is already clamped into range on commit, so in practice this
    // enforces `required` — but reading the constraints generically keeps the
    // control honest if a value is written straight to the attribute.
    bindValidation(self, scope, {
      value: () => (self.getAttribute('value') ?? '').trim(),
    });

    const commit = (next: number, eventName: 'bq-input' | 'bq-change') => {
      if (self.hasAttribute('disabled') || self.hasAttribute('readonly')) return;
      const { min, max, step, precision } = readSettings();
      const value = normalizeNumber(next, min, max, step, precision);
      self.setAttribute('value', String(value));
      local.proxy?.setValue(String(value));
      self.dispatchEvent(
        new CustomEvent(eventName, {
          detail: { value },
          bubbles: true,
          composed: true,
        })
      );
    };

    scope.on(self.shadowRoot, 'click', (e) => {
      const button = (e.target as Element).closest(
        '.step'
      ) as HTMLButtonElement | null;
      if (!button || button.disabled) return;
      const { step } = readSettings();
      const delta = button.getAttribute('data-action') === 'increment' ? step : -step;
      commit(readValue() + delta, 'bq-change');
    });

    // Typing must not fight the user: the raw field value is only normalized
    // on commit (change/blur), not on every keystroke.
    scope.on(self.shadowRoot, 'input', (e) => {
      const input = e.target as HTMLInputElement | null;
      if (!input || input.type !== 'number') return;
      const raw = Number(input.value);
      if (!Number.isFinite(raw)) return;
      self.dispatchEvent(
        new CustomEvent('bq-input', {
          detail: { value: raw },
          bubbles: true,
          composed: true,
        })
      );
      local.proxy?.setValue(input.value);
    });

    scope.on(self.shadowRoot, 'change', (e) => {
      const input = e.target as HTMLInputElement | null;
      if (!input || input.type !== 'number') return;
      commit(Number(input.value), 'bq-change');
    });
  },
  disconnected() {
    release(this);
  },
  updated() {
    const self = host<BqNumberInputState>(this);
    const local = inputStore(self);
    local.proxy?.setDisabled(self.hasAttribute('disabled'));
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-number';
    const inputId = `${uid}-input`;
    const hintId = `${uid}-hint`;
    const errorId = `${uid}-error`;
    const precision = precisionFor(props.step, props.precision);
    const value = normalizeNumber(
      props.value,
      props.min,
      props.max,
      props.step,
      precision
    );
    const atMin = Number.isFinite(props.min) && value <= props.min;
    const atMax = Number.isFinite(props.max) && value >= props.max;
    const locked = props.disabled || props.readonly;
    const describedBy = [props.hint ? hintId : '', props.error ? errorId : '']
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="field" part="field">
        ${
          props.label
            ? `<label class="label" part="label" for="${escapeHtml(inputId)}">${escapeHtml(props.label)}${props.required ? '<span class="required" aria-hidden="true">*</span>' : ''}</label>`
            : ''
        }
        <div class="control" part="control" data-size="${escapeHtml(props.size)}">
          <button
            type="button"
            class="step"
            part="decrement"
            data-action="decrement"
            aria-label="${escapeHtml(t('numberInput.decrement'))}"
            ${bool('disabled', locked || atMin)}
            tabindex="-1"
          >&minus;</button>
          <span class="affix"><slot name="prefix"></slot></span>
          <input
            id="${escapeHtml(inputId)}"
            part="input"
            type="number"
            inputmode="decimal"
            value="${escapeHtml(String(value))}"
            ${Number.isFinite(props.min) ? `min="${escapeHtml(String(props.min))}"` : ''}
            ${Number.isFinite(props.max) ? `max="${escapeHtml(String(props.max))}"` : ''}
            step="${escapeHtml(String(props.step))}"
            ${props.placeholder ? `placeholder="${escapeHtml(props.placeholder)}"` : ''}
            ${bool('disabled', props.disabled)}
            ${bool('readonly', props.readonly)}
            ${bool('required', props.required)}
            ${props.error ? 'aria-invalid="true"' : ''}
            ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''}
          />
          <span class="affix"><slot name="suffix"></slot></span>
          <button
            type="button"
            class="step"
            part="increment"
            data-action="increment"
            aria-label="${escapeHtml(t('numberInput.increment'))}"
            ${bool('disabled', locked || atMax)}
            tabindex="-1"
          >&plus;</button>
        </div>
        ${
          props.error
            ? `<p class="message error" part="error" id="${escapeHtml(errorId)}" role="alert">${escapeHtml(props.error)}</p>`
            : props.hint
              ? `<p class="message hint" part="hint" id="${escapeHtml(hintId)}">${escapeHtml(props.hint)}</p>`
              : ''
        }
      </div>
    `;
  },
};

component<BqNumberInputProps, BqNumberInputState>(
  'bq-number-input',
  definition
);
