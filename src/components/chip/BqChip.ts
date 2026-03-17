/**
 * Chip / tag component.
 * @element bq-chip
 * @prop {string}  variant  - primary | secondary | success | danger | warning | info
 * @prop {string}  size     - sm | md | lg
 * @prop {boolean} removable
 * @prop {boolean} selected
 * @prop {boolean} disabled
 * @slot - Chip label
 * @fires bq-remove
 * @fires bq-click
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';
import { t } from '../../i18n/index.js';

type BqChipProps = { variant: string; size: string; removable: boolean; selected: boolean; disabled: boolean };

const definition: ComponentDefinition<BqChipProps> = {
  props: {
    variant:  { type: String, default: 'primary' },
    size:     { type: String, default: 'md' },
    removable:{ type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: inline-flex; }
    .chip {
      display: inline-flex; align-items: center; gap: 0.375rem;
      border-radius: var(--bq-radius-full,9999px); font-family: var(--bq-font-family-sans);
      font-weight: var(--bq-font-weight-medium,500); white-space: nowrap; cursor: pointer;
      border: 1.5px solid transparent;
      transition: all var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .chip[data-size="sm"] { font-size: 0.75rem; padding: 0.25rem 0.625rem; }
    .chip[data-size="md"] { font-size: 0.875rem; padding: 0.375rem 0.75rem; }
    .chip[data-size="lg"] { font-size: 1rem; padding: 0.5rem 1rem; }
    .chip[data-variant="primary"]   { background: var(--bq-color-primary-100,#dbeafe); color: var(--bq-color-primary-700,#1d4ed8); }
    .chip[data-variant="secondary"] { background: var(--bq-color-secondary-100,#f1f5f9); color: var(--bq-color-secondary-700,#334155); }
    .chip[data-variant="success"]   { background: var(--bq-color-success-100,#dcfce7); color: var(--bq-color-success-700,#15803d); }
    .chip[data-variant="danger"]    { background: var(--bq-color-danger-100,#fee2e2); color: var(--bq-color-danger-700,#b91c1c); }
    .chip[data-variant="warning"]   { background: var(--bq-color-warning-100,#fef3c7); color: var(--bq-color-warning-700,#b45309); }
    .chip[data-variant="info"]      { background: var(--bq-color-info-100,#dbeafe); color: var(--bq-color-info-700,#1d4ed8); }
    .chip[aria-pressed="true"] { border-color: currentColor; }
    .chip[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
    .remove-btn {
      display: inline-flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; color: inherit;
      padding: 0; width: 1rem; height: 1rem; border-radius: 50%; font-size: 0.75rem; opacity: 0.7;
    }
    .remove-btn:hover { opacity: 1; }
    .remove-btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
  `,
  connected() {
    const self = this;
    const handler = (e: Event) => {
      if (self.hasAttribute('disabled')) return;
      const target = e.target as Element;
      if (target.closest('.remove-btn')) {
        e.stopPropagation();
        self.dispatchEvent(new CustomEvent('bq-remove', { bubbles: true, composed: true }));
        return;
      }
      self.dispatchEvent(new CustomEvent('bq-click', { bubbles: true, composed: true }));
    };
    const keyHandler = (e: Event) => {
      if (self.hasAttribute('disabled')) return;
      const key = (e as KeyboardEvent).key;
      if (key !== 'Enter' && key !== ' ') return;
      const target = e.target as HTMLElement | null;
      if (!target?.classList.contains('chip')) return;
      e.preventDefault();
      self.dispatchEvent(new CustomEvent('bq-click', { bubbles: true, composed: true }));
    };
    (self as unknown as Record<string, unknown>)['_handler'] = handler;
    (self as unknown as Record<string, unknown>)['_keyHandler'] = keyHandler;
    self.shadowRoot?.addEventListener('click', handler);
    self.shadowRoot?.addEventListener('keydown', keyHandler);
  },
  disconnected() {
    const handler = (this as unknown as Record<string, unknown>)['_handler'] as EventListener | undefined;
    const keyHandler = (this as unknown as Record<string, unknown>)['_keyHandler'] as EventListener | undefined;
    if (handler) this.shadowRoot?.removeEventListener('click', handler);
    if (keyHandler) this.shadowRoot?.removeEventListener('keydown', keyHandler);
  },
  render({ props }) {
    return html`
      <span part="chip" class="chip" data-variant="${escapeHtml(props.variant)}" data-size="${escapeHtml(props.size)}"
        role="button" tabindex="${props.disabled ? '-1' : '0'}"
        aria-pressed="${props.selected ? 'true' : 'false'}" aria-disabled="${props.disabled ? 'true' : 'false'}">
        <slot></slot>
        ${props.removable ? `<button type="button" class="remove-btn" aria-label="${t('chip.remove')}">✕</button>` : ''}
      </span>
    `;
  },
};

component<BqChipProps>('bq-chip', definition);
