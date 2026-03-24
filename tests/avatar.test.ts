import { beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqAvatar', () => {
  beforeAll(async () => {
    await import('../src/components/avatar/index.js');
  });

  it('should define bq-avatar as a custom element', () => {
    expect(win.customElements.get('bq-avatar')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-avatar');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render initials from alt text', () => {
    const el = doc.createElement('bq-avatar');
    el.setAttribute('alt', 'John Doe');
    doc.body.appendChild(el);
    const avatar = el.shadowRoot?.querySelector('.avatar');
    expect(avatar?.textContent?.trim()).toBe('JD');
  });

  it('should render single initial for one-word name', () => {
    const el = doc.createElement('bq-avatar');
    el.setAttribute('alt', 'Admin');
    doc.body.appendChild(el);
    const avatar = el.shadowRoot?.querySelector('.avatar');
    expect(avatar?.textContent?.trim()).toBe('A');
  });

  it('should render both graphemes for a single-token CJK name', () => {
    const el = doc.createElement('bq-avatar');
    el.setAttribute('alt', '张三');
    doc.body.appendChild(el);
    const avatar = el.shadowRoot?.querySelector('.avatar');
    expect(avatar?.textContent?.trim()).toBe('张三');
  });

  it('should derive initials from multi-word non-Latin names', () => {
    const el = doc.createElement('bq-avatar');
    el.setAttribute('alt', 'محمد علي');
    doc.body.appendChild(el);
    const avatar = el.shadowRoot?.querySelector('.avatar');
    expect(avatar?.textContent?.trim()).toBe('مع');
  });

  it('should render img when src is set', () => {
    const el = doc.createElement('bq-avatar');
    el.setAttribute('src', 'photo.jpg');
    el.setAttribute('alt', 'John');
    doc.body.appendChild(el);
    const img = el.shadowRoot?.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('photo.jpg');
    expect(img?.getAttribute('alt')).toBe('John');
  });

  it('should apply size attribute', () => {
    const el = doc.createElement('bq-avatar');
    el.setAttribute('size', 'lg');
    doc.body.appendChild(el);
    const avatar = el.shadowRoot?.querySelector('.avatar');
    expect(avatar?.getAttribute('data-size')).toBe('lg');
  });

  it('should apply shape attribute', () => {
    const el = doc.createElement('bq-avatar');
    el.setAttribute('shape', 'square');
    doc.body.appendChild(el);
    const avatar = el.shadowRoot?.querySelector('.avatar');
    expect(avatar?.getAttribute('data-shape')).toBe('square');
  });

  it('should default to circle shape and md size', () => {
    const el = doc.createElement('bq-avatar');
    doc.body.appendChild(el);
    const avatar = el.shadowRoot?.querySelector('.avatar');
    expect(avatar?.getAttribute('data-shape')).toBe('circle');
    expect(avatar?.getAttribute('data-size')).toBe('md');
  });

  it('should render status indicator when status is set', () => {
    const el = doc.createElement('bq-avatar');
    el.setAttribute('status', 'online');
    doc.body.appendChild(el);
    const status = el.shadowRoot?.querySelector('.status');
    expect(status).not.toBeNull();
    expect(status?.getAttribute('data-status')).toBe('online');
  });

  it('should set role="img" with aria-label on avatar div', () => {
    const el = doc.createElement('bq-avatar');
    el.setAttribute('alt', 'Jane');
    doc.body.appendChild(el);
    const avatar = el.shadowRoot?.querySelector('.avatar');
    expect(avatar?.getAttribute('role')).toBe('img');
    expect(avatar?.getAttribute('aria-label')).toBe('Jane');
  });
});
