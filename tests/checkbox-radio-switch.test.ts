import { beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqCheckbox', () => {
  beforeAll(async () => {
    await import('../src/components/checkbox/index.js');
  });

  it('should define bq-checkbox as a custom element', () => {
    expect(win.customElements.get('bq-checkbox')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-checkbox');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render a checkbox input', () => {
    const el = doc.createElement('bq-checkbox');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]');
    expect(input).not.toBeNull();
  });

  it('should render label text', () => {
    const el = doc.createElement('bq-checkbox');
    el.setAttribute('label', 'Accept terms');
    doc.body.appendChild(el);
    const label = el.shadowRoot?.querySelector('.label-text');
    expect(label?.textContent).toContain('Accept terms');
  });

  it('should be checked when checked attribute is set', () => {
    const el = doc.createElement('bq-checkbox');
    el.setAttribute('checked', '');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input?.hasAttribute('checked')).toBe(true);
  });

  it('should be disabled when disabled attribute is set', () => {
    const el = doc.createElement('bq-checkbox');
    el.setAttribute('disabled', '');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input?.hasAttribute('disabled')).toBe(true);
  });

  it('should render hint when set', () => {
    const el = doc.createElement('bq-checkbox');
    el.setAttribute('hint', 'Required');
    doc.body.appendChild(el);
    const hint = el.shadowRoot?.querySelector('.hint');
    expect(hint?.textContent).toBe('Required');
  });

  it('should set data-bq-form-proxy hidden input for form participation', () => {
    const el = doc.createElement('bq-checkbox');
    el.setAttribute('name', 'agree');
    el.setAttribute('value', 'yes');
    el.setAttribute('checked', '');
    doc.body.appendChild(el);
    const proxy = el.nextElementSibling as HTMLInputElement | null;
    expect(proxy?.type).toBe('hidden');
    expect(proxy?.name).toBe('agree');
    expect(proxy?.value).toBe('yes');
  });
});

describe('BqRadio', () => {
  beforeAll(async () => {
    await import('../src/components/radio/index.js');
  });

  it('should define bq-radio as a custom element', () => {
    expect(win.customElements.get('bq-radio')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-radio');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render a radio input', () => {
    const el = doc.createElement('bq-radio');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input[type="radio"]');
    expect(input).not.toBeNull();
  });

  it('should apply name and value attributes', () => {
    const el = doc.createElement('bq-radio');
    el.setAttribute('name', 'color');
    el.setAttribute('value', 'red');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input?.getAttribute('name')).toBe('color');
    expect(input?.getAttribute('value')).toBe('red');
  });

  it('should render label text', () => {
    const el = doc.createElement('bq-radio');
    el.setAttribute('label', 'Option A');
    doc.body.appendChild(el);
    const label = el.shadowRoot?.querySelector('.label-text');
    expect(label?.textContent).toBe('Option A');
  });

  it('should render hint when set', () => {
    const el = doc.createElement('bq-radio');
    el.setAttribute('hint', 'Choose one');
    doc.body.appendChild(el);
    const hint = el.shadowRoot?.querySelector('.hint');
    expect(hint?.textContent).toBe('Choose one');
  });

  it('should create form proxy hidden input', () => {
    const el = doc.createElement('bq-radio');
    el.setAttribute('name', 'choice');
    el.setAttribute('value', 'a');
    el.setAttribute('checked', '');
    doc.body.appendChild(el);
    const proxy = el.nextElementSibling as HTMLInputElement | null;
    expect(proxy?.type).toBe('hidden');
    expect(proxy?.name).toBe('choice');
    expect(proxy?.value).toBe('a');
  });
});

describe('BqSwitch', () => {
  beforeAll(async () => {
    await import('../src/components/switch/index.js');
  });

  it('should define bq-switch as a custom element', () => {
    expect(win.customElements.get('bq-switch')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-switch');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render a checkbox with role="switch"', () => {
    const el = doc.createElement('bq-switch');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.getAttribute('role')).toBe('switch');
  });

  it('should render label text', () => {
    const el = doc.createElement('bq-switch');
    el.setAttribute('label', 'Dark mode');
    doc.body.appendChild(el);
    const label = el.shadowRoot?.querySelector('.label-text');
    expect(label?.textContent).toBe('Dark mode');
  });

  it('should default to md size', () => {
    const el = doc.createElement('bq-switch');
    doc.body.appendChild(el);
    const track = el.shadowRoot?.querySelector('.track');
    expect(track?.getAttribute('data-size')).toBe('md');
  });

  it('should apply size attribute', () => {
    const el = doc.createElement('bq-switch');
    el.setAttribute('size', 'lg');
    doc.body.appendChild(el);
    const track = el.shadowRoot?.querySelector('.track');
    expect(track?.getAttribute('data-size')).toBe('lg');
  });

  it('should create form proxy hidden input', () => {
    const el = doc.createElement('bq-switch');
    el.setAttribute('name', 'toggle');
    el.setAttribute('checked', '');
    doc.body.appendChild(el);
    const proxy = el.nextElementSibling as HTMLInputElement | null;
    expect(proxy?.type).toBe('hidden');
    expect(proxy?.name).toBe('toggle');
    expect(proxy?.value).toBe('on');
  });
});
