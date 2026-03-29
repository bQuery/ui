/**
 * Toggle switch form control.
 * @element bq-switch
 * @prop {string}  label   - Visible label
 * @prop {string}  name    - Input name
 * @prop {boolean} checked
 * @prop {boolean} disabled
 * @prop {string}  size    - sm | md | lg
 * @fires bq-change - { checked: boolean }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { bool, component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { createFormProxy, type FormProxy } from '../../utils/form.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqSwitchProps = {
  label: string;
  name: string;
  checked: boolean;
  disabled: boolean;
  size: string;
};

const definition: ComponentDefinition<BqSwitchProps> = {
  props: {
    label: { type: String, default: '' },
    name: { type: String, default: '' },
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: inline-flex; }
    .control { display: inline-flex; align-items: center; gap: 0.625rem; cursor: pointer; font-family: var(--bq-font-family-sans); }
    :host([disabled]) .control { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
    .track {
      position: relative; display: inline-block; background: var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-full,9999px);
      transition: background var(--bq-duration-fast) var(--bq-easing-standard);
      flex-shrink: 0;
    }
    .track[data-size="sm"] { width: 1.75rem; height: 1rem; }
    .track[data-size="md"] { width: 2.5rem; height: 1.375rem; }
    .track[data-size="lg"] { width: 3rem; height: 1.625rem; }
    input { position: absolute; opacity: 0; width: 0; height: 0; }
    .thumb {
      position: absolute; top: 2px; left: 2px; background: #fff;
      border-radius: 50%; transition: transform var(--bq-duration-fast) var(--bq-easing-standard);
      box-shadow: var(--bq-shadow-sm);
    }
    .track[data-size="sm"]  .thumb { width: calc(1rem - 4px);    height: calc(1rem - 4px); }
    .track[data-size="md"]  .thumb { width: calc(1.375rem - 4px); height: calc(1.375rem - 4px); }
    .track[data-size="lg"]  .thumb { width: calc(1.625rem - 4px); height: calc(1.625rem - 4px); }
    :host([checked]) .track { background: var(--bq-color-primary-600,#2563eb); }
    :host([checked]) .track[data-size="sm"]  .thumb { transform: translateX(0.75rem); }
    :host([checked]) .track[data-size="md"]  .thumb { transform: translateX(1.125rem); }
    :host([checked]) .track[data-size="lg"]  .thumb { transform: translateX(1.375rem); }
    input:focus-visible + .thumb { box-shadow: var(--bq-focus-ring); }
    .label-text { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-base,#0f172a); }
    @media (prefers-reduced-motion: reduce) {
      .track, .thumb { transition: none; }
    }
  `,
  connected() {
    const self = this;

    // Form proxy for native <form> participation
    const name = self.getAttribute('name') ?? '';
    const value = self.hasAttribute('checked') ? 'on' : '';
    const disabled = self.hasAttribute('disabled');
    const proxy = createFormProxy(self, name, value, disabled);
    (self as unknown as Record<string, unknown>)['_formProxy'] = proxy;

    const handler = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (input?.type !== 'checkbox') return;
      if (input.checked) self.setAttribute('checked', '');
      else self.removeAttribute('checked');
      proxy.setValue(input.checked ? 'on' : '');
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: { checked: input.checked },
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
      proxy.setValue(this.hasAttribute('checked') ? 'on' : '');
      proxy.setDisabled(this.hasAttribute('disabled'));
    }
  },
  render({ props }) {
    return html`
      <label class="control" part="control">
        <span class="track" data-size="${escapeHtml(props.size)}">
          <input
            type="checkbox"
            part="input"
            name="${escapeHtml(props.name)}"
            ${bool('checked', props.checked)}
            ${bool('disabled', props.disabled)}
            role="switch"
            aria-checked="${props.checked ? 'true' : 'false'}"
            aria-label="${escapeHtml(props.label)}"
          />
          <span class="thumb" part="thumb"></span>
        </span>
        ${props.label
          ? `<span class="label-text" part="label">${escapeHtml(props.label)}</span>`
          : ''}
      </label>
    `;
  },
};

component<BqSwitchProps>('bq-switch', definition);
