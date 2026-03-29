/**
 * Pagination navigation component.
 * @element bq-pagination
 * @prop {number}  page          - Current page (1-based)
 * @prop {number}  total         - Total number of pages
 * @prop {number}  sibling-count - Number of sibling pages each side
 * @prop {boolean} disabled
 * @fires bq-page-change - { page: number }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { bool, component, html } from '@bquery/bquery/component';
import { t } from '../../i18n/index.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqPaginationProps = {
  page: number;
  total: number;
  'sibling-count': number;
  disabled: boolean;
};

function buildPages(
  page: number,
  total: number,
  siblings: number
): Array<number | '...'> {
  if (total <= 0) return [1];
  const validPage = Math.max(1, Math.min(page, total));
  if (total <= 7 + siblings * 2)
    return Array.from({ length: total }, (_, i) => i + 1);
  const left = Math.max(2, validPage - siblings);
  const right = Math.min(total - 1, validPage + siblings);
  const showLeft = left > 2;
  const showRight = right < total - 1;
  const pages: Array<number | '...'> = [1];
  if (showLeft) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (showRight) pages.push('...');
  pages.push(total);
  return pages;
}

const definition: ComponentDefinition<BqPaginationProps> = {
  props: {
    page: { type: Number, default: 1 },
    total: { type: Number, default: 1 },
    'sibling-count': { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .pagination { display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap; font-family: var(--bq-font-family-sans); }
    :host([disabled]) .pagination { opacity: 0.5; pointer-events: none; }
    .page-btn {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 2.25rem; height: 2.25rem; padding: 0 0.5rem;
      border: 1.5px solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-md,0.375rem);
      background: var(--bq-bg-base,#fff); color: var(--bq-text-base,#0f172a);
      font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500);
      cursor: pointer; font-family: inherit;
      transition: all var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .page-btn:hover:not(:disabled):not([data-current="true"]) { background: var(--bq-bg-muted,#f1f5f9); border-color: var(--bq-color-primary-300,#93c5fd); }
    .page-btn[data-current="true"] { background: var(--bq-color-primary-600,#2563eb); border-color: var(--bq-color-primary-600,#2563eb); color: #fff; }
    .page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .page-btn:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .ellipsis { display: inline-flex; align-items: center; justify-content: center; min-width: 2.25rem; height: 2.25rem; color: var(--bq-text-subtle,#94a3b8); font-size: var(--bq-font-size-sm,0.875rem); }
    @media (prefers-reduced-motion: reduce) {
      .page-btn { transition: none; }
    }
  `,
  connected() {
    const self = this;
    const handler = (e: Event) => {
      const btn = (e.target as Element).closest(
        '.page-btn'
      ) as HTMLElement | null;
      if (!btn || btn.hasAttribute('disabled') || self.hasAttribute('disabled'))
        return;
      const p = parseInt(btn.getAttribute('data-page') ?? '0', 10);
      if (!p || isNaN(p)) return;
      self.setAttribute('page', String(p));
      self.dispatchEvent(
        new CustomEvent('bq-page-change', {
          detail: { page: p },
          bubbles: true,
          composed: true,
        })
      );
    };
    (self as unknown as Record<string, unknown>)['_handler'] = handler;
    self.shadowRoot?.addEventListener('click', handler);
  },
  disconnected() {
    const h = (this as unknown as Record<string, unknown>)['_handler'] as
      | EventListener
      | undefined;
    if (h) this.shadowRoot?.removeEventListener('click', h);
  },
  render({ props }) {
    const page = Math.max(1, Math.min(props.page, props.total || 1));
    const total = props.total;
    const siblings = props['sibling-count'];
    const pages = buildPages(page, total, siblings);
    const prevDisabled = page <= 1 || props.disabled;
    const nextDisabled = page >= total || props.disabled;
    const pageItems = pages
      .map((p) => {
        if (p === '...')
          return '<span class="ellipsis" role="separator" aria-hidden="true">&#8230;</span>';
        return `<button class="page-btn" data-page="${p}" data-current="${p === page ? 'true' : 'false'}" ${p === page ? 'aria-current="page"' : ''} type="button" aria-label="${t('pagination.page')} ${p}">${p}</button>`;
      })
      .join('');
    return html`
      <nav aria-label="${t('pagination.nav')}" part="nav">
        <div class="pagination" part="pagination">
          <button
            class="page-btn"
            data-page="${String(page - 1)}"
            ${bool('disabled', prevDisabled)}
            aria-label="${t('pagination.prev')}"
            type="button"
          >
            &#8249;
          </button>
          ${pageItems}
          <button
            class="page-btn"
            data-page="${String(page + 1)}"
            ${bool('disabled', nextDisabled)}
            aria-label="${t('pagination.next')}"
            type="button"
          >
            &#8250;
          </button>
        </div>
      </nav>
    `;
  },
};

component<BqPaginationProps>('bq-pagination', definition);
