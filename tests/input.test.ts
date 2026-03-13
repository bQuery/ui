import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { Window } from 'happy-dom';

const win = new Window();
const doc = win.document;
(globalThis as Record<string, unknown>).window = win;
(globalThis as Record<string, unknown>).document = doc;
(globalThis as Record<string, unknown>).HTMLElement = win.HTMLElement;
(globalThis as Record<string, unknown>).customElements = win.customElements;
(globalThis as Record<string, unknown>).CustomEvent = win.CustomEvent;
(globalThis as Record<string, unknown>).ShadowRoot = win.ShadowRoot;
(globalThis as Record<string, unknown>).MutationObserver = win.MutationObserver;
(globalThis as Record<string, unknown>).requestAnimationFrame = (cb: FrameRequestCallback) => { cb(0); return 0; };

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
