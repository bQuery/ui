// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import {
  filterOptions,
  nextEnabledIndex,
  parseValues,
  readOptions,
  type ComboboxOption,
} from '../src/components/combobox/BqCombobox.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

const option = (
  value: string,
  label = value,
  disabled = false,
  group = ''
): ComboboxOption => ({ value, label, disabled, group });

describe('parseValues', () => {
  it('splits and trims a comma-separated value', () => {
    expect(parseValues(' a , b ,c ')).toEqual(['a', 'b', 'c']);
  });

  it('drops empty segments', () => {
    expect(parseValues('a,,b,')).toEqual(['a', 'b']);
    expect(parseValues('')).toEqual([]);
  });
});

describe('filterOptions', () => {
  const options = [
    option('apple', 'Apple'),
    option('apricot', 'Apricot'),
    option('banana', 'Banana'),
    option('jose', 'José'),
  ];

  it('returns everything for an empty query', () => {
    expect(filterOptions(options, '')).toHaveLength(4);
    expect(filterOptions(options, '   ')).toHaveLength(4);
  });

  it('matches anywhere in contains mode', () => {
    expect(filterOptions(options, 'an').map((o) => o.value)).toEqual([
      'banana',
    ]);
  });

  it('matches only the beginning in starts-with mode', () => {
    expect(
      filterOptions(options, 'ap', 'starts-with').map((o) => o.value)
    ).toEqual(['apple', 'apricot']);
    expect(filterOptions(options, 'na', 'starts-with')).toHaveLength(0);
  });

  it('ignores case', () => {
    expect(filterOptions(options, 'APPLE')).toHaveLength(1);
  });

  it('ignores diacritics so plain ASCII finds accented labels', () => {
    expect(filterOptions(options, 'jose').map((o) => o.value)).toEqual([
      'jose',
    ]);
    expect(filterOptions(options, 'josé').map((o) => o.value)).toEqual([
      'jose',
    ]);
  });
});

describe('nextEnabledIndex', () => {
  const options = [
    option('a'),
    option('b', 'b', true),
    option('c'),
    option('d', 'd', true),
  ];

  it('steps forward past disabled entries', () => {
    expect(nextEnabledIndex(options, 0, 1)).toBe(2);
  });

  it('wraps around the end', () => {
    expect(nextEnabledIndex(options, 2, 1)).toBe(0);
  });

  it('steps backward past disabled entries', () => {
    expect(nextEnabledIndex(options, 2, -1)).toBe(0);
  });

  it('returns -1 when nothing can be activated', () => {
    expect(nextEnabledIndex([option('x', 'x', true)], -1, 1)).toBe(-1);
    expect(nextEnabledIndex([], -1, 1)).toBe(-1);
  });
});

describe('readOptions', () => {
  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('reads value, label and disabled from option children', () => {
    const wrap = doc.createElement('div');
    wrap.innerHTML =
      '<option value="a">Alpha</option><option disabled>Beta</option>';
    const options = readOptions(wrap);

    expect(options[0]).toEqual({
      value: 'a',
      label: 'Alpha',
      disabled: false,
      group: '',
    });
    // Without an explicit value the label doubles as the value.
    expect(options[1]?.value).toBe('Beta');
    expect(options[1]?.disabled).toBe(true);
  });

  it('carries the optgroup label onto its options', () => {
    const wrap = doc.createElement('div');
    wrap.innerHTML =
      '<optgroup label="Fruit"><option value="a">Apple</option></optgroup>';
    expect(readOptions(wrap)[0]?.group).toBe('Fruit');
  });
});

