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

  it('should reset password visibility when type changes away from password', async () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('type', 'password');
    doc.body.appendChild(el);

    const toggle = el.shadowRoot?.querySelector(
      '.password-toggle'
    ) as HTMLButtonElement | null;
    toggle?.click();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const openToggle = el.shadowRoot?.querySelector(
      '.password-toggle'
    ) as HTMLButtonElement | null;
    expect(openToggle?.getAttribute('aria-pressed')).toBe('true');

    el.setAttribute('type', 'text');
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    el.setAttribute('type', 'password');
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const nextToggle = el.shadowRoot?.querySelector(
      '.password-toggle'
    ) as HTMLButtonElement | null;
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement | null;
    expect(nextToggle?.getAttribute('aria-pressed')).toBe('false');
    expect(input?.getAttribute('type')).toBe('password');
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
    expect(input).not.toBeNull();
    expect(counter).not.toBeNull();
    const counterId = counter!.getAttribute('id');
    expect(counterId).toBeTruthy();
    const describedBy = input!.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(describedBy).toContain(counterId as string);
  });

  it('should update the counter live as the user types', async () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('maxlength', '50');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement | null;
    input!.value = 'hello';
    input?.dispatchEvent(new win.Event('input', { bubbles: true }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter?.textContent).toContain('5');
    expect(el.getAttribute('value')).toBe('hello');
  });

  it('should indicate over-limit state when value exceeds maxlength', async () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('maxlength', '5');
    el.setAttribute('show-counter', '');
    doc.body.appendChild(el);

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement | null;
    input!.value = 'toolong';
    input?.dispatchEvent(new win.Event('input', { bubbles: true }));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const counter = el.shadowRoot?.querySelector('.counter');
    expect(counter).not.toBeNull();
    expect(counter!.getAttribute('data-over')).toBe('true');
  });

  it('should not render a footer when there is no hint, error, or counter', () => {
    const el = doc.createElement('bq-input');
    doc.body.appendChild(el);
    const footer = el.shadowRoot?.querySelector('.footer');
    expect(footer).toBeNull();
  });
});
