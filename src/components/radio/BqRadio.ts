/**
 * Radio button form control.
 * @element bq-radio
 * @prop {string}  label    - Visible label
 * @prop {string}  name     - Input name (group)
 * @prop {string}  value    - Input value
 * @prop {boolean} checked
 * @prop {boolean} disabled
 * @prop {boolean} required
 * @prop {string}  hint
 * @fires bq-change - { value: string, checked: boolean }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { createFormProxy, type FormProxy } from '../../utils/form.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqRadioProps = {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  disabled: boolean;
  required: boolean;
  hint: string;
};

const definition: ComponentDefinition<BqRadioProps> = {
  props: {
    label: { type: String, default: '' },
    name: { type: String, default: '' },
    value: { type: String, default: '' },
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    hint: { type: String, default: '' },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .wrapper { display: flex; flex-direction: column; gap: 0.25rem; }
    .control { display: flex; align-items: flex-start; gap: 0.625rem; cursor: pointer; }
    :host([disabled]) .control { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
    input[type="radio"] {
      width: 1.125rem; height: 1.125rem; flex-shrink: 0;
      border: 2px solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: 50%; background: var(--bq-bg-base,#fff);
      cursor: pointer; accent-color: var(--bq-color-primary-600,#2563eb); margin-top: 0.125rem;
    }
    input[type="radio"]:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .label-text { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans); line-height: 1.5; }
    .required-mark { color: var(--bq-color-danger-600,#dc2626); }
    .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); padding-inline-start: 1.75rem; }
  `,
  connected() {
    const self = this;

    // Form proxy for native <form> participation
    const name = self.getAttribute('name') ?? '';
    const value = self.hasAttribute('checked')
      ? (self.getAttribute('value') ?? '')
      : '';
    const disabled = self.hasAttribute('disabled');
    const proxy = createFormProxy(self, name, value, disabled);
    (self as unknown as Record<string, unknown>)['_formProxy'] = proxy;

    const handler = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (input?.type !== 'radio') return;
      if (input.checked) self.setAttribute('checked', '');
      else self.removeAttribute('checked');
      proxy.setValue(input.checked ? (self.getAttribute('value') ?? '') : '');
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
    (self as unknown as Record<string, unknown>)['_handler'] = handler;
    self.shadowRoot?.addEventListener('change', handler);
  },
  disconnected() {
    const h = (this as unknown as Record<string, unknown>)['_handler'] as
      | EventListener
      | undefined;
    if (h) this.shadowRoot?.removeEventListener('change', h);
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
      proxy.setValue(
        this.hasAttribute('checked') ? (this.getAttribute('value') ?? '') : ''
      );
      proxy.setDisabled(this.hasAttribute('disabled'));
    }
  },
  render({ props }) {
    return html`
      <div class="wrapper" part="wrapper">
        <label class="control" part="control">
          <input
            type="radio"
            part="input"
            name="${escapeHtml(props.name)}"
            value="${escapeHtml(props.value)}"
            ${props.checked ? 'checked' : ''}
            ${props.disabled ? 'disabled' : ''}
            ${props.required ? 'required' : ''}
          />
          ${props.label
            ? `<span class="label-text" part="label">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</span>`
            : ''}
        </label>
        ${props.hint
          ? `<span class="hint" part="hint">${escapeHtml(props.hint)}</span>`
          : ''}
      </div>
    `;
  },
};

component<BqRadioProps>('bq-radio', definition);
