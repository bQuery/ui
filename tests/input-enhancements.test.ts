// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterEach } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqInput — password toggle', () => {
  beforeAll(async () => {
    await import('../src/components/input/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('should render a password toggle button for type=password', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('type', 'password');
    doc.body.appendChild(el);
    const toggle = el.shadowRoot?.querySelector('.password-toggle');
    expect(toggle).not.toBeNull();
  });

  it('should not render a password toggle for type=text', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('type', 'text');
    doc.body.appendChild(el);
    const toggle = el.shadowRoot?.querySelector('.password-toggle');
    expect(toggle).toBeNull();
  });

  it('should have aria-label on the password toggle button', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('type', 'password');
    doc.body.appendChild(el);
    const toggle = el.shadowRoot?.querySelector('.password-toggle');
    expect(toggle?.getAttribute('aria-label')).toBeTruthy();
  });

  it('should have aria-pressed on the password toggle button', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('type', 'password');
    doc.body.appendChild(el);
    const toggle = el.shadowRoot?.querySelector('.password-toggle');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
  });

  it('should have icon inside the password toggle', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('type', 'password');
    doc.body.appendChild(el);
    const icon = el.shadowRoot?.querySelector('.password-toggle .pw-icon');
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should disable the password toggle when the input is disabled', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('type', 'password');
    el.setAttribute('disabled', '');
    doc.body.appendChild(el);
    const toggle = el.shadowRoot?.querySelector('.password-toggle');
    expect(toggle?.hasAttribute('disabled')).toBe(true);
  });

  it('should disable the password toggle when the input is readonly', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('type', 'password');
    el.setAttribute('readonly', '');
    doc.body.appendChild(el);
    const toggle = el.shadowRoot?.querySelector('.password-toggle');
    expect(toggle?.hasAttribute('disabled')).toBe(true);
  });
});

describe('BqInput — character counter', () => {
  beforeAll(async () => {
    await import('../src/components/input/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('should not show counter by default', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('maxlength', '100');
    doc.body.appendChild(el);
    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter).toBeNull();
  });

  it('should show counter when show-counter and maxlength are set', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('maxlength', '100');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);
    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter).not.toBeNull();
    expect(counter?.textContent).toContain('100');
  });

  it('should not show counter when show-counter is set but maxlength is empty', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);
    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter).toBeNull();
  });

  it('should have aria-live on counter for screen reader updates', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('maxlength', '50');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);
    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter?.getAttribute('aria-live')).toBe('polite');
  });

  it('should include counter in aria-describedby', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('maxlength', '50');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    const counter = el.shadowRoot?.querySelector('.counter');
    const counterId = counter?.getAttribute('id');
    expect(input?.getAttribute('aria-describedby')).toContain(counterId ?? '');
  });
});
