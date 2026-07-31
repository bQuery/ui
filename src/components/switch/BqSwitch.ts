/**
 * Toggle switch form control.
 * @element bq-switch
 * @prop {string}  label   - Visible label
 * @prop {string}  name    - Input name
 * @prop {string}  value   - Submitted value when on (default `on`)
 * @prop {boolean} checked
 * @prop {boolean} disabled
 * @prop {boolean} required
 * @prop {string}  size    - sm | md | lg
 * @prop {string}  hint
 * @fires bq-change - { value: string, checked: boolean }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { bool, component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { bindFormProxy, syncFormProxy } from '../../utils/form.js';
import { t } from '../../i18n/index.js';
import { bind, host, release } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { baseStyles, fieldStyles, reset } from '../../utils/styles.js';

type BqSwitchProps = {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  disabled: boolean;
  required: boolean;
  size: string;
  hint: string;
};

type BqSwitchState = { uid: string };

const definition: ComponentDefinition<BqSwitchProps, BqSwitchState> = {
  props: {
    label: { type: String, default: '' },
    name: { type: String, default: '' },
    value: { type: String, default: '' },
    checked: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
    hint: { type: String, default: '' },
  },
  state: { uid: '' },
  styles: css`
    ${baseStyles}
    ${reset}
    ${fieldStyles}
    :host { display: inline-block; }
    .field { gap: 0.25rem; }
    .control {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      cursor: pointer;
      font-family: var(--bq-font-family-sans);
    }
    :host([disabled]) .control { opacity: 0.55; cursor: not-allowed; }

    /* One custom property drives width, height, thumb size and travel, so a
       new size is one line rather than four coordinated ones. */
    .track {
      --bq-switch-track-h: 1.375rem;
      --bq-switch-track-w: 2.5rem;
      --bq-switch-gap: 2px;
      position: relative;
      display: inline-block;
      flex: none;
      inline-size: var(--bq-switch-track-w);
      block-size: var(--bq-switch-track-h);
      background: var(--bq-border-strong, #94a3b8);
      border-radius: var(--bq-radius-full, 9999px);
      transition:
        background-color var(--bq-duration-normal) var(--bq-easing-standard),
        box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .track[data-size='sm'] { --bq-switch-track-h: 1rem; --bq-switch-track-w: 1.75rem; }
    .track[data-size='lg'] { --bq-switch-track-h: 1.625rem; --bq-switch-track-w: 3rem; }

    input {
      position: absolute;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }
    /* The thumb travels by animating inset-inline-start rather than a
       transform: a translation is physical, so it would slide the wrong way
       in an RTL document, and the distance here is far too small for the
       compositor to matter. */
    .thumb {
      position: absolute;
      inset-block-start: var(--bq-switch-gap);
      inset-inline-start: var(--bq-switch-gap);
      inline-size: calc(var(--bq-switch-track-h) - var(--bq-switch-gap) * 2);
      block-size: calc(var(--bq-switch-track-h) - var(--bq-switch-gap) * 2);
      background: #fff;
      border-radius: var(--bq-radius-full, 9999px);
      box-shadow: var(--bq-shadow-sm);
      transition: inset-inline-start var(--bq-duration-normal) var(--bq-easing-emphasized);
    }
    .control:hover input:not(:disabled) ~ .track { background: var(--bq-text-subtle, #94a3b8); }
    input:checked ~ .track { background: var(--bq-color-primary-600, #2563eb); }
    .control:hover input:checked:not(:disabled) ~ .track { background: var(--bq-color-primary-700, #1d4ed8); }
    input:checked ~ .track .thumb {
      inset-inline-start: calc(var(--bq-switch-track-w) - var(--bq-switch-track-h) + var(--bq-switch-gap));
    }
    input:focus-visible ~ .track { box-shadow: var(--bq-focus-ring); }

    .label-text {
      font-size: var(--bq-font-size-sm, 0.875rem);
      color: var(--bq-text-base, #0f172a);
      line-height: var(--bq-line-height-normal, 1.5);
    }

    @media (forced-colors: active) {
      .track { forced-color-adjust: none; background: Canvas; border: 1px solid CanvasText; }
      input:checked ~ .track { background: Highlight; }
      .thumb { background: CanvasText; }
      input:checked ~ .track .thumb { background: HighlightText; }
      input:focus-visible ~ .track { outline: 2px solid CanvasText; outline-offset: 2px; }
    }
  `,
  connected() {
    const self = host<BqSwitchState>(this);
    const scope = bind(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-sw'));

    const onValue = () => self.getAttribute('value') || 'on';

    // Form proxy for native <form> participation
    const proxy = bindFormProxy(self, scope, {
      value: () => (self.hasAttribute('checked') ? onValue() : ''),
    });

    const handler = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (input?.type !== 'checkbox') return;
      if (input.checked) self.setAttribute('checked', '');
      else self.removeAttribute('checked');
      proxy.setValue(input.checked ? onValue() : '');
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: {
            value: input.checked ? onValue() : '',
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
    syncFormProxy(this);
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-sw';
    const labelId = `${uid}-label`;
    const hintId = `${uid}-hint`;
    const describedBy = props.hint ? hintId : '';
    return html`
      <div class="field" part="wrapper">
        <label class="control" part="control">
          <span class="track" part="track" data-size="${escapeHtml(props.size)}">
            <input
              type="checkbox"
              part="input"
              role="switch"
              name="${escapeHtml(props.name)}"
              ${bool('checked', props.checked)}
              ${bool('disabled', props.disabled)}
              ${bool('required', props.required)}
              aria-checked="${props.checked ? 'true' : 'false'}"
              ${
                props.label
                  ? `aria-labelledby="${escapeHtml(labelId)}"`
                  : `aria-label="${escapeHtml(t('switch.defaultLabel'))}"`
              }
              ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''}
            />
            <span class="thumb" part="thumb"></span>
          </span>
          ${
            props.label
              ? `<span class="label-text" id="${escapeHtml(labelId)}" part="label">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</span>`
              : ''
          }
        </label>
        ${
          props.hint
            ? `<span class="hint" id="${escapeHtml(hintId)}" part="hint">${escapeHtml(props.hint)}</span>`
            : ''
        }
      </div>
    `;
  },
};

component<BqSwitchProps, BqSwitchState>('bq-switch', definition);
