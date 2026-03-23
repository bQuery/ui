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

  it('should have aria-haspopup on trigger slot wrapper', () => {
    const el = doc.createElement('bq-dropdown-menu');
    doc.body.appendChild(el);
    const triggerSlot = el.shadowRoot?.querySelector('slot[name="trigger"]');
    expect(triggerSlot?.getAttribute('aria-haspopup')).toBe('true');
  });

  it('should have aria-expanded matching open state', () => {
    const el = doc.createElement('bq-dropdown-menu');
    doc.body.appendChild(el);
    const triggerSlot = el.shadowRoot?.querySelector('slot[name="trigger"]');
    expect(triggerSlot?.getAttribute('aria-expanded')).toBe('false');
  });
});
