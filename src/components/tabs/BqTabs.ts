/**
 * Tabs navigation component.
 * @element bq-tabs
 * @prop {string} active-tab - ID of active tab
 * @prop {string} variant    - default | pills | underline
 * Tabs: add elements with [data-tab-item] and id attribute; panels: [data-tab="<id>"]
 * @fires bq-tab-change - { tabId: string }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, release, store } from '../../utils/component.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqTabsProps = { 'active-tab': string; variant: string };

function getAriaIdPart(tabId: string): string | null {
  const trimmed = tabId.trim();
  return trimmed ? encodeURIComponent(trimmed) : null;
}

function getTabButtonId(tabId: string): string | null {
  const ariaIdPart = getAriaIdPart(tabId);
  return ariaIdPart ? `tab-${ariaIdPart}` : null;
}

function getPanelId(tabId: string): string | null {
  const ariaIdPart = getAriaIdPart(tabId);
  return ariaIdPart ? `panel-${ariaIdPart}` : null;
}

/**
 * Writes an attribute only when the value would actually change.
 *
 * `setAttribute` produces a mutation record even when the value is identical,
 * and this component writes `id` onto its light-DOM panels from `updated()`
 * while a MutationObserver watches the subtree for `id` — so an unconditional
 * write re-entered its own observer, re-rendered, wrote again, and hung the
 * main thread outright. Any page using the documented panel markup froze on
 * load.
 */
function setAttr(el: Element, name: string, value: string): void {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}

function removeAttr(el: Element, name: string): void {
  if (el.hasAttribute(name)) el.removeAttribute(name);
}

/** The subtree observer, so `updated()` can pause its own writes. */
const tabsStore = (owner: object) =>
  store<{ observer?: MutationObserver | null }>(owner, () => ({}));

