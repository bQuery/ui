import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

/**
 * Data table component.
 * @element bq-table
 *
 * Columns and rows are passed as JSON attributes for simplicity:
 * @prop {string} columns - JSON array of { key, label, sortable? }
 * @prop {string} rows    - JSON array of record objects
 * @prop {string} sort-key
 * @prop {string} sort-dir - asc | desc
 * @prop {boolean} striped
 * @prop {boolean} bordered
 * @prop {boolean} hover
 * @prop {boolean} loading
 * @fires bq-sort - { key, dir }
 */
export class BqTable extends HTMLElement {
  static get observedAttributes() { return ['columns','rows','sort-key','sort-dir','striped','bordered','hover','loading']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-table');
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _parse<T>(attr: string, fallback: T): T {
    try { return JSON.parse(this.getAttribute(attr) ?? '') as T; } catch { return fallback; }
  }

  private _render() {
    type Column = { key: string; label: string; sortable?: boolean };
    type Row = Record<string, unknown>;

    const columns: Column[] = this._parse('columns', []);
    const rows: Row[] = this._parse('rows', []);
    const sortKey = this.getAttribute('sort-key') ?? '';
    const sortDir = this.getAttribute('sort-dir') ?? 'asc';
    const striped = this.hasAttribute('striped');
    const bordered = this.hasAttribute('bordered');
    const hover = this.hasAttribute('hover');
    const loading = this.hasAttribute('loading');

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; overflow: auto; }

      .table-wrap { overflow-x: auto; }
      table {
        width: 100%; border-collapse: collapse;
        font-family: var(--bq-font-family-sans);
        font-size: var(--bq-font-size-sm,0.875rem);
        color: var(--bq-text-base,#0f172a);
        ${bordered ? 'border: 1.5px solid var(--bq-border-base,#e2e8f0);' : ''}
      }
      thead { background: var(--bq-bg-subtle,#f8fafc); }
      th {
        padding: 0.75rem 1rem; text-align: left;
        font-weight: var(--bq-font-weight-semibold,600);
        color: var(--bq-text-muted,#475569);
        border-bottom: 2px solid var(--bq-border-emphasis,#cbd5e1);
        white-space: nowrap;
      }
      th.sortable { cursor: pointer; user-select: none; }
      th.sortable:hover { color: var(--bq-color-primary-600,#2563eb); }
      th:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
      .sort-icon { margin-left: 0.25rem; opacity: 0.5; }
      .sort-icon.active { opacity: 1; color: var(--bq-color-primary-600,#2563eb); }

      td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--bq-border-base,#e2e8f0);
        ${bordered ? 'border-right: 1px solid var(--bq-border-base,#e2e8f0);' : ''}
      }
      ${striped ? 'tbody tr:nth-child(even) { background: var(--bq-bg-subtle,#f8fafc); }' : ''}
      ${hover ? 'tbody tr:hover { background: var(--bq-color-primary-50,#eff6ff); }' : ''}

      .empty, .loading {
        text-align: center; padding: 3rem;
        color: var(--bq-text-muted,#475569);
      }
      .spinner { display: inline-block; width: 1.5rem; height: 1.5rem; border: 3px solid var(--bq-color-secondary-200,#e2e8f0); border-top-color: var(--bq-color-primary-600,#2563eb); border-radius: 50%; animation: spin 0.7s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;

    const headerCells = columns.map((col) => {
      const isSorted = col.key === sortKey;
      const icon = isSorted ? (sortDir === 'asc' ? '▲' : '▼') : '↕';
      return `<th
        part="th"
        class="${col.sortable ? 'sortable' : ''}"
        ${col.sortable ? `tabindex="0" data-sort-key="${col.key}" aria-sort="${isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}"` : ''}
      >${col.label}${col.sortable ? `<span class="sort-icon ${isSorted ? 'active' : ''}" aria-hidden="true">${icon}</span>` : ''}</th>`;
    }).join('');

    let bodyContent = '';
    if (loading) {
      bodyContent = `<tr><td colspan="${columns.length}" class="loading"><div class="spinner" aria-hidden="true"></div> ${t('table.loading')}</td></tr>`;
    } else if (rows.length === 0) {
      bodyContent = `<tr><td colspan="${columns.length}" class="empty">${t('table.noData')}</td></tr>`;
    } else {
      bodyContent = rows.map((row) => `
        <tr part="row">
          ${columns.map((col) => `<td part="td">${String(row[col.key] ?? '')}</td>`).join('')}
        </tr>
      `).join('');
    }

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div class="table-wrap" part="table-wrap">
        <table part="table" role="table" id="${this._id}">
          <thead part="thead">
            <tr part="header-row">${headerCells}</tr>
          </thead>
          <tbody part="tbody">${bodyContent}</tbody>
        </table>
      </div>
    `;

    this._shadow.querySelectorAll<HTMLElement>('[data-sort-key]').forEach((th) => {
      const handler = () => {
        const key = th.getAttribute('data-sort-key') ?? '';
        const dir = key === sortKey && sortDir === 'asc' ? 'desc' : 'asc';
        this.setAttribute('sort-key', key);
        this.setAttribute('sort-dir', dir);
        dispatch(this, 'bq-sort', { key, dir });
      };
      th.addEventListener('click', handler);
      th.addEventListener('keydown', (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key === 'Enter' || ke.key === ' ') { ke.preventDefault(); handler(); }
      });
    });
  }
}

export function registerBqTable(prefix = 'bq'): string {
  const tag = `${prefix}-table`;
  if (!customElements.get(tag)) customElements.define(tag, BqTable);
  return tag;
}
