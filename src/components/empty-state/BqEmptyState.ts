import { getBaseStyles } from '../../utils/styles.js';
import { t } from '../../i18n/index.js';

/**
 * Empty state / zero state component.
 * @element bq-empty-state
 * @prop {string} title
 * @prop {string} description
 * @prop {string} icon - SVG or emoji
 * @slot action - CTA button(s)
 * @slot icon   - Custom icon
 */
export class BqEmptyState extends HTMLElement {
  static get observedAttributes() { return ['title','description','icon']; }
  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const title = this.getAttribute('title') ?? t('emptyState.title');
    const description = this.getAttribute('description') ?? t('emptyState.description');
    const icon = this.getAttribute('icon') ?? '📭';

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: flex; justify-content: center; }

      .empty {
        display: flex; flex-direction: column; align-items: center;
        gap: var(--bq-space-4,1rem);
        padding: var(--bq-space-12,3rem) var(--bq-space-6,1.5rem);
        text-align: center;
        max-width: 24rem;
        font-family: var(--bq-font-family-sans);
      }
      .icon-wrap { font-size: 3rem; line-height: 1; color: var(--bq-text-subtle,#94a3b8); }
      .title {
        font-size: var(--bq-font-size-lg,1.125rem);
        font-weight: var(--bq-font-weight-semibold,600);
        color: var(--bq-text-base,#0f172a);
        margin: 0;
      }
      .description {
        font-size: var(--bq-font-size-sm,0.875rem);
        color: var(--bq-text-muted,#475569);
        line-height: var(--bq-line-height-relaxed,1.625);
        margin: 0;
      }
      .action { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
      .action:empty { display: none; }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div part="empty-state" class="empty" role="status">
        <div class="icon-wrap" part="icon" aria-hidden="true">
          <slot name="icon">${icon}</slot>
        </div>
        <h2 class="title" part="title">${title}</h2>
        <p class="description" part="description">${description}</p>
        <div class="action" part="action"><slot name="action"></slot></div>
      </div>
    `;
  }
}

export function registerBqEmptyState(prefix = 'bq'): string {
  const tag = `${prefix}-empty-state`;
  if (!customElements.get(tag)) customElements.define(tag, BqEmptyState);
  return tag;
}