const definition: ComponentDefinition<BqTabsProps> = {
  props: {
    'active-tab': { type: String, default: '' },
    variant: { type: String, default: 'default' },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: block; }
    .tabs { display: flex; flex-direction: column; }
    .tablist { display: flex; gap: 0.25rem; }
    .tablist[data-variant="default"] { background: var(--bq-bg-subtle,#f8fafc); border-radius: var(--bq-radius-lg); padding: 0.25rem; }
    .tablist[data-variant="underline"] { border-block-end: 2px solid var(--bq-border-base,#e2e8f0); }
    .tab {
      display: inline-flex; align-items: center; justify-content: center; gap: 0.375rem;
      font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500);
      font-family: var(--bq-font-family-sans); cursor: pointer; background: none; border: none;
      color: var(--bq-text-muted,#475569); white-space: nowrap;
      transition: color var(--bq-duration-fast) var(--bq-easing-standard),
                  background-color var(--bq-duration-fast) var(--bq-easing-standard),
                  border-color var(--bq-duration-fast) var(--bq-easing-standard),
                  box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .tab[data-variant="default"]  { padding: 0.375rem 0.875rem; border-radius: var(--bq-radius-md,0.375rem); }
    .tab[data-variant="underline"] { padding: 0.625rem 1rem; border-block-end: 2px solid transparent; margin-block-end: -2px; border-radius: 0; }
    .tab[data-variant="pills"]    { padding: 0.375rem 0.875rem; border-radius: var(--bq-radius-full,9999px); }
    .tab:hover:not([disabled]):not([aria-selected="true"]) { color: var(--bq-text-base,#0f172a); }
    .tab[data-variant="default"]:hover:not([disabled]):not([aria-selected="true"]) { background: var(--bq-bg-emphasis,#e2e8f0); }
    .tab[aria-selected="true"][data-variant="default"]   { background: var(--bq-surface-raised,#fff); box-shadow: var(--bq-shadow-sm); color: var(--bq-color-primary-600,#2563eb); }
    .tab[aria-selected="true"][data-variant="underline"] { border-bottom-color: var(--bq-color-primary-600,#2563eb); color: var(--bq-color-primary-600,#2563eb); }
    .tab[aria-selected="true"][data-variant="pills"]     { background: var(--bq-color-primary-600,#2563eb); color: var(--bq-text-on-primary,#fff); }
    .tab[disabled] { opacity: 0.45; cursor: not-allowed; }
    .tab:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .panels { padding-block-start: var(--bq-space-4,1rem); }
    @media (prefers-reduced-motion: reduce) {
      .tab { transition: none; }
    }
  `,
  connected() {
    type BQEl = HTMLElement & {
      setState(k: string, v: unknown): void;
      getState<T>(k: string): T;
    };
    const self = this as unknown as BQEl &
      HTMLElement &
      Record<string, unknown>;
    const scope = bind(self);

    const readTabs = () => {
      const items = Array.from(
        (self as HTMLElement).querySelectorAll('[data-tab-item]')
      ).map((el) => ({
        id: el.getAttribute('id') ?? el.getAttribute('data-tab-item') ?? '',
        label: el.getAttribute('label') ?? el.textContent?.trim() ?? '',
        disabled: el.hasAttribute('disabled'),
      }));
      self.setState('tabs', items);
    };
    readTabs();

    // MutationObserver to re-render when child items change
    const obs = new MutationObserver(() => {
      // Records queued before `updated()` paused the observer still arrive
      // here; ignore them rather than re-entering the render.
      if (!tabsStore(self).observer) return;
      readTabs();
      // Trigger re-render by touching an attribute
      const cur = (self as HTMLElement).getAttribute('active-tab') ?? '';
      (self as HTMLElement).setAttribute('active-tab', cur);
    });
    obs.observe(self as HTMLElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['label', 'disabled', 'id'],
    });
    tabsStore(self).observer = obs;
    scope.add(() => {
      tabsStore(self).observer = null;
      obs.disconnect();
    });

    const clickH = (e: Event) => {
      const btn = (e.target as Element).closest(
        '[data-tab-id]'
      ) as HTMLElement | null;
      if (!btn || btn.hasAttribute('disabled')) return;
      const tabId = btn.getAttribute('data-tab-id') ?? '';
      (self as HTMLElement).setAttribute('active-tab', tabId);
      (self as HTMLElement).dispatchEvent(
        new CustomEvent('bq-tab-change', {
          detail: { tabId },
          bubbles: true,
          composed: true,
        })
      );
      updatePanels(tabId);
    };
    const keyH = (e: Event) => {
      const ke = e as KeyboardEvent;
      const shadow = (self as HTMLElement).shadowRoot;
      const tablist = shadow?.querySelector('.tablist');
      if (!tablist) return;
      const btns = Array.from(
        tablist.querySelectorAll<HTMLElement>('.tab:not([disabled])')
      );
      // Use shadowRoot.activeElement — document.activeElement returns the host in shadow DOM
      const active = shadow?.activeElement as HTMLElement | null;
      const idx = btns.findIndex((b) => b === active);
      let next = -1;
      if (ke.key === 'ArrowRight') next = (idx + 1) % btns.length;
      if (ke.key === 'ArrowLeft') next = (idx - 1 + btns.length) % btns.length;
      if (ke.key === 'Home') next = 0;
      if (ke.key === 'End') next = btns.length - 1;
      if (next >= 0) {
        ke.preventDefault();
        btns[next]?.focus();
        btns[next]?.click();
      }
    };
    const updatePanels = (activeId: string) => {
      (self as HTMLElement)
        .querySelectorAll<HTMLElement>('[data-tab]')
        .forEach((panel) => {
          panel.hidden = panel.getAttribute('data-tab') !== activeId;
        });
    };
    scope.on((self as HTMLElement).shadowRoot, 'click', clickH);
    scope.on((self as HTMLElement).shadowRoot, 'keydown', keyH);
  },
  disconnected() {
    release(this);
  },
  updated() {
    // The panels live in the light DOM, so wiring them up means writing to the
    // very subtree this component observes. Pause the observer for the pass and
    // write only what changes: either guard alone is enough to break the loop,
    // and both together mean a future edit here cannot reintroduce it.
    const local = tabsStore(this);
    const observer = local.observer;
    local.observer = null;
    observer?.disconnect();

    try {
      const active = this.getAttribute('active-tab') ?? '';
      this.querySelectorAll<HTMLElement>('[data-tab]').forEach((panel) => {
        const tabId = panel.getAttribute('data-tab') ?? '';
        const isActive = tabId === active;
        const panelId = panel.id || getPanelId(tabId);
        const button = Array.from(
          this.shadowRoot?.querySelectorAll<HTMLElement>('.tab[data-tab-id]') ??
            []
        ).find((candidate) => candidate.getAttribute('data-tab-id') === tabId);
        const labelledBy = button?.id || (button ? getTabButtonId(tabId) : null);

        if (panelId) setAttr(panel, 'id', panelId);
        if (panel.hidden !== !isActive) panel.hidden = !isActive;
        setAttr(panel, 'role', 'tabpanel');
        setAttr(panel, 'tabindex', isActive ? '0' : '-1');
        if (labelledBy) setAttr(panel, 'aria-labelledby', labelledBy);
        else removeAttr(panel, 'aria-labelledby');
        setAttr(panel, 'aria-hidden', isActive ? 'false' : 'true');
        if (button) {
          if (panelId) setAttr(button, 'aria-controls', panelId);
          else removeAttr(button, 'aria-controls');
        }
      });
    } finally {
      if (observer && this.isConnected) {
        observer.observe(this, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['label', 'disabled', 'id'],
        });
        local.observer = observer;
      }
    }
  },
  render({ props, state }) {
    const items =
      (state['tabs'] as
        | Array<{ id: string; label: string; disabled: boolean }>
        | undefined) ?? [];
    const active = props['active-tab'] || items[0]?.id || '';
    const tabsHtml = items
      .map((tab) => {
        const buttonId = getTabButtonId(tab.id);
        const panelId = getPanelId(tab.id);
        return `
       <button part="tab" class="tab" data-variant="${escapeHtml(props.variant)}"
        role="tab" ${buttonId ? `id="${escapeHtml(buttonId)}"` : ''} data-tab-id="${escapeHtml(tab.id)}"
        aria-selected="${tab.id === active ? 'true' : 'false'}"
        ${panelId ? `aria-controls="${escapeHtml(panelId)}"` : ''}
        tabindex="${tab.id === active ? '0' : '-1'}"
        ${tab.disabled ? 'disabled aria-disabled="true"' : ''}
      >${escapeHtml(tab.label)}</button>
    `;
      })
      .join('');
    return html`
      <div class="tabs" part="tabs">
        <div
          class="tablist"
          part="tablist"
          role="tablist"
          aria-label="${t('tabs.listLabel')}"
          data-variant="${escapeHtml(props.variant)}"
        >
          ${tabsHtml}
        </div>
        <div class="panels" part="panels"><slot></slot></div>
      </div>
    `;
  },
};

component<BqTabsProps>('bq-tabs', definition);
