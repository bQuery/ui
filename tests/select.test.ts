import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { waitForFrame } from './helpers.js';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqSelect', () => {
  beforeAll(async () => {
    await import('../src/components/select/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('should select the matching option when value is provided', async () => {
    const el = doc.createElement('bq-select');
    el.setAttribute('label', 'Plan');
    el.setAttribute('value', 'pro');
    el.setAttribute('name', 'plan');
    el.innerHTML = `
      <option value="free">Free</option>
      <option value="pro">Pro</option>
      <option value="enterprise">Enterprise</option>
    `;
    doc.body.appendChild(el);

    await waitForFrame();

    const select = el.shadowRoot?.querySelector(
      'select'
    ) as HTMLSelectElement | null;
    const proxy = el.nextElementSibling as HTMLInputElement | null;

    expect(select?.value).toBe('pro');
    expect(el.getAttribute('value')).toBe('pro');
    expect(proxy?.value).toBe('pro');
  });

  it('should sync the host value to the native default selection when no value is provided', async () => {
    const el = doc.createElement('bq-select');
    el.setAttribute('name', 'framework');
    el.innerHTML = `
      <option value="react">React</option>
      <option value="vue">Vue</option>
    `;
    doc.body.appendChild(el);

    await waitForFrame();

    const select = el.shadowRoot?.querySelector(
      'select'
    ) as HTMLSelectElement | null;
    const proxy = el.nextElementSibling as HTMLInputElement | null;

    expect(select?.value).toBe('react');
    expect(el.getAttribute('value')).toBe('react');
    expect(proxy?.value).toBe('react');
  });

  it('should update the selected option when slotted options arrive after connection', async () => {
    const el = doc.createElement('bq-select');
    el.setAttribute('value', 'angular');
    doc.body.appendChild(el);

    el.innerHTML = `
      <option value="react">React</option>
      <option value="angular">Angular</option>
    `;

    await waitForFrame(2);

    const select = el.shadowRoot?.querySelector(
      'select'
    ) as HTMLSelectElement | null;
    expect(select?.value).toBe('angular');
  });
});
