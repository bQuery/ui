import { beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqAlert', () => {
  beforeAll(async () => {
    await import('../src/components/alert/index.js');
  });

  it('should define bq-alert as a custom element', () => {
    expect(win.customElements.get('bq-alert')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-alert');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should default to info variant', () => {
    const el = doc.createElement('bq-alert');
    doc.body.appendChild(el);
    const div = el.shadowRoot?.querySelector('.alert');
    expect(div?.getAttribute('data-variant')).toBe('info');
  });

  it('should apply variant attribute', () => {
    const el = doc.createElement('bq-alert');
    el.setAttribute('variant', 'danger');
    doc.body.appendChild(el);
    const div = el.shadowRoot?.querySelector('.alert');
    expect(div?.getAttribute('data-variant')).toBe('danger');
  });

  it('should render title when set', () => {
    const el = doc.createElement('bq-alert');
    el.setAttribute('title', 'Warning!');
    doc.body.appendChild(el);
    const title = el.shadowRoot?.querySelector('.alert-title');
    expect(title?.textContent).toBe('Warning!');
  });

  it('should use role="alert" for danger/warning variants', () => {
    const el = doc.createElement('bq-alert');
    el.setAttribute('variant', 'danger');
    doc.body.appendChild(el);
    const div = el.shadowRoot?.querySelector('.alert');
    expect(div?.getAttribute('role')).toBe('alert');
  });

  it('should use role="status" for info/success variants', () => {
    const el = doc.createElement('bq-alert');
    el.setAttribute('variant', 'info');
    doc.body.appendChild(el);
    const div = el.shadowRoot?.querySelector('.alert');
    expect(div?.getAttribute('role')).toBe('status');
  });

  it('should render close button when dismissible', () => {
    const el = doc.createElement('bq-alert');
    el.setAttribute('dismissible', '');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('.close');
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute('aria-label')).toBeTruthy();
  });

  it('should not render close button when not dismissible', () => {
    const el = doc.createElement('bq-alert');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('.close');
    expect(btn).toBeNull();
  });

  it('should hide on close click and fire bq-close', () => {
    const el = doc.createElement('bq-alert');
    el.setAttribute('dismissible', '');
    doc.body.appendChild(el);
    let fired = false;
    el.addEventListener('bq-close', () => {
      fired = true;
    });
    const btn = el.shadowRoot?.querySelector('.close') as HTMLElement;
    btn?.click();
    expect(el.hasAttribute('hidden')).toBe(true);
    expect(fired).toBe(true);
  });
});
