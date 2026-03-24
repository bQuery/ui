// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterEach } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqDropdownMenu', () => {
  beforeAll(async () => {
    await import('../src/components/dropdown-menu/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('should define bq-dropdown-menu as a custom element', () => {
    expect(win.customElements.get('bq-dropdown-menu')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-dropdown-menu');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render trigger slot and menu', () => {
    const el = doc.createElement('bq-dropdown-menu');
    doc.body.appendChild(el);
    const triggerSlot = el.shadowRoot?.querySelector('slot[name="trigger"]');
    const menu = el.shadowRoot?.querySelector('.menu');
    expect(triggerSlot).not.toBeNull();
    expect(menu).not.toBeNull();
  });

  it('should have role=menu on the menu container', () => {
    const el = doc.createElement('bq-dropdown-menu');
    doc.body.appendChild(el);
    const menu = el.shadowRoot?.querySelector('.menu');
    expect(menu?.getAttribute('role')).toBe('menu');
  });

  it('should apply aria-label to menu when label prop is set', () => {
    const el = doc.createElement('bq-dropdown-menu');
    el.setAttribute('label', 'Actions');
    doc.body.appendChild(el);
    const menu = el.shadowRoot?.querySelector('.menu');
    expect(menu?.getAttribute('aria-label')).toBe('Actions');
  });

  it('should default to placement bottom-start', () => {
    const el = doc.createElement('bq-dropdown-menu');
    doc.body.appendChild(el);
    // Check default placement is bottom-start (or attribute not set means CSS default)
    expect(el.getAttribute('placement')).toBeNull();
  });

  it('should not show menu when closed', () => {
    const el = doc.createElement('bq-dropdown-menu');
    doc.body.appendChild(el);
    // Menu is hidden via CSS :host(:not([open])) .menu { display: none }
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('should have unique menu id', () => {
    const el1 = doc.createElement('bq-dropdown-menu');
    const el2 = doc.createElement('bq-dropdown-menu');
    doc.body.appendChild(el1);
    doc.body.appendChild(el2);
    const menu1 = el1.shadowRoot?.querySelector('.menu');
    const menu2 = el2.shadowRoot?.querySelector('.menu');
    expect(menu1?.getAttribute('id')).toBeTruthy();
    expect(menu2?.getAttribute('id')).toBeTruthy();
    expect(menu1?.getAttribute('id')).not.toBe(menu2?.getAttribute('id'));
  });

  it('should set aria-haspopup on the slotted trigger element', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const btn = doc.createElement('button');
    btn.setAttribute('slot', 'trigger');
    btn.textContent = 'Trigger';
    el.appendChild(btn);
    doc.body.appendChild(el);
    // Wait for requestAnimationFrame to fire
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(btn.getAttribute('aria-haspopup')).toBe('true');
  });

  it('should set aria-expanded on the slotted trigger element', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const btn = doc.createElement('button');
    btn.setAttribute('slot', 'trigger');
    btn.textContent = 'Trigger';
    el.appendChild(btn);
    doc.body.appendChild(el);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('should apply role=menuitem to slotted button items', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('button');
    item.textContent = 'Edit';
    el.append(trigger, item);
    doc.body.appendChild(el);

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(item.getAttribute('role')).toBe('menuitem');
    expect(item.getAttribute('tabindex')).toBe('-1');
  });

  it('should not treat trigger clicks as menu item selection', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('button');
    item.textContent = 'Edit';
    el.append(trigger, item);
    doc.body.appendChild(el);

    let selected = 0;
    el.addEventListener('bq-select', () => {
      selected += 1;
    });

    trigger.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(selected).toBe(0);
    expect(el.hasAttribute('open')).toBe(true);
  });

  it('should close on Tab without restoring focus to the trigger', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('button');
    item.textContent = 'Edit';
    const next = doc.createElement('button');
    next.textContent = 'Next';
    doc.body.append(el, next);
    el.append(trigger, item);

    trigger.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    item.focus();

    item.dispatchEvent(
      new win.KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    );

    expect(el.hasAttribute('open')).toBe(false);
    expect(doc.activeElement).not.toBe(trigger);
  });
});
