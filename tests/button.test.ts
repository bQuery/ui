// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';

// Obtain the shared happy-dom window/document injected by the preload setup.
const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqButton', () => {
  beforeAll(async () => {
    await import('../src/components/button/index.js');
  });

  it('should define bq-button as a custom element', () => {
    expect(win.customElements.get('bq-button')).toBeDefined();
  });

  it('should keep the button entrypoint isolated to the button component module', () => {
    const entrypointUrl = new URL('../src/components/button/index.ts', import.meta.url);
    const componentModuleUrl = new URL('../src/components/button/BqButton.ts', import.meta.url);
    const entrypointSource = readFileSync(entrypointUrl, 'utf8').trim();

    expect(existsSync(componentModuleUrl)).toBe(true);
    // The TypeScript source keeps the emitted `.js` specifier that consumers import at runtime.
    expect(entrypointSource).toBe("import './BqButton.js';");
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
    expect(btn?.getAttribute('data-variant')).toBe('danger');
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
    expect(btn?.getAttribute('data-size')).toBe('lg');
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
