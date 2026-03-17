/**
 * Checkbox form control.
 * @element bq-checkbox
 * @prop {string}  label         - Visible label
 * @prop {string}  name          - Input name
 * @prop {string}  value         - Input value
 * @prop {boolean} checked
 * @prop {boolean} indeterminate
 * @prop {boolean} disabled
 * @prop {boolean} required
 * @prop {string}  hint
 * @fires bq-change - { checked: boolean, value: string }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { createFormProxy, type FormProxy } from '../../utils/form.js';
import { getBaseStyles } from '../../utils/styles.js';

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

const definition: ComponentDefinition<BqCheckboxProps> = {
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
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .wrapper { display: flex; flex-direction: column; gap: 0.25rem; }
    .control { display: flex; align-items: flex-start; gap: 0.625rem; cursor: pointer; }
    :host([disabled]) .control { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
    input[type="checkbox"] {
      width: 1.125rem; height: 1.125rem; flex-shrink: 0;
      border: 2px solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-sm,0.25rem);
      background: var(--bq-bg-base,#fff); cursor: pointer;
      accent-color: var(--bq-color-primary-600,#2563eb);
      margin-top: 0.125rem;
    }
    input[type="checkbox"]:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .label-text { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans); line-height: 1.5; }
    .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); padding-left: 1.75rem; }
  `,
  connected() {
    const self = this;

    // Form proxy for native <form> participation
    const name = self.getAttribute('name') ?? '';
    const value = self.hasAttribute('checked')
      ? self.getAttribute('value') || 'on'
      : '';
    const disabled = self.hasAttribute('disabled');
    const proxy = createFormProxy(self, name, value, disabled);
    (self as unknown as Record<string, unknown>)['_formProxy'] = proxy;

    const handler = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (input?.type !== 'checkbox') return;
      if (input.checked) self.setAttribute('checked', '');
      else self.removeAttribute('checked');
      proxy.setValue(input.checked ? self.getAttribute('value') || 'on' : '');
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: {
            checked: input.checked,
            value: self.getAttribute('value') ?? '',
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
    const input = this.shadowRoot?.querySelector(
      'input'
    ) as HTMLInputElement | null;
    if (input) input.indeterminate = this.hasAttribute('indeterminate');
    const s = this as unknown as Record<string, unknown>;
    const proxy = s['_formProxy'] as FormProxy | undefined;
    if (proxy) {
      proxy.setName(this.getAttribute('name') ?? '');
      proxy.setValue(
        this.hasAttribute('checked') ? this.getAttribute('value') || 'on' : ''
      );
      proxy.setDisabled(this.hasAttribute('disabled'));
    }
  },
  render({ props }) {
    return html`
      <div class="wrapper" part="wrapper">
        <label class="control" part="control">
          <input
            type="checkbox"
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

component<BqCheckboxProps>('bq-checkbox', definition);
