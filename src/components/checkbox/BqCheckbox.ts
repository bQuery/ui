/**
 * Checkbox form control.
 *
 * The native `<input type="checkbox">` is kept — it carries the semantics,
 * the form behaviour and the keyboard handling — but rendered transparently
 * on top of a drawn box, because `accent-color` is the only thing a real
 * checkbox lets you style. Everything else (radius, border weight, the
 * check mark itself, the focus ring, the indeterminate dash) is the platform's
 * to decide, and every platform decides differently.
 *
 * @element bq-checkbox
 * @prop {string}  label         - Visible label
 * @prop {string}  name          - Input name
 * @prop {string}  value         - Input value
 * @prop {boolean} checked
 * @prop {boolean} indeterminate
 * @prop {boolean} disabled
 * @prop {boolean} required
 * @prop {string}  hint
 * @fires bq-change - { value: string, checked: boolean }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { bool, component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { bindFormProxy, syncFormProxy } from '../../utils/form.js';
import { bind, host, release } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { iconMask } from '../../utils/icons.js';
import { baseStyles, fieldStyles, reset } from '../../utils/styles.js';

type BqCheckboxProps = {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  required: boolean;
  hint: string;
};

type BqCheckboxState = { uid: string };

const definition: ComponentDefinition<BqCheckboxProps, BqCheckboxState> = {
  props: {
    label: { type: String, default: '' },
    name: { type: String, default: '' },
    value: { type: String, default: '' },
    checked: { type: Boolean, default: false },
    indeterminate: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    hint: { type: String, default: '' },
  },
  state: { uid: '' },
  styles: css`
    ${baseStyles}
    ${reset}
    ${fieldStyles}
    :host { display: block; }
    .field { gap: 0.25rem; }
    .control {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      cursor: pointer;
      font-family: var(--bq-font-family-sans);
    }
    :host([disabled]) .control { opacity: 0.55; cursor: not-allowed; }

    /* The box and the real input share one grid cell: the input stays on top
       so pointer and assistive technology still hit the actual control. */
    .box-wrap {
      position: relative;
      display: inline-grid;
      place-items: center;
      flex: none;
      margin-block-start: 0.125rem;
    }
    input {
      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }
    .box {
      inline-size: 1.125rem;
      block-size: 1.125rem;
      display: grid;
      place-items: center;
      border: var(--bq-border-width-control, 1.5px) solid var(--bq-border-strong, #94a3b8);
      border-radius: var(--bq-radius-sm, 0.25rem);
      background: var(--bq-bg-base, #fff);
      transition:
        background-color var(--bq-duration-fast) var(--bq-easing-standard),
        border-color var(--bq-duration-fast) var(--bq-easing-standard),
        box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .box::after {
      content: '';
      inline-size: 0.875rem;
      block-size: 0.875rem;
      background-color: var(--bq-text-on-primary, #fff);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-position: center;
      mask-position: center;
      -webkit-mask-size: contain;
      mask-size: contain;
      ${iconMask('check')}
      transform: scale(0.6);
      opacity: 0;
      transition:
        transform var(--bq-duration-fast) var(--bq-easing-spring),
        opacity var(--bq-duration-instant) var(--bq-easing-standard);
    }
    .control:hover input:not(:disabled) ~ .box { border-color: var(--bq-color-primary-500, #3b82f6); }
    input:checked ~ .box,
    input:indeterminate ~ .box {
      background: var(--bq-color-primary-600, #2563eb);
      border-color: var(--bq-color-primary-600, #2563eb);
    }
    input:checked ~ .box::after,
    input:indeterminate ~ .box::after { transform: scale(1); opacity: 1; }
    /* Indeterminate outranks checked: the dash is the state the user sees. */
    input:indeterminate ~ .box::after { ${iconMask('minus')} }
    input:focus-visible ~ .box {
      border-color: var(--bq-border-focus, #2563eb);
      box-shadow: var(--bq-focus-ring);
    }
    input:disabled ~ .box { background: var(--bq-bg-muted, #f1f5f9); }
    input:checked:disabled ~ .box { background: var(--bq-border-strong, #94a3b8); border-color: var(--bq-border-strong, #94a3b8); }

    .label-text {
      font-size: var(--bq-font-size-sm, 0.875rem);
      color: var(--bq-text-base, #0f172a);
      line-height: var(--bq-line-height-normal, 1.5);
    }
    .hint { padding-inline-start: 1.75rem; }

    @media (forced-colors: active) {
      .box { forced-color-adjust: none; background: Canvas; border-color: CanvasText; }
      input:checked ~ .box,
      input:indeterminate ~ .box { background: Highlight; border-color: Highlight; }
      .box::after { background-color: HighlightText; }
      input:focus-visible ~ .box { outline: 2px solid CanvasText; outline-offset: 2px; }
    }
  `,
  connected() {
    const self = host<BqCheckboxState>(this);
    const scope = bind(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-cb'));

    // Form proxy for native <form> participation
    const readValue = () =>
      self.hasAttribute('checked') ? self.getAttribute('value') || 'on' : '';
    const proxy = bindFormProxy(self, scope, { value: readValue });

    const handler = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (input?.type !== 'checkbox') return;
      if (input.checked) self.setAttribute('checked', '');
      else self.removeAttribute('checked');
      // Any deliberate toggle resolves the mixed state, exactly as a native
      // tri-state checkbox behaves.
      self.removeAttribute('indeterminate');
      proxy.setValue(input.checked ? self.getAttribute('value') || 'on' : '');
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: {
            value: self.getAttribute('value') ?? '',
            checked: input.checked,
          },
          bubbles: true,
          composed: true,
        })
      );
    };
    scope.on(self.shadowRoot, 'change', handler);
  },
  disconnected() {
    release(this);
  },
  updated() {
    const input = this.shadowRoot?.querySelector(
      'input'
    ) as HTMLInputElement | null;
    // `indeterminate` is an IDL-only property, so it cannot be expressed in the
    // rendered markup and has to be reapplied after every render.
    if (input) input.indeterminate = this.hasAttribute('indeterminate');
    syncFormProxy(this);
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-cb';
    const hintId = `${uid}-hint`;
    return html`
      <div class="field" part="wrapper">
        <label class="control" part="control">
          <span class="box-wrap">
            <input
              type="checkbox"
              part="input"
              name="${escapeHtml(props.name)}"
              value="${escapeHtml(props.value)}"
              ${bool('checked', props.checked)}
              ${bool('disabled', props.disabled)}
              ${bool('required', props.required)}
              ${props.indeterminate ? 'aria-checked="mixed"' : ''}
              ${props.hint ? `aria-describedby="${escapeHtml(hintId)}"` : ''}
            />
            <span class="box" part="box" aria-hidden="true"></span>
          </span>
          ${props.label
            ? `<span class="label-text" part="label">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</span>`
            : ''}
        </label>
        ${props.hint
          ? `<span class="hint" id="${escapeHtml(hintId)}" part="hint">${escapeHtml(props.hint)}</span>`
          : ''}
      </div>
    `;
  },
};

component<BqCheckboxProps, BqCheckboxState>('bq-checkbox', definition);
