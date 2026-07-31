/**
 * Copy-to-clipboard button.
 *
 * Copying is only half the job — without feedback the user cannot tell a
 * successful copy from a dead button, so the icon and the accessible name both
 * switch to the confirmed state for a moment and then switch back.
 *
 * The text can come from the `value` prop or, for the common "copy the code in
 * that block" case, from `from` — a selector resolved against the containing
 * document or shadow root.
 *
 * @element bq-copy-button
 * @prop {string}  value     - Text to copy
 * @prop {string}  from      - Selector whose text content is copied instead
 * @prop {string}  label     - Accessible name in the idle state
 * @prop {string}  copied-label - Accessible name after a successful copy
 * @prop {number}  timeout   - How long the confirmed state lasts, in ms
 * @prop {boolean} disabled
 * @prop {string}  variant   - ghost | outline | solid
 * @prop {string}  size      - sm | md | lg
 * @fires bq-copy - { value: string, ok: boolean }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import type { Disposer } from '../../utils/component.js';
import { iconCss } from '../../utils/icons.js';
import { baseStyles, focusRing, reset, srOnly } from '../../utils/styles.js';

type BqCopyButtonProps = {
  value: string;
  from: string;
  label: string;
  'copied-label': string;
  timeout: number;
  disabled: boolean;
  variant: string;
  size: string;
};

type BqCopyButtonState = { copied: boolean };

const copyStore = (owner: object) =>
  store<{ resetTimer?: Disposer | null }>(owner, () => ({}));

/**
 * Writes text to the clipboard.
 *
 * The async Clipboard API needs a secure context, so the deprecated
 * `execCommand` path stays as a fallback — a copy button on plain HTTP is
 * still expected to work, and there is no other way to do it.
 */
export async function writeClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* Blocked or unavailable — try the legacy path below. */
  }

  if (typeof document === 'undefined') return false;
  try {
    const scratch = document.createElement('textarea');
    scratch.value = text;
    scratch.setAttribute('readonly', '');
    // Off-screen rather than hidden: `display: none` makes it unselectable,
    // and an unselectable node cannot be copied from.
    scratch.style.cssText = 'position:fixed;top:-9999px;opacity:0;';
    document.body.appendChild(scratch);
    scratch.select();
    const ok = document.execCommand?.('copy') ?? false;
    scratch.remove();
    return ok;
  } catch {
    return false;
  }
}

const definition: ComponentDefinition<BqCopyButtonProps, BqCopyButtonState> = {
  props: {
    value: { type: String, default: '' },
    from: { type: String, default: '' },
    label: { type: String, default: '' },
    'copied-label': { type: String, default: '' },
    timeout: { type: Number, default: 2000 },
    disabled: { type: Boolean, default: false },
    variant: { type: String, default: 'ghost' },
    size: { type: String, default: 'md' },
  },
  state: { copied: false },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    ${focusRing}
    ${iconCss('copy', 'check')}
    :host { display: inline-flex; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 0.375rem;
      inline-size: var(--bq-copy-size, 2.25rem);
      block-size: var(--bq-copy-size, 2.25rem);
      padding: 0;
      border: var(--bq-border-width-control, 1.5px) solid transparent;
      border-radius: var(--bq-radius-md, 0.375rem);
      background: transparent;
      color: var(--bq-text-muted, #475569);
      cursor: pointer;
      font-family: var(--bq-font-family-sans);
      --bq-icon-size: 1.125rem;
      transition:
        background-color var(--bq-duration-fast) var(--bq-easing-standard),
        border-color var(--bq-duration-fast) var(--bq-easing-standard),
        color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    :host([size='sm']) .btn { --bq-copy-size: 1.75rem; --bq-icon-size: 0.875rem; }
    :host([size='lg']) .btn { --bq-copy-size: 2.75rem; --bq-icon-size: 1.25rem; }
    .btn:hover:not(:disabled) { background: var(--bq-bg-hover, rgba(15,23,42,0.06)); color: var(--bq-text-base, #0f172a); }
    :host([variant='outline']) .btn { border-color: var(--bq-border-emphasis, #cbd5e1); }
    :host([variant='solid']) .btn {
      background: var(--bq-bg-muted, #f1f5f9);
      border-color: var(--bq-border-base, #e2e8f0);
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    /* Confirmation reads as a state change, not a colour flash: the icon
       swaps and settles into the success hue. */
    .btn[data-copied='true'] { color: var(--bq-color-success-600, #16a34a); }
    .icon { transition: transform var(--bq-duration-fast) var(--bq-easing-spring); }
    .btn[data-copied='true'] .icon { transform: scale(1.1); }
  `,
  connected() {
    const self = host<BqCopyButtonState>(this);
    const scope = bind(self);
    const local = copyStore(self);

    /** Resolves the text to copy, preferring an explicit `value`. */
    const resolveText = (): string => {
      const explicit = self.getAttribute('value');
      if (explicit) return explicit;
      const selector = self.getAttribute('from');
      if (!selector) return self.textContent?.trim() ?? '';
      const root = self.getRootNode() as Document | ShadowRoot;
      try {
        const target =
          root.querySelector(selector) ?? document.querySelector(selector);
        return target?.textContent?.trim() ?? '';
      } catch {
        return '';
      }
    };

    scope.on(self.shadowRoot, 'click', (event) => {
      if (!(event.target as Element)?.closest('.btn')) return;
      if (self.hasAttribute('disabled')) return;
      const text = resolveText();
      void writeClipboard(text).then((ok) => {
        if (!self.isConnected) return;
        self.dispatchEvent(
          new CustomEvent('bq-copy', {
            detail: { value: text, ok },
            bubbles: true,
            composed: true,
          })
        );
        if (!ok) return;
        self.setState('copied', true);
        // Restarting the timer on every copy means a second click extends the
        // confirmation instead of cutting the first one short.
        local.resetTimer?.();
        const ms = Number(self.getAttribute('timeout') ?? 2000);
        local.resetTimer = scope.timeout(
          () => {
            local.resetTimer = null;
            if (self.isConnected) self.setState('copied', false);
          },
          Number.isFinite(ms) && ms > 0 ? ms : 2000
        );
      });
    });
  },
  disconnected() {
    release(this);
  },
  render({ props, state }) {
    const copied = state.copied === true;
    const idleLabel = props.label.trim() || t('copyButton.copy');
    const doneLabel = props['copied-label'].trim() || t('copyButton.copied');
    const label = copied ? doneLabel : idleLabel;
    return html`
      <button
        type="button"
        class="btn"
        part="button"
        data-copied="${copied ? 'true' : 'false'}"
        aria-label="${escapeHtml(label)}"
        ${props.disabled ? 'disabled aria-disabled="true"' : ''}
      >
        <span class="icon" data-icon="${copied ? 'check' : 'copy'}" aria-hidden="true"></span>
      </button>
      <span class="sr-only" role="status" aria-live="polite"
        >${copied ? escapeHtml(doneLabel) : ''}</span
      >
    `;
  },
};

component<BqCopyButtonProps, BqCopyButtonState>('bq-copy-button', definition);
