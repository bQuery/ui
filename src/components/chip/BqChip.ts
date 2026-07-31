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
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release } from '../../utils/component.js';
import { iconCss } from '../../utils/icons.js';
import { baseStyles, focusRing, reset } from '../../utils/styles.js';

type BqChipProps = {
  variant: string;
  size: string;
  removable: boolean;
  selected: boolean;
  disabled: boolean;
};

const definition: ComponentDefinition<BqChipProps> = {
  props: {
    variant: { type: String, default: 'primary' },
    size: { type: String, default: 'md' },
    removable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${focusRing}
    ${iconCss('x')}
    :host { display: inline-flex; }
    .chip {
      display: inline-flex; align-items: center; gap: 0.375rem;
      border-radius: var(--bq-radius-full,9999px); font-family: var(--bq-font-family-sans);
      font-weight: var(--bq-font-weight-medium,500); white-space: nowrap; cursor: pointer;
      border: 1.5px solid transparent;
      transition: color var(--bq-duration-fast) var(--bq-easing-standard),
                  background-color var(--bq-duration-fast) var(--bq-easing-standard),
                  border-color var(--bq-duration-fast) var(--bq-easing-standard);
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
      padding: 0; inline-size: 1rem; block-size: 1rem;
      border-radius: var(--bq-radius-full,9999px); opacity: 0.6;
      --bq-icon-size: 0.75rem;
      transition: opacity var(--bq-duration-fast) var(--bq-easing-standard),
                  background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .remove-btn:hover { opacity: 1; background: var(--bq-bg-hover,rgba(15,23,42,0.1)); }
    .remove-btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    @media (prefers-reduced-motion: reduce) {
      .chip { transition: none; }
    }
  `,
  connected() {
    const self = host(this);
    const handler = (e: Event) => {
      if (self.hasAttribute('disabled')) return;
      const target = e.target as Element;
      if (target.closest('.remove-btn')) {
        e.stopPropagation();
        self.dispatchEvent(
          new CustomEvent('bq-remove', { bubbles: true, composed: true })
        );
        return;
      }
      self.dispatchEvent(
        new CustomEvent('bq-click', { bubbles: true, composed: true })
      );
    };
    const keyHandler = (e: Event) => {
      if (self.hasAttribute('disabled')) return;
      const ke = e as KeyboardEvent;
      const target = e.target as HTMLElement | null;
      if (!target?.classList.contains('chip')) return;
      const isSpaceKeydown = ke.type === 'keydown' && ke.key === ' ';
      const isEnterKeydown =
        ke.type === 'keydown' && ke.key === 'Enter' && !ke.repeat;
      const isSpaceKeyup = ke.type === 'keyup' && ke.key === ' ';
      if (isSpaceKeydown) {
        e.preventDefault();
        return;
      }
      if (!isEnterKeydown && !isSpaceKeyup) return;
      e.preventDefault();
      // Handle remove button activation via keyboard
      const focusedTarget = ke.target as HTMLElement | null;
      if (focusedTarget?.closest('.remove-btn')) {
        self.dispatchEvent(
          new CustomEvent('bq-remove', { bubbles: true, composed: true })
        );
        return;
      }
      self.dispatchEvent(
        new CustomEvent('bq-click', { bubbles: true, composed: true })
      );
    };
    const scope = bind(self);
    scope.on(self.shadowRoot, 'click', handler);
    scope.on(self.shadowRoot, 'keydown', keyHandler);
    scope.on(self.shadowRoot, 'keyup', keyHandler);
  },
  disconnected() {
    release(this);
  },
  render({ props }) {
    return html`
      <span
        part="chip"
        class="chip"
        data-variant="${escapeHtml(props.variant)}"
        data-size="${escapeHtml(props.size)}"
        role="button"
        tabindex="${props.disabled ? '-1' : '0'}"
        aria-pressed="${props.selected ? 'true' : 'false'}"
        aria-disabled="${props.disabled ? 'true' : 'false'}"
      >
        <slot></slot>
        ${props.removable
          ? `<button type="button" class="remove-btn" aria-label="${t('chip.remove')}"><span class="icon" data-icon="x" aria-hidden="true"></span></button>`
          : ''}
      </span>
    `;
  },
};

component<BqChipProps>('bq-chip', definition);
