// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterEach } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqTextarea — character counter', () => {
  beforeAll(async () => {
    await import('../src/components/textarea/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('should not show counter by default', () => {
    const el = doc.createElement('bq-textarea');
    el.setAttribute('maxlength', '200');
    doc.body.appendChild(el);
    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter).toBeNull();
  });

  it('should show counter when show-counter and maxlength are set', () => {
    const el = doc.createElement('bq-textarea');
    el.setAttribute('maxlength', '200');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);
    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter).not.toBeNull();
    expect(counter?.textContent).toContain('200');
  });

  it('should not show counter when show-counter is set but maxlength is empty', () => {
    const el = doc.createElement('bq-textarea');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);
    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter).toBeNull();
  });

  it('should have aria-live on counter', () => {
    const el = doc.createElement('bq-textarea');
    el.setAttribute('maxlength', '100');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);
    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter?.getAttribute('aria-live')).toBe('polite');
  });

  it('should include counter in textarea aria-describedby', () => {
    const el = doc.createElement('bq-textarea');
    el.setAttribute('maxlength', '100');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);
    const textarea = el.shadowRoot?.querySelector('textarea');
    const counter = el.shadowRoot?.querySelector('.counter');
    const counterId = counter?.getAttribute('id');
    expect(textarea?.getAttribute('aria-describedby')).toContain(counterId ?? '');
  });

  it('should update the counter live as the user types', async () => {
    const el = doc.createElement('bq-textarea');
    el.setAttribute('maxlength', '100');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);

    const textarea = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement | null;
    textarea!.value = 'hello';
    textarea?.dispatchEvent(new win.Event('input', { bubbles: true }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter?.textContent).toContain('5');
    expect(el.getAttribute('value')).toBe('hello');
  });

  it('should not render a footer when there is no hint, error, or counter', () => {
    const el = doc.createElement('bq-textarea');
    doc.body.appendChild(el);
    const footer = el.shadowRoot?.querySelector('.footer');
    expect(footer).toBeNull();
  });
});
