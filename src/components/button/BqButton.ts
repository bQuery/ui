/**
 * Button component - primary interactive control.
 * @element bq-button
 * @prop {string}  variant  - primary | secondary | outline | ghost | danger
 * @prop {string}  size     - sm | md | lg | xl
 * @prop {boolean} full-width - Stretch to the width of the container
 * @prop {boolean} pill     - Fully rounded ends
 * @prop {boolean} disabled
 * @prop {boolean} loading
 * @prop {string}  type     - button | submit | reset
 * @prop {string}  href
 * @prop {string}  target
 * @prop {string}  label    - Optional accessible label override
 * @slot          - Button content
 * @slot prefix-icon - Icon before content
 * @slot suffix-icon - Icon after content
 * @fires bq-click - { originalEvent: Event }
 */
import { bool, component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { uniqueId } from '../../utils/dom.js';
import { bind, host, release } from '../../utils/component.js';
import { baseStyles, reset, srOnly } from '../../utils/styles.js';

type BqButtonProps = {
  variant: string;
  size: string;
  'full-width': boolean;
  pill: boolean;
  disabled: boolean;
  loading: boolean;
  type: string;
  href: string;
  target: string;
  label: string;
};
type BqButtonState = { statusId: string };

const definition: ComponentDefinition<BqButtonProps, BqButtonState> = {
  props: {
    variant: { type: String, default: 'primary' },
    size:    { type: String, default: 'md' },
    'full-width': { type: Boolean, default: false },
    pill:    { type: Boolean, default: false },
    disabled:{ type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    type:    { type: String, default: 'button' },
    href:    { type: String, default: '' },
    target:  { type: String, default: '' },
    label:   { type: String, default: '' },
  },
  state: {
    statusId: '',
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    :host { display: inline-block; }
    :host([full-width]) { display: block; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 0.5rem;
      inline-size: 100%;
      border: var(--bq-border-width-control, 1.5px) solid transparent;
      border-radius: var(--bq-radius-lg, 0.5rem);
      font-family: var(--bq-font-family-sans);
      font-weight: var(--bq-font-weight-semibold, 600);
      line-height: 1; cursor: pointer; text-decoration: none;
      transition: background-color var(--bq-duration-fast) var(--bq-easing-standard),
                  border-color var(--bq-duration-fast) var(--bq-easing-standard),
                  box-shadow var(--bq-duration-fast) var(--bq-easing-standard),
                  transform var(--bq-duration-instant) var(--bq-easing-standard),
                  opacity var(--bq-duration-fast) var(--bq-easing-standard);
      white-space: nowrap; user-select: none; -webkit-user-select: none;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }
    /* Sizes track the shared control scale, so a button and an input placed
       side by side share a baseline. */
    .btn[data-size="sm"] { font-size: var(--bq-font-size-sm, 0.875rem); padding-inline: var(--bq-control-padding-sm, 0.75rem); min-block-size: var(--bq-control-height-sm, 2rem); }
    .btn[data-size="md"] { font-size: var(--bq-font-size-md, 1rem); padding-inline: var(--bq-control-padding-lg, 1rem); min-block-size: var(--bq-control-height-md, 2.5rem); }
    .btn[data-size="lg"] { font-size: var(--bq-font-size-lg, 1.125rem); padding-inline: 1.25rem; min-block-size: var(--bq-control-height-lg, 3rem); }
    .btn[data-size="xl"] { font-size: var(--bq-font-size-xl, 1.25rem); padding-inline: 1.5rem; min-block-size: var(--bq-control-height-xl, 3.5rem); }
    :host([pill]) .btn { border-radius: var(--bq-radius-full, 9999px); }

    /* Variants */
    .btn[data-variant="primary"] {
      background-color: var(--bq-color-primary-600,#2563eb);
      color: var(--bq-text-on-primary,#fff);
      border-color: var(--bq-color-primary-600,#2563eb);
      box-shadow: var(--bq-shadow-xs);
    }
    .btn[data-variant="primary"]:hover:not(:disabled):not([aria-disabled="true"]) { background-color: var(--bq-color-primary-700,#1d4ed8); border-color: var(--bq-color-primary-700,#1d4ed8); }
    .btn[data-variant="secondary"] { background-color: var(--bq-bg-muted,#f1f5f9); color: var(--bq-text-base,#0f172a); border-color: var(--bq-border-base,#e2e8f0); }
    .btn[data-variant="secondary"]:hover:not(:disabled):not([aria-disabled="true"]) { background-color: var(--bq-bg-emphasis,#e2e8f0); border-color: var(--bq-border-emphasis,#cbd5e1); }
    .btn[data-variant="outline"] { background-color: transparent; color: var(--bq-color-primary-600,#2563eb); border-color: var(--bq-color-primary-600,#2563eb); }
    .btn[data-variant="outline"]:hover:not(:disabled):not([aria-disabled="true"]) { background-color: var(--bq-color-primary-50,#eff6ff); }
    .btn[data-variant="ghost"] { background-color: transparent; color: var(--bq-text-base,#0f172a); border-color: transparent; }
    .btn[data-variant="ghost"]:hover:not(:disabled):not([aria-disabled="true"]) { background-color: var(--bq-bg-hover,rgba(15,23,42,0.06)); }
    .btn[data-variant="danger"] {
      background-color: var(--bq-color-danger-600,#dc2626);
      color: var(--bq-text-on-danger,#fff);
      border-color: var(--bq-color-danger-600,#dc2626);
      box-shadow: var(--bq-shadow-xs);
    }
    .btn[data-variant="danger"]:hover:not(:disabled):not([aria-disabled="true"]) { background-color: var(--bq-color-danger-700,#b91c1c); border-color: var(--bq-color-danger-700,#b91c1c); }

    /* States. The 1px nudge is what makes a click feel like a press; without
       it a button that triggers async work reads as unresponsive. */
    .btn:active:not(:disabled):not([aria-disabled="true"]) { transform: translateY(1px); }
    .btn:focus-visible { outline: 2px solid transparent; outline-offset: 2px; box-shadow: var(--bq-focus-ring); }
    .btn[data-variant="danger"]:focus-visible { box-shadow: var(--bq-focus-ring-danger); }
    .btn:disabled, .btn[aria-disabled="true"] { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

    /* The label is dimmed rather than removed while loading, so the button
       keeps its width and the row does not reflow mid-request. */
    :host([loading]) .btn { cursor: progress; }
    .spinner {
      inline-size: 1em; block-size: 1em; flex: none;
      border: 2px solid currentColor; border-block-start-color: transparent;
      border-radius: var(--bq-radius-full,9999px);
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (forced-colors: active) {
      .btn { border-color: ButtonText; }
      .btn:focus-visible { outline: 2px solid Highlight; }
    }
  `,
  connected() {
    const self = host<BqButtonState>(this);
    if (!self.getState<string>('statusId')) self.setState('statusId', uniqueId('bq-button-status'));
    bind(self).on(self.shadowRoot, 'click', (e) => {
      if (self.hasAttribute('disabled') || self.hasAttribute('loading')) {
        e.preventDefault(); e.stopPropagation(); return;
      }
      self.dispatchEvent(new CustomEvent('bq-click', { detail: { originalEvent: e }, bubbles: true, composed: true }));
    });
  },
  disconnected() {
    release(this);
  },
  render({ props, state }) {
    const tag = props.href ? 'a' : 'button';
    const isLink = tag === 'a';
    const disabled = props.disabled || props.loading;
    const accessibleLabel = props.label.trim();
    const loadingLabel = t('common.loading');
    const statusId = state.statusId || 'bq-button-status';
    const normalizedTarget = props.target.trim();
    const safeRel = normalizedTarget.toLowerCase() === '_blank' ? 'noopener noreferrer' : '';
    return html`
      <${tag}
        part="button"
        class="btn"
        data-variant="${escapeHtml(props.variant)}"
        data-size="${escapeHtml(props.size)}"
        ${!isLink ? `type="${escapeHtml(props.type)}"` : ''}
        ${props.href ? `href="${escapeHtml(props.href)}"` : ''}
        ${isLink && normalizedTarget ? `target="${escapeHtml(normalizedTarget)}"` : ''}
        ${isLink && safeRel ? `rel="${escapeHtml(safeRel)}"` : ''}
        ${bool('disabled', !isLink && disabled)}
        ${disabled ? 'aria-disabled="true"' : ''}
        ${isLink && disabled ? 'tabindex="-1"' : ''}
        ${props.loading ? 'aria-busy="true"' : ''}
        ${props.loading ? `aria-describedby="${escapeHtml(statusId)}"` : ''}
        ${accessibleLabel ? `aria-label="${escapeHtml(accessibleLabel)}"` : ''}
      >
        <slot name="prefix-icon"></slot>
        ${props.loading ? '<span class="spinner" aria-hidden="true"></span>' : ''}
        <slot></slot>
        <slot name="suffix-icon"></slot>
      </${tag}>
      ${props.loading ? `<span class="sr-only" id="${escapeHtml(statusId)}" role="status" aria-live="polite">${escapeHtml(loadingLabel)}</span>` : ''}
    `;
  },
};

component<BqButtonProps, BqButtonState>('bq-button', definition);
