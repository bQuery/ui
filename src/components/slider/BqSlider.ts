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
import { bool, component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bindFormProxy, syncFormProxy } from '../../utils/form.js';
import { bind, host, release } from '../../utils/component.js';
import { baseStyles, reset } from '../../utils/styles.js';

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

/** How much of the track is behind the thumb, as a percentage. */
export function sliderFill(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || max <= min) return 0;
  const clamped = Math.min(max, Math.max(min, value));
  return ((clamped - min) / (max - min)) * 100;
}

function fillPercent(input: HTMLInputElement): number {
  return sliderFill(Number(input.value), Number(input.min), Number(input.max));
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
  sanitize: { allowAttributes: ['style'] },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: block; }
    .wrapper { display: flex; flex-direction: column; gap: 0.375rem; font-family: var(--bq-font-family-sans); }
    .header { display: flex; justify-content: space-between; align-items: center; }
    .label-text { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); }
    .value { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); }
    /* accent-color is all a native range exposes, so the track height, the
       thumb size and the filled portion were whatever the platform decided.
       The control is drawn here instead — which needs vendor pseudo-elements,
       and they cannot share a selector list: one unknown selector invalidates
       the whole rule, so WebKit and Gecko get their own. */
    input[type="range"] {
      --bq-slider-track: 0.375rem;
      --bq-slider-thumb: 1.125rem;
      inline-size: 100%;
      block-size: var(--bq-slider-thumb);
      margin: 0;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
    }
    input[type="range"]:disabled { opacity: 0.5; cursor: not-allowed; }
    input[type="range"]:focus { outline: none; }

    /* The filled portion is a gradient stop, because WebKit has no
       "progress" pseudo-element the way Gecko does. */
    input[type="range"]::-webkit-slider-runnable-track {
      block-size: var(--bq-slider-track);
      border-radius: var(--bq-radius-full,9999px);
      background: linear-gradient(
        to right,
        var(--bq-color-primary-600,#2563eb) 0 var(--bq-slider-fill,0%),
        var(--bq-bg-emphasis,#e2e8f0) var(--bq-slider-fill,0%) 100%
      );
    }
    :host(:dir(rtl)) input[type="range"]::-webkit-slider-runnable-track {
      background: linear-gradient(
        to left,
        var(--bq-color-primary-600,#2563eb) 0 var(--bq-slider-fill,0%),
        var(--bq-bg-emphasis,#e2e8f0) var(--bq-slider-fill,0%) 100%
      );
    }
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      inline-size: var(--bq-slider-thumb);
      block-size: var(--bq-slider-thumb);
      margin-block-start: calc((var(--bq-slider-track) - var(--bq-slider-thumb)) / 2);
      border-radius: var(--bq-radius-full,9999px);
      background: var(--bq-bg-base,#fff);
      border: 2px solid var(--bq-color-primary-600,#2563eb);
      box-shadow: var(--bq-shadow-sm);
      transition: transform var(--bq-duration-fast) var(--bq-easing-standard),
                  box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    input[type="range"]:hover:not(:disabled)::-webkit-slider-thumb { transform: scale(1.12); }
    input[type="range"]:active:not(:disabled)::-webkit-slider-thumb { transform: scale(1.05); }
    input[type="range"]:focus-visible::-webkit-slider-thumb { box-shadow: var(--bq-focus-ring); }

    input[type="range"]::-moz-range-track {
      block-size: var(--bq-slider-track);
      border-radius: var(--bq-radius-full,9999px);
      background: var(--bq-bg-emphasis,#e2e8f0);
    }
    input[type="range"]::-moz-range-progress {
      block-size: var(--bq-slider-track);
      border-radius: var(--bq-radius-full,9999px);
      background: var(--bq-color-primary-600,#2563eb);
    }
    input[type="range"]::-moz-range-thumb {
      inline-size: var(--bq-slider-thumb);
      block-size: var(--bq-slider-thumb);
      border-radius: var(--bq-radius-full,9999px);
      background: var(--bq-bg-base,#fff);
      border: 2px solid var(--bq-color-primary-600,#2563eb);
      box-shadow: var(--bq-shadow-sm);
      transition: transform var(--bq-duration-fast) var(--bq-easing-standard),
                  box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    input[type="range"]:hover:not(:disabled)::-moz-range-thumb { transform: scale(1.12); }
    input[type="range"]:focus-visible::-moz-range-thumb { box-shadow: var(--bq-focus-ring); }

    @media (forced-colors: active) {
      input[type="range"]::-webkit-slider-thumb { background: ButtonFace; border-color: ButtonText; }
      input[type="range"]::-moz-range-thumb { background: ButtonFace; border-color: ButtonText; }
    }
  `,
  connected() {
    const self = host(this);
    const scope = bind(self);

    // Form proxy for native <form> participation. The live read matters here:
    // dragging updates the range input without committing an attribute, so a
    // submit mid-drag would otherwise post the pre-drag value.
    const proxy = bindFormProxy(self, scope, {
      value: () => {
        const input = self.shadowRoot?.querySelector(
          'input[type="range"]'
        ) as HTMLInputElement | null;
        return input ? input.value : (self.getAttribute('value') ?? '50');
      },
    });

    const ih = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (!input) return;
      const v = Number(input.value);
      // Update form proxy and value display directly without re-rendering (prevents jank during drag)
      proxy.setValue(String(v));
      syncInputAccessibility(input, v);
      const valueSpan = self.shadowRoot?.querySelector('.value');
      if (valueSpan) valueSpan.textContent = String(v);
      // Dragging deliberately does not re-render, so the filled portion is
      // repainted straight onto the element instead.
      input.style.setProperty('--bq-slider-fill', `${fillPercent(input)}%`);
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
    scope.on(self.shadowRoot, 'input', ih);
    scope.on(self.shadowRoot, 'change', ch);
  },
  disconnected() {
    release(this);
  },
  updated() {
    syncFormProxy(this);
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
          style="--bq-slider-fill: ${sliderFill(props.value, props.min, props.max)}%"
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
