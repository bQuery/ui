import { beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqCard', () => {
  beforeAll(async () => {
    await import('../src/components/card/index.js');
  });

  it('should define bq-card as a custom element', () => {
    expect(win.customElements.get('bq-card')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-card');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render an article element', () => {
    const el = doc.createElement('bq-card');
    doc.body.appendChild(el);
    const article = el.shadowRoot?.querySelector('article');
    expect(article).not.toBeNull();
  });

  it('should render title in header when set', () => {
    const el = doc.createElement('bq-card');
    el.setAttribute('title', 'Card Title');
    doc.body.appendChild(el);
    const title = el.shadowRoot?.querySelector('.card-title');
    expect(title?.textContent).toBe('Card Title');
  });

  it('should apply padding attribute', () => {
    const el = doc.createElement('bq-card');
    el.setAttribute('padding', 'lg');
    doc.body.appendChild(el);
    const body = el.shadowRoot?.querySelector('.card-body');
    expect(body?.getAttribute('data-padding')).toBe('lg');
  });

  it('should default to md padding', () => {
    const el = doc.createElement('bq-card');
    doc.body.appendChild(el);
    const body = el.shadowRoot?.querySelector('.card-body');
    expect(body?.getAttribute('data-padding')).toBe('md');
  });
});

describe('BqDivider', () => {
  beforeAll(async () => {
    await import('../src/components/divider/index.js');
  });

  it('should define bq-divider as a custom element', () => {
    expect(win.customElements.get('bq-divider')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-divider');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should have role="separator"', () => {
    const el = doc.createElement('bq-divider');
    doc.body.appendChild(el);
    const div = el.shadowRoot?.querySelector('.divider');
    expect(div?.getAttribute('role')).toBe('separator');
  });

  it('should default to horizontal orientation', () => {
    const el = doc.createElement('bq-divider');
    doc.body.appendChild(el);
    const div = el.shadowRoot?.querySelector('.divider');
    expect(div?.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('should apply variant attribute', () => {
    const el = doc.createElement('bq-divider');
    el.setAttribute('variant', 'dashed');
    doc.body.appendChild(el);
    const div = el.shadowRoot?.querySelector('.divider');
    expect(div?.getAttribute('data-variant')).toBe('dashed');
  });

  it('should render label when set', () => {
    const el = doc.createElement('bq-divider');
    el.setAttribute('label', 'OR');
    doc.body.appendChild(el);
    const label = el.shadowRoot?.querySelector('[part="label"]');
    expect(label?.textContent).toBe('OR');
  });

  it('should render two lines when label is present', () => {
    const el = doc.createElement('bq-divider');
    el.setAttribute('label', 'Section');
    doc.body.appendChild(el);
    const lines = el.shadowRoot?.querySelectorAll('.line');
    expect(lines?.length).toBe(2);
  });
});
