import { beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqBadge', () => {
  beforeAll(async () => {
    await import('../src/components/badge/index.js');
  });

  it('should define bq-badge as a custom element', () => {
    expect(win.customElements.get('bq-badge')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-badge');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should default to primary variant and md size', () => {
    const el = doc.createElement('bq-badge');
    doc.body.appendChild(el);
    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.getAttribute('data-variant')).toBe('primary');
    expect(badge?.getAttribute('data-size')).toBe('md');
  });

  it('should apply variant attribute', () => {
    const el = doc.createElement('bq-badge');
    el.setAttribute('variant', 'danger');
    doc.body.appendChild(el);
    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.getAttribute('data-variant')).toBe('danger');
  });

  it('should apply size attribute', () => {
    const el = doc.createElement('bq-badge');
    el.setAttribute('size', 'sm');
    doc.body.appendChild(el);
    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.getAttribute('data-size')).toBe('sm');
  });
});