describe('bq-combobox', () => {
  beforeAll(async () => {
    await import('../src/components/combobox/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (attrs: Record<string, string> = {}): HTMLElement => {
    const el = doc.createElement('bq-combobox');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.innerHTML = `
      <option value="apple">Apple</option>
      <option value="apricot">Apricot</option>
      <option value="banana" disabled>Banana</option>
      <option value="cherry">Cherry</option>`;
    doc.body.appendChild(el);
    return el;
  };

  const input = (el: HTMLElement): HTMLInputElement =>
    el.shadowRoot?.querySelector('input') as HTMLInputElement;

  const options = (el: HTMLElement): HTMLElement[] =>
    Array.from(el.shadowRoot?.querySelectorAll('.option') ?? []);

  const press = (el: HTMLElement, key: string) =>
    input(el).dispatchEvent(
      new win.KeyboardEvent('keydown', {
        key,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );

  it('registers as a custom element', () => {
    expect(win.customElements.get('bq-combobox')).toBeDefined();
  });

  it('exposes the ARIA combobox wiring', async () => {
    const el = create({ label: 'Fruit' });
    await waitForFrame();

    const field = input(el);
    const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
    expect(field.getAttribute('role')).toBe('combobox');
    expect(field.getAttribute('aria-expanded')).toBe('false');
    expect(field.getAttribute('aria-controls')).toBe(listbox?.id);
    expect(field.getAttribute('aria-autocomplete')).toBe('list');
  });

  it('mirrors light-DOM options into the listbox', async () => {
    const el = create();
    await waitForFrame();
    expect(options(el).map((o) => o.getAttribute('data-value'))).toEqual([
      'apple',
      'apricot',
      'banana',
      'cherry',
    ]);
  });

  it('opens on ArrowDown and activates the first enabled option', async () => {
    const el = create();
    await waitForFrame();

    press(el, 'ArrowDown');
    await waitForFrame();

    expect(input(el).getAttribute('aria-expanded')).toBe('true');
    expect(options(el)[0]?.getAttribute('data-active')).toBe('true');
  });

  it('skips disabled options when arrowing', async () => {
    const el = create();
    await waitForFrame();

    press(el, 'ArrowDown');
    await waitForFrame();
    press(el, 'ArrowDown');
    await waitForFrame();
    press(el, 'ArrowDown');
    await waitForFrame();

    // apple → apricot → (banana disabled) → cherry
    expect(options(el)[3]?.getAttribute('data-active')).toBe('true');
  });

  it('points aria-activedescendant at the active option', async () => {
    const el = create();
    await waitForFrame();
    press(el, 'ArrowDown');
    await waitForFrame();

    expect(input(el).getAttribute('aria-activedescendant')).toBe(
      options(el)[0]?.id
    );
  });

  it('filters as the user types', async () => {
    const el = create();
    await waitForFrame();

    const field = input(el);
    field.value = 'ap';
    field.dispatchEvent(new win.Event('input', { bubbles: true, composed: true }));
    await waitForFrame();

    expect(options(el).map((o) => o.getAttribute('data-value'))).toEqual([
      'apple',
      'apricot',
    ]);
  });

  it('shows an empty message when nothing matches', async () => {
    const el = create();
    await waitForFrame();

    const field = input(el);
    field.value = 'zzz';
    field.dispatchEvent(new win.Event('input', { bubbles: true, composed: true }));
    await waitForFrame();

    expect(options(el)).toHaveLength(0);
    expect(el.shadowRoot?.querySelector('.empty')?.textContent?.trim()).toBe(
      'No matches found'
    );
  });

  it('selects with Enter, closes, and emits bq-change', async () => {
    const el = create();
    await waitForFrame();

    let detail: { value: string; values: string[] } | null = null;
    el.addEventListener('bq-change', (event) => {
      detail = (event as CustomEvent<{ value: string; values: string[] }>)
        .detail;
    });

    press(el, 'ArrowDown');
    await waitForFrame();
    press(el, 'Enter');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('apple');
    expect(detail).toEqual({ value: 'apple', values: ['apple'] });
    expect(input(el).getAttribute('aria-expanded')).toBe('false');
    // The field shows the human-readable label, not the raw key.
    expect(input(el).value).toBe('Apple');
  });

  it('lets Enter through to the form when the list is closed', async () => {
    const el = create();
    await waitForFrame();

    const notPrevented = press(el, 'Enter');
    expect(notPrevented).toBe(true);
  });

  it('closes on Escape without changing the value', async () => {
    const el = create({ value: 'apple' });
    await waitForFrame();

    press(el, 'ArrowDown');
    await waitForFrame();
    press(el, 'Escape');
    await waitForFrame();

    expect(input(el).getAttribute('aria-expanded')).toBe('false');
    expect(el.getAttribute('value')).toBe('apple');
  });

  it('accumulates values and stays open in multiple mode', async () => {
    const el = create({ multiple: '' });
    await waitForFrame();

    press(el, 'ArrowDown');
    await waitForFrame();
    press(el, 'Enter');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('apple');
    expect(input(el).getAttribute('aria-expanded')).toBe('true');

    // The active index survives the selection, so one step lands on apricot.
    press(el, 'ArrowDown');
    await waitForFrame();
    press(el, 'Enter');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('apple,apricot');
  });

  it('deselects an already-selected value in multiple mode', async () => {
    const el = create({ multiple: '', value: 'apple' });
    await waitForFrame();

    press(el, 'ArrowDown');
    await waitForFrame();
    press(el, 'Enter');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('');
  });

  it('renders a token per selected value in multiple mode', async () => {
    const el = create({ multiple: '', value: 'apple,cherry' });
    await waitForFrame();

    const tokens = Array.from(el.shadowRoot?.querySelectorAll('.token') ?? []);
    expect(tokens.map((token) => token.textContent?.replace('×', '').trim())).toEqual([
      'Apple',
      'Cherry',
    ]);
  });

  it('removes the last token on Backspace with an empty query', async () => {
    const el = create({ multiple: '', value: 'apple,cherry' });
    await waitForFrame();

    input(el).value = '';
    press(el, 'Backspace');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('apple');
  });

  it('leaves tokens alone when the query is not empty', async () => {
    const el = create({ multiple: '', value: 'apple,cherry' });
    await waitForFrame();

    input(el).value = 'ch';
    press(el, 'Backspace');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('apple,cherry');
  });

  it('marks selected options with aria-selected', async () => {
    const el = create({ value: 'apricot' });
    await waitForFrame();
    press(el, 'ArrowDown');
    await waitForFrame();

    const selected = options(el).filter(
      (o) => o.getAttribute('aria-selected') === 'true'
    );
    expect(selected.map((o) => o.getAttribute('data-value'))).toEqual([
      'apricot',
    ]);
  });

  it('picks up options added after connection', async () => {
    const el = create();
    await waitForFrame();

    const extra = doc.createElement('option');
    extra.setAttribute('value', 'damson');
    extra.textContent = 'Damson';
    el.appendChild(extra);
    await waitForFrame();
    await waitForFrame();

    expect(options(el).map((o) => o.getAttribute('data-value'))).toContain(
      'damson'
    );
  });

  it('does not open while disabled', async () => {
    const el = create({ disabled: '' });
    await waitForFrame();

    press(el, 'ArrowDown');
    await waitForFrame();

    expect(input(el).getAttribute('aria-expanded')).toBe('false');
  });

  it('shows every option when no-filter is set', async () => {
    const el = create({ 'no-filter': '' });
    await waitForFrame();

    const field = input(el);
    field.value = 'zzz';
    field.dispatchEvent(new win.Event('input', { bubbles: true, composed: true }));
    await waitForFrame();

    expect(options(el)).toHaveLength(4);
  });

  it('participates in forms through a hidden proxy input', async () => {
    const form = doc.createElement('form');
    const el = doc.createElement('bq-combobox');
    el.setAttribute('name', 'fruit');
    el.setAttribute('value', 'apple');
    el.innerHTML = '<option value="apple">Apple</option>';
    form.appendChild(el);
    doc.body.appendChild(form);
    await waitForFrame();

    const proxy = form.querySelector(
      'input[data-bq-form-proxy]'
    ) as HTMLInputElement;
    expect(proxy).toBeTruthy();
    expect(proxy.name).toBe('fruit');
    expect(proxy.value).toBe('apple');
  });

  it('enforces required through the validation surface', async () => {
    const el = create({ required: '' }) as HTMLElement & {
      checkValidity(): boolean;
    };
    await waitForFrame();

    expect(el.checkValidity()).toBe(false);

    el.setAttribute('value', 'apple');
    await waitForFrame();
    expect(el.checkValidity()).toBe(true);
  });

  it('leaves no document listeners behind after removal', async () => {
    const el = create();
    await waitForFrame();
    press(el, 'ArrowDown');
    await waitForFrame();

    el.remove();
    await waitForFrame();

    // A stranded outside-click listener would throw when the shadow root is
    // gone; dispatching here proves the scope unwound it.
    expect(() =>
      doc.dispatchEvent(new win.Event('mousedown', { bubbles: true }))
    ).not.toThrow();
  });
});
