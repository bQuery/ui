// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

// Obtain the shared happy-dom window/document injected by the preload setup.
const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

type RegisterFn = (prefix?: string) => string;
let registerBqButton: RegisterFn;

describe('BqButton', () => {
  beforeAll(async () => {
    const mod = await import('../src/components/button/BqButton.js');
    registerBqButton = mod.registerBqButton;
    registerBqButton('bq');
  });

  it('should define bq-button as a custom element', () => {
    expect(win.customElements.get('bq-button')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-button');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render a button element inside shadow root', () => {
    const el = doc.createElement('bq-button');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn).not.toBeNull();
  });

  it('should apply variant attribute', () => {
    const el = doc.createElement('bq-button');
    el.setAttribute('variant', 'danger');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn?.className).toContain('btn--danger');
  });

  it('should be disabled when disabled attribute is set', () => {
    const el = doc.createElement('bq-button');
    el.setAttribute('disabled', '');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn?.hasAttribute('disabled')).toBe(true);
  });

  it('should show loading spinner when loading attribute is set', () => {
    const el = doc.createElement('bq-button');
    el.setAttribute('loading', '');
    doc.body.appendChild(el);
    const spinner = el.shadowRoot?.querySelector('.spinner');
    expect(spinner).not.toBeNull();
  });

  it('should render anchor tag when href is provided', () => {
    const el = doc.createElement('bq-button');
    el.setAttribute('href', 'https://example.com');
    doc.body.appendChild(el);
    const anchor = el.shadowRoot?.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
  });

  it('should apply size class', () => {
    const el = doc.createElement('bq-button');
    el.setAttribute('size', 'lg');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn?.className).toContain('btn--lg');
  });

  it('should dispatch bq-click event on click', () => {
    const el = doc.createElement('bq-button');
    doc.body.appendChild(el);
    let fired = false;
    el.addEventListener('bq-click', () => { fired = true; });
    const btn = el.shadowRoot?.querySelector('button');
    btn?.dispatchEvent(new (win as unknown as Record<string, typeof MouseEvent>)['MouseEvent']('click', { bubbles: true, composed: true }));
    expect(fired).toBe(true);
  });

  afterAll(() => {
    doc.body.innerHTML = '';
  });
});
