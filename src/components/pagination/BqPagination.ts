import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

/**
 * Pagination component.
 * @element bq-pagination
 * @prop {number}  page      - Current page (1-based)
 * @prop {number}  total     - Total number of pages
 * @prop {boolean} sibling-count - Pages shown on each side of current
 * @fires bq-page-change - { page }
 */
export class BqPagination extends HTMLElement {
  static get observedAttributes() { return ['page','total','sibling-count','disabled']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-pagination');
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _getPages(current: number, total: number, siblings: number): Array<number | '...'> {
    const range = (start: number, end: number) =>
      Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const totalShown = siblings * 2 + 5;
    if (total <= totalShown) return range(1, total);

    const leftSibling = Math.max(current - siblings, 1);
    const rightSibling = Math.min(current + siblings, total);
    const showLeft = leftSibling > 2;
    const showRight = rightSibling < total - 1;

    if (!showLeft && showRight) {
      return [...range(1, 3 + siblings * 2), '...', total];
    }
    if (showLeft && !showRight) {
      return [1, '...', ...range(total - (3 + siblings * 2) + 1, total)];
    }
    return [1, '...', ...range(leftSibling, rightSibling), '...', total];
  }

  private _render() {
    const page = parseInt(this.getAttribute('page') ?? '1', 10);
    const total = parseInt(this.getAttribute('total') ?? '1', 10);
    const siblings = parseInt(this.getAttribute('sibling-count') ?? '1', 10);
    const disabled = this.hasAttribute('disabled');

    const pages = this._getPages(page, total, siblings);

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .pagination {
        display: flex; align-items: center; gap: 0.25rem;
        font-family: var(--bq-font-family-sans);
        font-size: var(--bq-font-size-sm,0.875rem);
        opacity: ${disabled ? '0.5' : '1'};
        user-select: none;
      }
      .page-btn {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 2.25rem; height: 2.25rem; padding: 0 0.5rem;
        background: none; border: 1.5px solid transparent;
        border-radius: var(--bq-radius-md,0.375rem);
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        color: var(--bq-text-muted,#475569);
        font-size: inherit;
        transition: all var(--bq-duration-fast) var(--bq-easing-standard);
        font-family: inherit;
      }
      .page-btn:hover:not(:disabled):not(.page-btn--active) {
        background: var(--bq-bg-muted,#f1f5f9);
        color: var(--bq-text-base,#0f172a);
        border-color: var(--bq-border-emphasis,#cbd5e1);
      }
      .page-btn--active {
        background: var(--bq-color-primary-600,#2563eb);
        color: #fff;
        border-color: var(--bq-color-primary-600,#2563eb);
        cursor: default;
      }
      .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .page-btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
      .ellipsis { display: inline-flex; align-items: center; justify-content: center; min-width: 2.25rem; height: 2.25rem; color: var(--bq-text-subtle,#94a3b8); }
    `;

    const nav = (targetPage: number, label: string, content: string) => {
      const isDisabled = disabled || targetPage < 1 || targetPage > total;
      return `<button class="page-btn" ${isDisabled ? 'disabled' : ''} data-page="${targetPage}" aria-label="${label}" type="button">${content}</button>`;
    };

    const pageButtons = pages.map((p) =>
      p === '...'
        ? `<span class="ellipsis" aria-hidden="true">…</span>`
        : `<button class="page-btn ${p === page ? 'page-btn--active' : ''}" data-page="${p}" aria-label="${t('pagination.page')} ${p}" aria-current="${p === page ? 'page' : 'false'}" type="button" ${disabled ? 'disabled' : ''}>${p}</button>`
    ).join('');

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <nav aria-label="Pagination" part="nav" id="${this._id}">
        <div class="pagination" part="pagination" role="list">
          ${nav(1, t('pagination.firstPage'), '«')}
          ${nav(page - 1, t('pagination.prev'), '‹')}
          ${pageButtons}
          ${nav(page + 1, t('pagination.next'), '›')}
          ${nav(total, t('pagination.lastPage'), '»')}
        </div>
      </nav>
    `;

    this._shadow.querySelector('.pagination')?.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest('[data-page]') as HTMLElement | null;
      if (!btn || btn.hasAttribute('disabled')) return;
      const targetPage = parseInt(btn.getAttribute('data-page') ?? '1', 10);
      if (targetPage === page) return;
      this.setAttribute('page', String(targetPage));
      dispatch(this, 'bq-page-change', { page: targetPage });
    });
  }
}

export function registerBqPagination(prefix = 'bq'): string {
  const tag = `${prefix}-pagination`;
  if (!customElements.get(tag)) customElements.define(tag, BqPagination);
  return tag;
}
