/**
 * Range slider input.
 * @element bq-slider
 * @prop {number}  value
 * @prop {number}  min
 * @prop {number}  max
 * @prop {number}  step
 * @prop {string}  label
 * @prop {boolean} disabled
 * @prop {boolean} show-value
 * @fires bq-input  - { value: number }
 * @fires bq-change - { value: number }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { bool, component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { createFormProxy, type FormProxy } from '../../utils/form.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqSliderProps = {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  disabled: boolean;
  'show-value': boolean;
};

function syncInputAccessibility(input: HTMLInputElement, value: number): void {
  input.setAttribute('aria-valuenow', String(value));
  input.setAttribute('aria-valuetext', t('slider.valueText', { value }));
}

const definition: ComponentDefinition<BqSliderProps> = {
  props: {
    value: { type: Number, default: 50 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    'show-value': { type: Boolean, default: false },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .wrapper { display: flex; flex-direction: column; gap: 0.375rem; font-family: var(--bq-font-family-sans); }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .label-text { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); }
    .value { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); }
    input[type="range"] {
      width: 100%; height: 0.375rem; cursor: pointer;
      accent-color: var(--bq-color-primary-600,#2563eb);
    }
    input[type="range"]:disabled { opacity: 0.5; cursor: not-allowed; }
    input[type="range"]:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
  `,
  connected() {
    const self = this;

    // Form proxy for native <form> participation
    const name = self.getAttribute('name') ?? '';
    const value = self.getAttribute('value') ?? '50';
    const disabled = self.hasAttribute('disabled');
    const proxy = createFormProxy(self, name, value, disabled);
    (self as unknown as Record<string, unknown>)['_formProxy'] = proxy;

    const ih = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (!input) return;
      const v = Number(input.value);
      // Update form proxy and value display directly without re-rendering (prevents jank during drag)
      proxy.setValue(String(v));
      syncInputAccessibility(input, v);
      const valueSpan = self.shadowRoot?.querySelector('.value');
      if (valueSpan) valueSpan.textContent = String(v);
      self.dispatchEvent(
        new CustomEvent('bq-input', {
          detail: { value: v },
          bubbles: true,
          composed: true,
        })
      );
    };
    const ch = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (!input) return;
      const v = Number(input.value);
      // Commit value to attribute on change (drag end) — triggers one clean re-render
      self.setAttribute('value', String(v));
      proxy.setValue(String(v));
      syncInputAccessibility(input, v);
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: { value: v },
          bubbles: true,
          composed: true,
        })
      );
    };
    (self as unknown as Record<string, unknown>)['_ih'] = ih;
    (self as unknown as Record<string, unknown>)['_ch'] = ch;
    self.shadowRoot?.addEventListener('input', ih);
    self.shadowRoot?.addEventListener('change', ch);
  },
  disconnected() {
    const s = this as unknown as Record<string, unknown>;
    const ih = s['_ih'] as EventListener | undefined;
    const ch = s['_ch'] as EventListener | undefined;
    if (ih) this.shadowRoot?.removeEventListener('input', ih);
    if (ch) this.shadowRoot?.removeEventListener('change', ch);
    (
      (this as unknown as Record<string, unknown>)['_formProxy'] as
        | FormProxy
        | undefined
    )?.cleanup();
  },
  updated() {
    const s = this as unknown as Record<string, unknown>;
    const proxy = s['_formProxy'] as FormProxy | undefined;
    if (proxy) {
      proxy.setName(this.getAttribute('name') ?? '');
      proxy.setValue(this.getAttribute('value') ?? '50');
      proxy.setDisabled(this.hasAttribute('disabled'));
    }
  },
  render({ props }) {
    return html`
      <div class="wrapper" part="wrapper">
        ${props.label || props['show-value']
          ? `<div class="header">
          ${props.label ? `<label class="label-text" part="label">${escapeHtml(props.label)}</label>` : ''}
          ${props['show-value'] ? `<span class="value" part="value" aria-live="polite">${String(props.value)}</span>` : ''}
        </div>`
          : ''}
        <input
          type="range"
          part="input"
          min="${String(props.min)}"
          max="${String(props.max)}"
          value="${String(props.value)}"
          step="${String(props.step)}"
          ${bool('disabled', props.disabled)}
          aria-label="${escapeHtml(props.label || t('slider.ariaLabel'))}"
          aria-valuemin="${String(props.min)}"
          aria-valuemax="${String(props.max)}"
          aria-valuenow="${String(props.value)}"
          aria-valuetext="${escapeHtml(
            t('slider.valueText', { value: props.value })
          )}"
        />
      </div>
    `;
  },
};

component<BqSliderProps>('bq-slider', definition);
