/**
 * Dropdown menu component — a trigger-activated overlay for actions or navigation.
 * @element bq-dropdown-menu
 * @prop {string}  label      - Accessible label for the dropdown menu
 * @prop {string}  placement  - bottom-start | bottom-end | top-start | top-end
 * @prop {boolean} open       - Whether the menu is open
 * @prop {boolean} disabled
 * @slot trigger  - Element that opens the menu (button, link, etc.)
 * @slot          - Menu items (typically <button> or <a> elements)
 * @fires bq-open
 * @fires bq-close
 * @fires bq-select - { value: string } — emitted when a menu item is activated
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { uniqueId } from '../../utils/dom.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqDropdownMenuProps = {
  label: string;
  placement: string;
  open: boolean;
  disabled: boolean;
};
type BqDropdownMenuState = { uid: string };

const definition: ComponentDefinition<
  BqDropdownMenuProps,
  BqDropdownMenuState
> = {
  props: {
    label: { type: String, default: '' },
    placement: { type: String, default: 'bottom-start' },
    open: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  state: {
    uid: '',
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: inline-block; position: relative; }
    .trigger-wrap { display: inline-flex; }
    .menu {
      display: none; position: absolute; z-index: var(--bq-z-dropdown,100);
      min-width: 10rem; max-height: 20rem; overflow-y: auto;
      background: var(--bq-bg-base,#fff); border: 1px solid var(--bq-border-base,#e2e8f0);
      border-radius: var(--bq-radius-lg,0.5rem); box-shadow: var(--bq-shadow-lg);
      padding: var(--bq-space-1,0.25rem) 0; font-family: var(--bq-font-family-sans);
      animation: menuFadeIn var(--bq-duration-fast,150ms) var(--bq-easing-decelerate);
    }
    :host([open]) .menu { display: block; }
    @keyframes menuFadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
    :host([placement="bottom-start"]) .menu { top: 100%; left: 0; margin-top: 0.25rem; }
    :host([placement="bottom-end"]) .menu { top: 100%; right: 0; margin-top: 0.25rem; }
    :host([placement="top-start"]) .menu { bottom: 100%; left: 0; margin-bottom: 0.25rem; }
    :host([placement="top-end"]) .menu { bottom: 100%; right: 0; margin-bottom: 0.25rem; }
    :host(:not([placement])) .menu { top: 100%; left: 0; margin-top: 0.25rem; }
    ::slotted(button),
    ::slotted(a) {
      display: flex; align-items: center; gap: 0.5rem; width: 100%;
      padding: 0.5rem 0.875rem; border: none; background: none;
      color: var(--bq-text-base,#0f172a); font-size: var(--bq-font-size-sm,0.875rem);
      font-family: var(--bq-font-family-sans); text-align: left; cursor: pointer;
      text-decoration: none; white-space: nowrap;
      transition: background var(--bq-duration-fast) var(--bq-easing-standard);
    }
    ::slotted(button:hover),
    ::slotted(a:hover) { background: var(--bq-bg-subtle,#f8fafc); }
    ::slotted(button:focus-visible),
    ::slotted(a:focus-visible) { outline: none; background: var(--bq-bg-muted,#f1f5f9); box-shadow: inset 0 0 0 2px var(--bq-border-focus,#2563eb); }
    ::slotted(button[disabled]),
    ::slotted(a[disabled]),
    ::slotted(a[aria-disabled="true"]) { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
    ::slotted(hr) { border: none; border-top: 1px solid var(--bq-border-base,#e2e8f0); margin: 0.25rem 0; }
    @media (prefers-reduced-motion: reduce) {
      .menu { animation: none; }
      ::slotted(button),
      ::slotted(a) { transition: none; }
    }
  `,
  connected() {
    type BQEl = HTMLElement & {
      setState(k: 'uid', v: string): void;
      getState<T>(k: string): T;
    };
    const self = this as unknown as BQEl;
    if (!self.getState<string>('uid'))
      self.setState('uid', uniqueId('bq-dm'));

    const getTrigger = (): HTMLElement | null =>
      self.querySelector('[slot="trigger"]') as HTMLElement | null;

    const isDisabledItem = (el: HTMLElement): boolean =>
      el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';

    const getMenuRoots = (): HTMLElement[] => {
      const slot = self.shadowRoot?.querySelector(
        'slot:not([name])'
      ) as HTMLSlotElement | null;
      if (!slot) return [];
      return slot.assignedElements({ flatten: true }).filter(
        (el): el is HTMLElement => el instanceof HTMLElement
      );
    };

    const syncTriggerA11y = () => {
      const trigger = getTrigger();
      if (!trigger) return;
      const uid = self.getState<string>('uid') || 'bq-dm';
      trigger.setAttribute('aria-haspopup', 'menu');
      trigger.setAttribute(
        'aria-expanded',
        self.hasAttribute('open') ? 'true' : 'false'
      );
      trigger.setAttribute('aria-controls', `${uid}-menu`);
    };

    const syncMenuItemRoles = () => {
      getMenuRoots().forEach((el) => {
        if (el.tagName === 'HR') {
          el.setAttribute('role', 'separator');
          return;
        }
        if (el.tagName === 'BUTTON' || el.tagName === 'A') {
          if (!el.hasAttribute('role')) el.setAttribute('role', 'menuitem');
          if (el.tagName === 'BUTTON' && !el.hasAttribute('type')) {
            el.setAttribute('type', 'button');
          }
          if (isDisabledItem(el)) {
            if (el.tagName === 'A') el.setAttribute('aria-disabled', 'true');
            el.setAttribute('tabindex', '-1');
            return;
          }
          if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
        }
      });
    };

    const open = () => {
      if (self.hasAttribute('disabled') || self.hasAttribute('open')) return;
      self.setAttribute('open', '');
      syncTriggerA11y();
      self.dispatchEvent(
        new CustomEvent('bq-open', { bubbles: true, composed: true })
      );
      // Focus first item
      requestAnimationFrame(() => {
        if (!self.hasAttribute('open')) return;
        const items = getMenuItems();
        if (items.length > 0) items[0]!.focus();
      });
    };
    const close = ({ restoreFocus = false }: { restoreFocus?: boolean } = {}) => {
      if (!self.hasAttribute('open')) return;
      self.removeAttribute('open');
      syncTriggerA11y();
      self.dispatchEvent(
        new CustomEvent('bq-close', { bubbles: true, composed: true })
      );
      if (restoreFocus) getTrigger()?.focus();
    };
    const toggle = () => {
      if (self.hasAttribute('open')) close();
      else open();
    };

    const getMenuItems = (): HTMLElement[] => {
      return getMenuRoots().filter(
        (el): el is HTMLElement =>
          (el.tagName === 'BUTTON' || el.tagName === 'A') &&
          !isDisabledItem(el)
      );
    };

    // Trigger click
    const triggerHandler = (e: Event) => {
      const triggerSlot = self.shadowRoot?.querySelector('slot[name="trigger"]') as HTMLSlotElement | null;
      if (!triggerSlot) return;
      const assigned = triggerSlot.assignedElements({ flatten: true });
      const clickedTrigger = assigned.some(
        (el) => el === e.target || el.contains(e.target as Node)
      );
      if (clickedTrigger) {
        e.preventDefault();
        toggle();
      }
    };

    // Menu item click
    const menuClickHandler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const trigger = getTrigger();
      if (trigger && (target === trigger || trigger.contains(target))) return;

      const item = target.closest('button, a') as HTMLElement | null;
      if (!item) return;

      if (isDisabledItem(item)) {
        e.preventDefault();
        return;
      }

      const isInMenu = getMenuRoots().some(
        (el) => el === item || el.contains(item)
      );
      if (!isInMenu) return;

      const value =
        item.getAttribute('data-value') || item.textContent?.trim() || '';
      self.dispatchEvent(
        new CustomEvent('bq-select', {
          detail: { value },
          bubbles: true,
          composed: true,
        })
      );
      close({ restoreFocus: true });
    };

    // Keyboard navigation
    const keyHandler = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (self.hasAttribute('disabled')) return;

      // On trigger: open on ArrowDown/Enter/Space
      const triggerSlot = self.shadowRoot?.querySelector('slot[name="trigger"]') as HTMLSlotElement | null;
      const triggerEls = triggerSlot?.assignedElements({ flatten: true }) ?? [];
      const isOnTrigger = triggerEls.some(
        (el) => el === ke.target || el.contains(ke.target as Node)
      );

      if (isOnTrigger) {
        if (ke.key === 'ArrowDown' || ke.key === 'Enter' || ke.key === ' ') {
          ke.preventDefault();
          open();
          return;
        }
        if (ke.key === 'Escape') {
          close({ restoreFocus: true });
          return;
        }
      }

      // Inside menu
      if (!self.hasAttribute('open')) return;
      const items = getMenuItems();
      const currentItem = (ke.target as HTMLElement | null)?.closest(
        'button, a'
      ) as HTMLElement | null;
      const currentIndex = currentItem ? items.indexOf(currentItem) : -1;

      switch (ke.key) {
        case 'ArrowDown': {
          ke.preventDefault();
          const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          items[next]?.focus();
          break;
        }
        case 'ArrowUp': {
          ke.preventDefault();
          const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          items[prev]?.focus();
          break;
        }
        case 'Home': {
          ke.preventDefault();
          items[0]?.focus();
          break;
        }
        case 'End': {
          ke.preventDefault();
          items[items.length - 1]?.focus();
          break;
        }
        case 'Enter':
        case ' ': {
          if (currentIndex === -1) break;
          ke.preventDefault();
          currentItem?.click();
          break;
        }
        case 'Escape':
          close({ restoreFocus: true });
          break;
        case 'Tab': {
          close();
          break;
        }
      }
    };

    // Click outside
    const outsideHandler = (e: Event) => {
      if (!self.hasAttribute('open')) return;
      if (!self.contains(e.target as Node)) close({ restoreFocus: true });
    };
    let outsideListening = false;
    const syncOutsideListener = () => {
      if (self.hasAttribute('open')) {
        if (!outsideListening) {
          document.addEventListener('click', outsideHandler);
          outsideListening = true;
        }
        return;
      }
      if (outsideListening) {
        document.removeEventListener('click', outsideHandler);
        outsideListening = false;
      }
    };

    const slotChangeHandler = () => {
      syncTriggerA11y();
      syncMenuItemRoles();
    };

    const s = self as unknown as Record<string, unknown>;
    s['_triggerHandler'] = triggerHandler;
    s['_menuClickHandler'] = menuClickHandler;
    s['_keyHandler'] = keyHandler;
    s['_outsideHandler'] = outsideHandler;
    s['_syncOutsideListener'] = syncOutsideListener;
    s['_slotChangeHandler'] = slotChangeHandler;

    self.addEventListener('click', triggerHandler);
    self.addEventListener('click', menuClickHandler);
    self.addEventListener('keydown', keyHandler);
    self.shadowRoot
      ?.querySelector('slot[name="trigger"]')
      ?.addEventListener('slotchange', slotChangeHandler);
    self.shadowRoot
      ?.querySelector('slot:not([name])')
      ?.addEventListener('slotchange', slotChangeHandler);

    requestAnimationFrame(() => {
      syncTriggerA11y();
      syncMenuItemRoles();
      syncOutsideListener();
    });
  },
  disconnected() {
    const s = this as unknown as Record<string, unknown>;
    const triggerHandler = s['_triggerHandler'] as EventListener | undefined;
    const menuClickHandler = s['_menuClickHandler'] as EventListener | undefined;
    const keyHandler = s['_keyHandler'] as EventListener | undefined;
    const outsideHandler = s['_outsideHandler'] as EventListener | undefined;
    const slotChangeHandler = s['_slotChangeHandler'] as
      | EventListener
      | undefined;
    if (triggerHandler) this.removeEventListener('click', triggerHandler);
    if (menuClickHandler) this.removeEventListener('click', menuClickHandler);
    if (keyHandler) this.removeEventListener('keydown', keyHandler);
    if (outsideHandler) document.removeEventListener('click', outsideHandler);
    if (slotChangeHandler) {
      this.shadowRoot
        ?.querySelector('slot[name="trigger"]')
        ?.removeEventListener('slotchange', slotChangeHandler);
      this.shadowRoot
        ?.querySelector('slot:not([name])')
        ?.removeEventListener('slotchange', slotChangeHandler);
    }
  },
  updated() {
    const s = this as unknown as Record<string, unknown>;
    const syncOutsideListener = s['_syncOutsideListener'] as (() => void) | undefined;
    syncOutsideListener?.();
    const trigger = this.querySelector('[slot="trigger"]') as HTMLElement | null;
    if (trigger)
      trigger.setAttribute(
        'aria-expanded',
        this.hasAttribute('open') ? 'true' : 'false'
      );
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-dm';
    const menuId = `${uid}-menu`;
    return html`
      <div class="trigger-wrap" part="trigger">
        <slot name="trigger"></slot>
      </div>
      <div
        class="menu"
        id="${menuId}"
        part="menu"
        role="menu"
        ${props.label ? `aria-label="${escapeHtml(props.label)}"` : ''}
      >
        <slot></slot>
      </div>
    `;
  },
};

component<BqDropdownMenuProps, BqDropdownMenuState>(
  'bq-dropdown-menu',
  definition
);
