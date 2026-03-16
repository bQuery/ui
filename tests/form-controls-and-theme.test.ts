// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterEach } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('form control IDs and theme CSS', () => {
  beforeAll(async () => {
    await import('../src/components/input/index.js');
    await import('../src/components/textarea/index.js');
    await import('../src/components/select/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('keeps input IDs stable across re-renders', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('label', 'Email');
    doc.body.appendChild(el);

    const input = el.shadowRoot?.querySelector('input');
    const label = el.shadowRoot?.querySelector('label');
    const firstId = input?.id;

    el.setAttribute('error', 'Invalid');

    const updatedInput = el.shadowRoot?.querySelector('input');
    const updatedLabel = el.shadowRoot?.querySelector('label');

    expect(firstId).toBeTruthy();
    expect(updatedInput?.id).toBe(firstId);
    expect(updatedLabel?.getAttribute('for')).toBe(firstId);
    expect(updatedInput?.getAttribute('aria-describedby')).toBe(`${firstId}-err`);
    expect(el.shadowRoot?.querySelector('.error-msg')?.id).toBe(`${firstId}-err`);
    expect(label?.getAttribute('for')).toBe(firstId);
  });

  it('keeps textarea IDs stable across re-renders', () => {
    const el = doc.createElement('bq-textarea');
    el.setAttribute('label', 'Notes');
    doc.body.appendChild(el);

    const textarea = el.shadowRoot?.querySelector('textarea');
    const firstId = textarea?.id;

    el.setAttribute('hint', 'Helpful text');

    const updatedTextarea = el.shadowRoot?.querySelector('textarea');
    const updatedLabel = el.shadowRoot?.querySelector('label');

    expect(firstId).toBeTruthy();
    expect(updatedTextarea?.id).toBe(firstId);
    expect(updatedLabel?.getAttribute('for')).toBe(firstId);
    expect(updatedTextarea?.getAttribute('aria-describedby')).toBe(`${firstId}-hint`);
    expect(el.shadowRoot?.querySelector('.hint')?.id).toBe(`${firstId}-hint`);
  });

  it('keeps select IDs stable across re-renders', () => {
    const el = doc.createElement('bq-select');
    el.setAttribute('label', 'Country');
    el.innerHTML = '<option value="br">Brazil</option>';
    doc.body.appendChild(el);

    const select = el.shadowRoot?.querySelector('select');
    const firstId = select?.id;

    el.setAttribute('error', 'Required');

    const updatedSelect = el.shadowRoot?.querySelector('select');
    const updatedLabel = el.shadowRoot?.querySelector('label');

    expect(firstId).toBeTruthy();
    expect(updatedSelect?.id).toBe(firstId);
    expect(updatedLabel?.getAttribute('for')).toBe(firstId);
  });

  it('does not re-emit the full light token palette inside dark theme CSS', async () => {
    const { getDarkThemeCSS } = await import('../src/theme/dark.js');
    const css = getDarkThemeCSS();

    expect(css).not.toContain('--bq-color-primary-50: #eff6ff;');
    expect(css).toContain('--bq-color-primary-600: #3b82f6;');
    expect(css).toContain('--bq-bg-base: #0f172a;');
  });
});
