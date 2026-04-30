// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('polish batch 6 — form a11y + UX upgrades', () => {
  beforeAll(async () => {
    await import('../src/components/input/index.js');
    await import('../src/components/textarea/index.js');
    await import('../src/components/select/index.js');
    await import('../src/components/checkbox/index.js');
    await import('../src/components/switch/index.js');
    await import('../src/components/slider/index.js');
    await import('../src/components/pagination/index.js');
    await import('../src/components/toast/index.js');
    await import('../src/components/breadcrumbs/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
    doc
      .querySelectorAll('[id^="bq-toast-container-"]')
      .forEach((node) => node.remove());
  });

  // ---- A2: aria-errormessage --------------------------------------------
  it('input wires aria-errormessage to the error span when error is set', () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('label', 'Email');
    el.setAttribute('error', 'Invalid');
    doc.body.appendChild(el);

    const input = el.shadowRoot?.querySelector('input');
    const errorId = input?.getAttribute('aria-errormessage');
    expect(errorId).toBeTruthy();
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    const errorSpan = el.shadowRoot?.querySelector('.error-msg');
    expect(errorSpan?.id).toBe(errorId!);
  });

  it('textarea exposes aria-errormessage only while in error state', () => {
    const el = doc.createElement('bq-textarea');
    el.setAttribute('label', 'Notes');
    doc.body.appendChild(el);
    expect(
      el.shadowRoot
        ?.querySelector('textarea')
        ?.hasAttribute('aria-errormessage')
    ).toBe(false);

    el.setAttribute('error', 'Required');
    expect(
      el.shadowRoot
        ?.querySelector('textarea')
        ?.getAttribute('aria-errormessage')
    ).toMatch(/-err$/);
  });

  it('select exposes aria-errormessage only while in error state', () => {
    const el = doc.createElement('bq-select');
    el.setAttribute('label', 'Country');
    el.innerHTML = '<option value="br">Brazil</option>';
    doc.body.appendChild(el);
    expect(
      el.shadowRoot?.querySelector('select')?.hasAttribute('aria-errormessage')
    ).toBe(false);

    el.setAttribute('error', 'Required');
    expect(
      el.shadowRoot?.querySelector('select')?.getAttribute('aria-errormessage')
    ).toMatch(/-err$/);
  });

  // ---- A1: standardized event detail shape -----------------------------
  it('checkbox bq-change detail starts with value followed by checked', () => {
    const el = doc.createElement('bq-checkbox');
    el.setAttribute('value', 'newsletter');
    doc.body.appendChild(el);

    let received: Record<string, unknown> | null = null;
    el.addEventListener('bq-change', (e) => {
      received = (e as CustomEvent).detail;
    });

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(received).not.toBeNull();
    const keys = Object.keys(received!);
    expect(keys[0]).toBe('value');
    expect(keys[1]).toBe('checked');
    expect(received!.value).toBe('newsletter');
    expect(received!.checked).toBe(true);
  });

  it('switch bq-change detail includes both value and checked', () => {
    const el = doc.createElement('bq-switch');
    doc.body.appendChild(el);

    let received: Record<string, unknown> | null = null;
    el.addEventListener('bq-change', (e) => {
      received = (e as CustomEvent).detail;
    });

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(received).not.toBeNull();
    expect(Object.keys(received!)).toEqual(['value', 'checked']);
    expect(received!.checked).toBe(true);
  });

  // ---- A3: form proxy live value -----------------------------------------
  it('slider hidden form proxy reflects the live range value on submit', () => {
    const form = doc.createElement('form');
    const el = doc.createElement('bq-slider');
    el.setAttribute('name', 'volume');
    el.setAttribute('value', '40');
    form.appendChild(el);
    doc.body.appendChild(form);

    const range = el.shadowRoot?.querySelector(
      'input[type="range"]'
    ) as HTMLInputElement;
    // Simulate user dragging without setAttribute('value', ...) yet.
    range.value = '88';

    // happy-dom does not dispatch `formdata` from `new FormData(form)`; emit it
    // manually so we exercise the getLiveValue path that the form proxy
    // installs when an ancestor <form> is present.
    const FormDataEventCtor = (
      win as unknown as { FormDataEvent?: typeof Event }
    ).FormDataEvent;
    if (FormDataEventCtor) {
      const fd = new FormData();
      form.dispatchEvent(
        new FormDataEventCtor('formdata', { formData: fd } as EventInit)
      );
    } else {
      form.dispatchEvent(new Event('formdata'));
    }

    const proxyInput = form.querySelector(
      'input[data-bq-form-proxy]'
    ) as HTMLInputElement | null;
    expect(proxyInput).not.toBeNull();
    expect(proxyInput!.value).toBe('88');

    // Tear down deterministically — happy-dom mishandles bulk innerHTML clears
    // when a custom element's disconnected() callback removes a sibling node.
    form.remove();
  });

  // ---- B1: breadcrumbs CSS pseudo separator -----------------------------
  it('breadcrumbs writes the separator into a CSS custom property', async () => {
    const el = doc.createElement('bq-breadcrumbs');
    el.setAttribute('separator', '›');
    el.innerHTML = '<a href="/">Home</a><a href="/docs">Docs</a>';
    doc.body.appendChild(el);
    await Promise.resolve();

    expect(el.style.getPropertyValue('--bq-breadcrumb-separator')).toBe('"›"');
    // No injected children
    expect(el.querySelectorAll('[data-bq-breadcrumb-separator]')).toHaveLength(
      0
    );
  });

  it('breadcrumbs escapes quotes when generating the CSS variable', async () => {
    const el = doc.createElement('bq-breadcrumbs');
    el.setAttribute('separator', '"');
    el.innerHTML = '<a href="/">A</a><a>B</a>';
    doc.body.appendChild(el);
    await Promise.resolve();

    expect(el.style.getPropertyValue('--bq-breadcrumb-separator')).toBe(
      '"\\""'
    );
  });

  // ---- B3: toast position variants --------------------------------------
  it('showToast lazily creates a per-position container and reuses it', async () => {
    const { showToast } = await import('../src/components/toast/BqToast.js');
    showToast({ message: 'one', position: 'bottom-left' });
    showToast({ message: 'two', position: 'bottom-left' });
    showToast({ message: 'three', position: 'top-center' });

    const blContainer = doc.getElementById('bq-toast-container-bottom-left');
    const tcContainer = doc.getElementById('bq-toast-container-top-center');
    expect(blContainer).not.toBeNull();
    expect(tcContainer).not.toBeNull();
    expect(blContainer?.querySelectorAll('bq-toast').length).toBe(2);
    expect(tcContainer?.querySelectorAll('bq-toast').length).toBe(1);
  });

  // ---- B4: pagination first/last ---------------------------------------
  it('pagination renders « and » buttons when show-first-last is set', () => {
    const el = doc.createElement('bq-pagination');
    el.setAttribute('total', '10');
    el.setAttribute('page', '5');
    el.setAttribute('show-first-last', '');
    doc.body.appendChild(el);

    const first = el.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label*="First" i]'
    );
    const last = el.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label*="Last" i]'
    );
    expect(first).toBeTruthy();
    expect(last).toBeTruthy();
    expect(first?.getAttribute('data-page')).toBe('1');
    expect(last?.getAttribute('data-page')).toBe('10');
  });

  it('pagination first/last disable at the page boundaries', () => {
    const el = doc.createElement('bq-pagination');
    el.setAttribute('total', '5');
    el.setAttribute('page', '1');
    el.setAttribute('show-first-last', '');
    doc.body.appendChild(el);

    const firstBtn = el.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[aria-label*="First" i]'
    );
    expect(firstBtn?.disabled).toBe(true);
  });
});
