import { getBaseStyles } from '../../utils/styles.js';
import { dispatch, uniqueId } from '../../utils/dom.js';
import { t } from '../../i18n/index.js';

/**
 * Tabs component.
 * @element bq-tabs
 *
 * @prop {string} active-tab - ID of the active tab
 * @prop {string} variant    - default | pills | underline
 *
 * Tabs are passed as <bq-tab> child elements (light DOM).
 * Each <bq-tab> should have: id, label, and optionally disabled.
 * Tab panels are any element with a `data-tab` attribute matching the tab id.
 *
 * @fires bq-tab-change - { tabId }
 */
export class BqTabs extends HTMLElement {
  static get observedAttributes() { return ['active-tab', 'variant']; }
  private _shadow: ShadowRoot;
  private _id: string;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._id = uniqueId('bq-tabs');
  }

  connectedCallback() {
    this._render();
    this._setupObserver();
  }

  disconnectedCallback() {
    this._observer?.disconnect();
  }

  private _observer?: MutationObserver;

  private _setupObserver() {
    this._observer = new MutationObserver(() => this._render());
    this._observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['label','disabled','id'] });
  }

  attributeChangedCallback() { this._render(); }

  private _getTabItems(): Array<{ id: string; label: string; disabled: boolean }> {
    return Array.from(this.querySelectorAll('[data-tab-item]')).map((el) => ({
      id: el.getAttribute('id') ?? el.getAttribute('data-tab-item') ?? '',
      label: el.getAttribute('label') ?? el.textContent?.trim() ?? '',
      disabled: el.hasAttribute('disabled'),
    }));
  }

  private _render() {
    const activeTab = this.getAttribute('active-tab');
    const variant = this.getAttribute('variant') ?? 'default';
    const tabs = this._getTabItems();
    const active = activeTab ?? tabs[0]?.id ?? '';

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .tabs { display: flex; flex-direction: column; }
      .tablist {
        display: flex; gap: 0.25rem;
        ${variant === 'underline' ? 'border-bottom: 2px solid var(--bq-border-base,#e2e8f0);' : ''}
        ${variant === 'default' ? 'background: var(--bq-bg-subtle,#f8fafc); border-radius: var(--bq-radius-lg); padding: 0.25rem;' : ''}
      }
      .tab {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 0.375rem;
        padding: ${variant === 'underline' ? '0.625rem 1rem' : '0.375rem 0.875rem'};
        font-size: var(--bq-font-size-sm,0.875rem);
        font-weight: var(--bq-font-weight-medium,500);
        font-family: var(--bq-font-family-sans);
        border-radius: ${variant === 'underline' ? '0' : 'var(--bq-radius-md,0.375rem)'};
        cursor: pointer; background: none; border: none;
        color: var(--bq-text-muted,#475569);
        transition: all var(--bq-duration-fast) var(--bq-easing-standard);
        white-space: nowrap;
        ${variant === 'underline' ? 'border-bottom: 2px solid transparent; margin-bottom: -2px;' : ''}
        position: relative;
      }
      .tab:hover:not([disabled]):not(.tab--active) {
        color: var(--bq-text-base,#0f172a);
        ${variant === 'default' ? 'background: var(--bq-bg-emphasis,#e2e8f0);' : ''}
      }
      .tab--active {
        color: var(--bq-color-primary-600,#2563eb);
        ${variant === 'default' ? 'background: var(--bq-bg-base,#fff); box-shadow: var(--bq-shadow-sm);' : ''}
        ${variant === 'underline' ? 'border-bottom-color: var(--bq-color-primary-600,#2563eb);' : ''}
        ${variant === 'pills' ? 'background: var(--bq-color-primary-600,#2563eb); color: #fff;' : ''}
      }
      .tab[disabled] { opacity: 0.45; cursor: not-allowed; }
      .tab:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }

      .panels { padding-top: var(--bq-space-4,1rem); }
    `;

    const tabsHtml = tabs.map((tab) => `
      <button
        part="tab"
        class="tab ${tab.id === active ? 'tab--active' : ''}"
        role="tab"
        id="${this._id}-tab-${tab.id}"
        aria-selected="${tab.id === active}"
        aria-controls="${this._id}-panel-${tab.id}"
        tabindex="${tab.id === active ? '0' : '-1'}"
        data-tab-id="${tab.id}"
        ${tab.disabled ? 'disabled aria-disabled="true"' : ''}
      >${tab.label}</button>
    `).join('');

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div class="tabs" part="tabs">
        <div
          class="tablist"
          part="tablist"
          role="tablist"
          aria-label="${t('tabs.listLabel')}"
        >${tabsHtml}</div>
        <div class="panels" part="panels">
          <slot></slot>
        </div>
      </div>
    `;

    // Update slot visibility
    tabs.forEach((tab) => {
      const panel = this.querySelector(`[data-tab="${tab.id}"]`);
      if (panel instanceof HTMLElement) {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('id', `${this._id}-panel-${tab.id}`);
        panel.setAttribute('aria-labelledby', `${this._id}-tab-${tab.id}`);
        panel.hidden = tab.id !== active;
        panel.setAttribute('tabindex', '0');
      }
    });

    // Keyboard + click
    const tablist = this._shadow.querySelector('.tablist');
    tablist?.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest('[data-tab-id]') as HTMLElement | null;
      if (!btn || btn.hasAttribute('disabled')) return;
      const tabId = btn.getAttribute('data-tab-id') ?? '';
      this.setAttribute('active-tab', tabId);
      dispatch(this, 'bq-tab-change', { tabId });
    });

    tablist?.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      const btns = Array.from(tablist.querySelectorAll<HTMLElement>('.tab:not([disabled])'));
      const idx = btns.indexOf(document.activeElement as HTMLElement);
      let next = -1;
      if (ke.key === 'ArrowRight') next = (idx + 1) % btns.length;
      if (ke.key === 'ArrowLeft') next = (idx - 1 + btns.length) % btns.length;
      if (ke.key === 'Home') next = 0;
      if (ke.key === 'End') next = btns.length - 1;
      if (next >= 0) { ke.preventDefault(); btns[next]?.focus(); btns[next]?.click(); }
    });
  }
}

export function registerBqTabs(prefix = 'bq'): string {
  const tag = `${prefix}-tabs`;
  if (!customElements.get(tag)) customElements.define(tag, BqTabs);
  return tag;
}
