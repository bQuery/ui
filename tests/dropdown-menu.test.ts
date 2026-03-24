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
    expect(btn.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('should only attach the document click listener while the menu is open', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('button');
    item.textContent = 'Edit';
    el.append(trigger, item);

    let addCount = 0;
    let removeCount = 0;
    const originalAdd = doc.addEventListener.bind(doc);
    const originalRemove = doc.removeEventListener.bind(doc);
    doc.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean) => {
      if (type === 'click') addCount += 1;
      return originalAdd(type, listener, options);
    }) as Document['addEventListener'];
    doc.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: EventListenerOptions | boolean) => {
      if (type === 'click') removeCount += 1;
      return originalRemove(type, listener, options);
    }) as Document['removeEventListener'];

    try {
      doc.body.appendChild(el);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      expect(addCount).toBe(0);

      trigger.click();
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      expect(addCount).toBe(1);

      trigger.click();
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      expect(removeCount).toBe(1);
    } finally {
      doc.addEventListener = originalAdd;
      doc.removeEventListener = originalRemove;
    }
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

  it('should reflect disabled state onto the slotted trigger element', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    el.setAttribute('disabled', '');
    const btn = doc.createElement('button');
    btn.setAttribute('slot', 'trigger');
    btn.textContent = 'Trigger';
    el.appendChild(btn);
    doc.body.appendChild(el);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(btn.getAttribute('aria-disabled')).toBe('true');
    expect(btn.hasAttribute('disabled')).toBe(true);
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

  it('should default slotted button items to type=button', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('button');
    item.textContent = 'Edit';
    el.append(trigger, item);
    doc.body.appendChild(el);

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(item.getAttribute('type')).toBe('button');
  });

  it('should normalize disabled anchors as aria-disabled menu items', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('a');
    item.setAttribute('disabled', '');
    item.href = '#details';
    item.textContent = 'Details';
    el.append(trigger, item);
    doc.body.appendChild(el);

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(item.getAttribute('role')).toBe('menuitem');
    expect(item.getAttribute('aria-disabled')).toBe('true');
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

  it('should restore focus to the trigger when closing on outside click', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('button');
    item.textContent = 'Edit';
    const outside = doc.createElement('div');
    doc.body.append(el, outside);
    el.append(trigger, item);

    trigger.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    item.focus();
    outside.dispatchEvent(new win.MouseEvent('click', { bubbles: true }));

    expect(el.hasAttribute('open')).toBe(false);
    expect(doc.activeElement).toBe(trigger);
  });

  it('should not focus a menu item if the menu closes before the next frame', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('button');
    item.textContent = 'Edit';
    el.append(trigger, item);
    doc.body.appendChild(el);

    trigger.click();
    trigger.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    expect(el.hasAttribute('open')).toBe(false);
    expect(doc.activeElement).not.toBe(item);
  });

  it('should activate the focused menu button on Enter', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('button');
    item.textContent = 'Edit';
    el.append(trigger, item);
    doc.body.appendChild(el);

    let selected: string | null = null;
    el.addEventListener('bq-select', (event) => {
      selected = (event as CustomEvent<{ value: string }>).detail.value;
    });

    trigger.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    item.focus();
    item.dispatchEvent(
      new win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );

    expect(selected).toBe('Edit');
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('should activate the focused menu link on Space', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('a');
    item.href = '#details';
    item.textContent = 'Details';
    el.append(trigger, item);
    doc.body.appendChild(el);

    let selected: string | null = null;
    el.addEventListener('bq-select', (event) => {
      selected = (event as CustomEvent<{ value: string }>).detail.value;
    });

    trigger.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    item.focus();
    item.dispatchEvent(
      new win.KeyboardEvent('keydown', { key: ' ', bubbles: true })
    );

    expect(selected).toBe('Details');
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('should focus the next matching item when typing a printable character', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const archive = doc.createElement('button');
    archive.textContent = 'Archive';
    const duplicate = doc.createElement('button');
    duplicate.textContent = 'Duplicate';
    const deleteItem = doc.createElement('button');
    deleteItem.textContent = 'Delete';
    el.append(trigger, archive, duplicate, deleteItem);
    doc.body.appendChild(el);

    trigger.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    archive.focus();
    archive.dispatchEvent(
      new win.KeyboardEvent('keydown', { key: 'd', bubbles: true })
    );

    expect(doc.activeElement).toBe(duplicate);
  });

  it('should ignore disabled anchor activation', async () => {
    const el = doc.createElement('bq-dropdown-menu');
    const trigger = doc.createElement('button');
    trigger.setAttribute('slot', 'trigger');
    trigger.textContent = 'Trigger';
    const item = doc.createElement('a');
    item.setAttribute('disabled', '');
    item.href = '#details';
    item.textContent = 'Details';
    el.append(trigger, item);
    doc.body.appendChild(el);

    let selected = 0;
    el.addEventListener('bq-select', () => {
      selected += 1;
    });

    trigger.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const clickEvent = new win.MouseEvent('click', { bubbles: true, cancelable: true });
    item.dispatchEvent(clickEvent);

    expect(selected).toBe(0);
    expect(clickEvent.defaultPrevented).toBe(true);
  });
});
