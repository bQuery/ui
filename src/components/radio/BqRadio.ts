/**
 * Radio button form control.
 *
 * Like `bq-checkbox`, the native input stays for semantics and keyboard/group
 * behaviour and is rendered transparently over a drawn dial — a real radio
 * exposes nothing but `accent-color`, so its ring weight, size and focus
 * treatment would otherwise be whatever the operating system feels like.
 *
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
import { bool, component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { bindFormProxy, syncFormProxy } from '../../utils/form.js';
import { bind, host, release } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { baseStyles, fieldStyles, reset } from '../../utils/styles.js';

type BqRadioProps = {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  disabled: boolean;
  required: boolean;
  hint: string;
};

type BqRadioState = { uid: string };

const definition: ComponentDefinition<BqRadioProps, BqRadioState> = {
  props: {
    label: { type: String, default: '' },
    name: { type: String, default: '' },
    value: { type: String, default: '' },
    checked: { type: Boolean, default: false },
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

    .dial-wrap {
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
    .dial {
      inline-size: 1.125rem;
      block-size: 1.125rem;
      display: grid;
      place-items: center;
      border: var(--bq-border-width-control, 1.5px) solid var(--bq-border-strong, #94a3b8);
      border-radius: var(--bq-radius-full, 9999px);
      background: var(--bq-bg-base, #fff);
      transition:
        border-color var(--bq-duration-fast) var(--bq-easing-standard),
        box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    /* The mark is an inner disc rather than a filled circle: a ring reads as
       "one of several" where a solid blob reads as a checkbox. */
    .dial::after {
      content: '';
      inline-size: 0.625rem;
      block-size: 0.625rem;
      border-radius: var(--bq-radius-full, 9999px);
      background: var(--bq-color-primary-600, #2563eb);
      transform: scale(0);
      transition: transform var(--bq-duration-fast) var(--bq-easing-spring);
    }
    .control:hover input:not(:disabled) ~ .dial { border-color: var(--bq-color-primary-500, #3b82f6); }
    input:checked ~ .dial { border-color: var(--bq-color-primary-600, #2563eb); }
    input:checked ~ .dial::after { transform: scale(1); }
    input:focus-visible ~ .dial {
      border-color: var(--bq-border-focus, #2563eb);
      box-shadow: var(--bq-focus-ring);
    }
    input:disabled ~ .dial { background: var(--bq-bg-muted, #f1f5f9); }
    input:checked:disabled ~ .dial::after { background: var(--bq-border-strong, #94a3b8); }

    .label-text {
      font-size: var(--bq-font-size-sm, 0.875rem);
      color: var(--bq-text-base, #0f172a);
      line-height: var(--bq-line-height-normal, 1.5);
    }
    .hint { padding-inline-start: 1.75rem; }

    @media (forced-colors: active) {
      .dial { forced-color-adjust: none; background: Canvas; border-color: CanvasText; }
      input:checked ~ .dial { border-color: Highlight; }
      .dial::after { background: Highlight; }
      input:focus-visible ~ .dial { outline: 2px solid CanvasText; outline-offset: 2px; }
    }
  `,
  connected() {
    const self = host<BqRadioState>(this);
    const scope = bind(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-rd'));

    // Form proxy for native <form> participation
    const proxy = bindFormProxy(self, scope, {
      value: () =>
        self.hasAttribute('checked') ? (self.getAttribute('value') ?? '') : '',
    });

    const handler = (e: Event) => {
      const input = e.target as HTMLInputElement | null;
      if (input?.type !== 'radio') return;
      if (input.checked) self.setAttribute('checked', '');
      else self.removeAttribute('checked');
      proxy.setValue(input.checked ? (self.getAttribute('value') ?? '') : '');
      // Each radio lives in its own shadow root, so the platform's "one per
      // name" rule cannot see the siblings — unchecking them is up to us.
      if (input.checked) uncheckSiblings(self);
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
    syncFormProxy(this);
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-rd';
    const hintId = `${uid}-hint`;
    return html`
      <div class="field" part="wrapper">
        <label class="control" part="control">
          <span class="dial-wrap">
            <input
              type="radio"
              part="input"
              name="${escapeHtml(props.name)}"
              value="${escapeHtml(props.value)}"
              ${bool('checked', props.checked)}
              ${bool('disabled', props.disabled)}
              ${bool('required', props.required)}
              ${props.hint ? `aria-describedby="${escapeHtml(hintId)}"` : ''}
            />
            <span class="dial" part="dial" aria-hidden="true"></span>
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

/**
 * Clears the `checked` attribute from the other `bq-radio` elements sharing a
 * name, scoped to the nearest form so two unrelated groups on one page do not
 * clear each other.
 */
function uncheckSiblings(el: HTMLElement): void {
  const name = el.getAttribute('name');
  if (!name) return;
  const root =
    (el.closest('form') as Element | null) ??
    (el.getRootNode() as Document | ShadowRoot);
  const selector = `bq-radio[name="${name.replace(/["\\]/g, '\\$&')}"]`;
  let peers: NodeListOf<Element>;
  try {
    peers = root.querySelectorAll(selector);
  } catch {
    return;
  }
  for (const peer of Array.from(peers)) {
    if (peer === el) continue;
    peer.removeAttribute('checked');
  }
}

component<BqRadioProps, BqRadioState>('bq-radio', definition);
