// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import {
  applyPinEdit,
  sanitizePin,
} from '../src/components/pin-input/BqPinInput.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('sanitizePin', () => {
  it('keeps only digits in numeric mode', () => {
    expect(sanitizePin('1a2b3', 'numeric', 6)).toBe('123');
  });

  it('keeps letters and digits in alphanumeric mode', () => {
    expect(sanitizePin('a1-b2', 'alphanumeric', 6)).toBe('a1b2');
  });

  it('drops whitespace in text mode but keeps punctuation', () => {
    expect(sanitizePin('a b-c', 'text', 6)).toBe('ab-c');
  });

  it('truncates to the number of cells', () => {
    expect(sanitizePin('123456789', 'numeric', 4)).toBe('1234');
  });

  it('falls back to numeric for an unknown type', () => {
    expect(sanitizePin('1a2', 'nonsense', 6)).toBe('12');
  });
});

describe('applyPinEdit', () => {
  it('overwrites from the given index rather than inserting', () => {
    expect(applyPinEdit('1234', 1, '99', 4)).toBe('1994');
  });

  it('pads a short value so a late cell can be filled first', () => {
    expect(applyPinEdit('', 2, '7', 4)).toBe('  7');
  });

  it('never grows past the cell count', () => {
    expect(applyPinEdit('12', 1, '999999', 4)).toBe('1999');
  });
});

describe('bq-pin-input', () => {
  beforeAll(async () => {
    await import('../src/components/pin-input/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (attrs: Record<string, string> = {}): HTMLElement => {
    const el = doc.createElement('bq-pin-input');
    el.setAttribute('length', '4');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    doc.body.appendChild(el);
    return el;
  };

  const cells = (el: HTMLElement): HTMLInputElement[] =>
    Array.from(el.shadowRoot?.querySelectorAll('.cell') ?? []);

  const type = (el: HTMLElement, index: number, char: string) => {
    const cell = cells(el)[index] as HTMLInputElement;
    cell.focus();
    cell.value = char;
    cell.dispatchEvent(new win.Event('input', { bubbles: true, composed: true }));
  };

  const press = (el: HTMLElement, index: number, key: string) =>
    cells(el)[index]?.dispatchEvent(
      new win.KeyboardEvent('keydown', {
        key,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );

  it('registers as a custom element', () => {
    expect(win.customElements.get('bq-pin-input')).toBeDefined();
  });

  it('renders one cell per character of the code', async () => {
    const el = create({ length: '6' });
    await waitForFrame();
    expect(cells(el)).toHaveLength(6);
  });

  it('collects typed characters into the value and advances', async () => {
    const el = create();
    await waitForFrame();

    type(el, 0, '1');
    await waitForFrame();
    expect(el.getAttribute('value')).toBe('1');
    expect(el.shadowRoot?.activeElement?.getAttribute('data-index')).toBe('1');

    type(el, 1, '2');
    await waitForFrame();
    expect(el.getAttribute('value')).toBe('12');
  });

  it('rejects characters that do not match the type', async () => {
    const el = create({ type: 'numeric' });
    await waitForFrame();
    type(el, 0, 'a');
    await waitForFrame();
    expect(el.getAttribute('value') ?? '').toBe('');
    expect(cells(el)[0]?.value ?? '').toBe('');
  });

  it('drops a rejected character typed over a filled cell', async () => {
    const el = create({ type: 'numeric', value: '12' });
    await waitForFrame();
    type(el, 0, 'a');
    await waitForFrame();
    expect(el.getAttribute('value')).toBe('12');
    expect(cells(el).map((cell) => cell.value)).toEqual(['1', '2', '', '']);
  });

  it('clears the current cell on Backspace, then steps back', async () => {
    const el = create({ value: '12' });
    await waitForFrame();

    press(el, 1, 'Backspace');
    await waitForFrame();
    expect(el.getAttribute('value')).toBe('1');

    press(el, 1, 'Backspace');
    await waitForFrame();
    expect(el.getAttribute('value')).toBe('');
  });

  it('moves between cells with the arrow keys', async () => {
    const el = create({ value: '1234' });
    await waitForFrame();
    cells(el)[2]?.focus();
    press(el, 2, 'ArrowLeft');
    await waitForFrame();
    expect(el.shadowRoot?.activeElement?.getAttribute('data-index')).toBe('1');
  });

  it('spreads a paste across the remaining cells', async () => {
    const el = create();
    await waitForFrame();

    const event = new win.Event('paste', {
      bubbles: true,
      composed: true,
      cancelable: true,
    }) as Event & { clipboardData: { getData(): string } };
    Object.defineProperty(event, 'clipboardData', {
      value: { getData: () => '9876' },
    });
    cells(el)[0]?.dispatchEvent(event);
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('9876');
  });

  it('announces completion once every cell is filled', async () => {
    const el = create({ value: '123' });
    await waitForFrame();

    let completed = '';
    el.addEventListener('bq-complete', (e) => {
      completed = (e as CustomEvent<{ value: string }>).detail.value;
    });
    type(el, 3, '4');
    await waitForFrame();

    expect(completed).toBe('1234');
  });

  it('submits through a hidden input inside a form', async () => {
    const form = doc.createElement('form');
    doc.body.appendChild(form);
    const el = doc.createElement('bq-pin-input');
    el.setAttribute('name', 'code');
    el.setAttribute('value', '1234');
    form.appendChild(el);
    await waitForFrame();

    const proxy = form.querySelector(
      'input[name="code"]'
    ) as HTMLInputElement | null;
    expect(proxy?.value).toBe('1234');
  });

  it('masks the characters when asked', async () => {
    const el = create({ mask: '', value: '12' });
    await waitForFrame();
    expect(cells(el)[0]?.getAttribute('type')).toBe('password');
  });
});
