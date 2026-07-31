/**
 * Data table component.
 * @element bq-table
 * @prop {string}  columns  - JSON array of { key, label, sortable? }
 * @prop {string}  rows     - JSON array of row objects
 * @prop {string}  caption  - Accessible table caption
 * @prop {string}  sort-key
 * @prop {string}  sort-dir - asc | desc
 * @prop {boolean} striped
 * @prop {boolean} bordered
 * @prop {boolean} hover
 * @prop {boolean} loading
 * @fires bq-sort - { key: string, dir: string }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release } from '../../utils/component.js';
import { iconCss } from '../../utils/icons.js';
import { baseStyles, focusRing, reset } from '../../utils/styles.js';

type ColDef = { key: string; label: string; sortable?: boolean };
type BqTableProps = {
  columns: string;
  rows: string;
  caption: string;
  'sort-key': string;
  'sort-dir': string;
  striped: boolean;
  bordered: boolean;
  hover: boolean;
  loading: boolean;
};

const definition: ComponentDefinition<BqTableProps> = {
  props: {
    columns: { type: String, default: '[]' },
    rows: { type: String, default: '[]' },
    caption: { type: String, default: '' },
    'sort-key': { type: String, default: '' },
    'sort-dir': { type: String, default: 'asc' },
    striped: { type: Boolean, default: false },
    bordered: { type: Boolean, default: false },
    hover: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  sanitize: { allowAttributes: ['scope', 'colspan'] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${focusRing}
    ${iconCss('chevron-up', 'chevron-down', 'chevrons-up-down')}
    :host { display: block; overflow-x: auto; }
    table {
      inline-size: 100%; border-collapse: collapse;
      font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-sm,0.875rem);
      background: var(--bq-bg-base,#fff);
    }
    :host([bordered]) table { border: 1px solid var(--bq-border-base,#e2e8f0); border-radius: var(--bq-radius-lg,0.5rem); }
    th, td {
      padding: 0.75rem 1rem; text-align: start;
      border-block-end: 1px solid var(--bq-border-base,#e2e8f0);
    }
    caption {
      caption-side: top; text-align: start;
      font-size: var(--bq-font-size-sm,0.875rem);
      color: var(--bq-text-muted,#475569);
      padding: 0.5rem 1rem; font-family: var(--bq-font-family-sans);
    }
    :host([bordered]) th, :host([bordered]) td { border: 1px solid var(--bq-border-base,#e2e8f0); }
    th {
      background: var(--bq-bg-subtle,#f8fafc);
      font-weight: var(--bq-font-weight-semibold,600);
      color: var(--bq-text-base,#0f172a);
      white-space: nowrap;
      /* A sticky header is what makes a long table readable, and it costs
         nothing for a short one. */
      position: sticky; inset-block-start: 0; z-index: var(--bq-z-raised,10);
    }
    tbody tr:last-child td { border-block-end: none; }
    td { color: var(--bq-text-muted,#475569); }
    .sortable { cursor: pointer; user-select: none; -webkit-user-select: none; }
    .sortable:hover { background: var(--bq-bg-emphasis,#e2e8f0); }
    .th-inner { display: inline-flex; align-items: center; gap: 0.375rem; }
    .sort-icon {
      --bq-icon-size: 0.875rem;
      opacity: 0.35;
      transition: opacity var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .sortable:hover .sort-icon { opacity: 0.7; }
    .sort-icon[data-active="true"] { opacity: 1; color: var(--bq-color-primary-600,#2563eb); }
    :host([striped]) tbody tr:nth-child(even) td { background: var(--bq-bg-subtle,#f8fafc); }
    :host([hover]) tbody tr:hover td { background: var(--bq-bg-muted,#f1f5f9); }
    .empty-row td { text-align: center; color: var(--bq-text-subtle,#94a3b8); padding: 2rem; }
    .loading-overlay { text-align: center; padding: 2rem; color: var(--bq-text-muted,#475569); }
  `,
  connected() {
    const self = host(this);
    const sortHandler = (th: HTMLElement) => {
      const key = th.getAttribute('data-sort-key') ?? '';
      const curDir = self.getAttribute('sort-dir') ?? 'asc';
      const curKey = self.getAttribute('sort-key') ?? '';
      const newDir = key === curKey && curDir === 'asc' ? 'desc' : 'asc';
      self.setAttribute('sort-key', key);
      self.setAttribute('sort-dir', newDir);
      self.dispatchEvent(
        new CustomEvent('bq-sort', {
          detail: { key, dir: newDir },
          bubbles: true,
          composed: true,
        })
      );
    };
    const handler = (e: Event) => {
      const th = (e.target as Element).closest(
        'th.sortable'
      ) as HTMLElement | null;
      if (!th) return;
      sortHandler(th);
    };
    const keyHandler = (e: Event) => {
      const ke = e as KeyboardEvent;
      const th = (ke.target as Element).closest(
        'th.sortable'
      ) as HTMLElement | null;
      if (!th) return;
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
      sortHandler(th);
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
    let cols: ColDef[] = [];
    let rows: Record<string, unknown>[] = [];
    try {
      cols = JSON.parse(props.columns) as ColDef[];
    } catch {
      cols = [];
    }
    try {
      rows = JSON.parse(props.rows) as Record<string, unknown>[];
    } catch {
      rows = [];
    }
    const sortKey = props['sort-key'];
    const sortDir = props['sort-dir'];
    const theads = cols
      .map((col) => {
        const isSorted = col.key === sortKey;
        // Unsorted columns show a neutral up/down pair, so a sortable column
        // advertises itself without claiming a direction it does not have.
        const sortIconName = !isSorted
          ? 'chevrons-up-down'
          : sortDir === 'desc'
            ? 'chevron-down'
            : 'chevron-up';
        const sortIcon = col.sortable
          ? `<span class="icon sort-icon" data-icon="${sortIconName}" data-active="${isSorted ? 'true' : 'false'}" aria-hidden="true"></span>`
          : '';
        const sortLabel = col.sortable
          ? isSorted
            ? sortDir === 'asc'
              ? t('table.sortDescending')
              : t('table.sortAscending')
            : t('table.sortAscending')
          : '';
        const sortableAttrs = col.sortable
          ? `class="sortable" data-sort-key="${escapeHtml(col.key)}" tabindex="0" aria-sort="${isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}" title="${escapeHtml(sortLabel)}"`
          : '';
        return `<th part="th" scope="col" role="columnheader" ${sortableAttrs}><span class="th-inner">${escapeHtml(col.label)}${sortIcon}</span></th>`;
      })
      .join('');
    const tbodies = props.loading
      ? `<tr><td colspan="${cols.length}" class="loading-overlay">${escapeHtml(t('table.loading'))}</td></tr>`
      : rows.length === 0
        ? `<tr class="empty-row"><td colspan="${cols.length}">${escapeHtml(t('table.noData'))}</td></tr>`
        : rows
            .map(
              (row) =>
                `<tr part="row">${cols.map((col) => `<td part="td">${escapeHtml(String(row[col.key] ?? ''))}</td>`).join('')}</tr>`
            )
            .join('');
    return html`
      <table part="table">
        ${props.caption
          ? `<caption part="caption">${escapeHtml(props.caption)}</caption>`
          : ''}
        <thead part="thead">
          <tr part="header-row">
            ${theads}
          </tr>
        </thead>
        <tbody part="tbody">
          ${tbodies}
        </tbody>
      </table>
    `;
  },
};

component<BqTableProps>('bq-table', definition);
