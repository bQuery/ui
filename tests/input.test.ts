// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

// Obtain the shared happy-dom window/document injected by the preload setup.
const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

type RegisterFn = (prefix?: string) => string;
let registerBqInput: RegisterFn;

describe('BqInput', () => {
  beforeAll(async () => {
    const mod = await import('../src/components/input/BqInput.js');
    registerBqInput = mod.registerBqInput;
    registerBqInput('bq');
  });

  it('should define bq-input', () => {
    expect(win.customElements.get('bq-input')).toBeDefined();
  });

  it('should render label when label attribute is set', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('label', 'Email');
    doc.body.appendChild(el);
    const label = el.shadowRoot?.querySelector('label');
    expect(label?.textContent?.trim()).toContain('Email');
  });

  it('should apply disabled state', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('disabled', '');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  it('should show error message', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('error', 'This field is required');
    doc.body.appendChild(el);
    const errorMsg = el.shadowRoot?.querySelector('.error-msg');
    expect(errorMsg?.textContent).toContain('This field is required');
  });

  it('should show hint message when no error', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('hint', 'Enter your email address');
    doc.body.appendChild(el);
    const hint = el.shadowRoot?.querySelector('.hint');
    expect(hint?.textContent).toContain('Enter your email address');
  });

  it('should set input type', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('type', 'password');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('type')).toBe('password');
  });

  it('should set required attribute and show asterisk', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('label', 'Name');
    el.setAttribute('required', '');
    doc.body.appendChild(el);
    const requiredMark = el.shadowRoot?.querySelector('.required-mark');
    expect(requiredMark).not.toBeNull();
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.hasAttribute('required')).toBe(true);
  });

  it('should mark input as aria-invalid when error is set', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('error', 'Invalid input');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
  });

  afterAll(() => {
    doc.body.innerHTML = '';
  });
});
