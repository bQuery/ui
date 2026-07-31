// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { addTag, parseTags } from '../src/components/tag-input/BqTagInput.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('parseTags', () => {
  it('splits, trims and drops empties', () => {
    expect(parseTags(' a , b ,, c ')).toEqual(['a', 'b', 'c']);
    expect(parseTags('')).toEqual([]);
  });

  it('honours a custom separator', () => {
    expect(parseTags('a|b|c', '|')).toEqual(['a', 'b', 'c']);
  });
});

describe('addTag', () => {
  it('appends a trimmed tag', () => {
    expect(addTag(['a'], '  b  ')).toEqual(['a', 'b']);
  });

  it('rejects blank input', () => {
    expect(addTag(['a'], '   ')).toBeNull();
  });

  it('rejects duplicates by default', () => {
    expect(addTag(['a'], 'a')).toBeNull();
  });

  it('allows duplicates when asked', () => {
    expect(addTag(['a'], 'a', { allowDuplicates: true })).toEqual(['a', 'a']);
  });

  it('rejects once the maximum is reached', () => {
    expect(addTag(['a', 'b'], 'c', { max: 2 })).toBeNull();
    expect(addTag(['a'], 'b', { max: 2 })).toEqual(['a', 'b']);
  });

  it('treats max 0 as unlimited', () => {
    expect(addTag(['a', 'b', 'c'], 'd', { max: 0 })).toHaveLength(4);
  });

  it('does not mutate the input array', () => {
    const tags = ['a'];
    addTag(tags, 'b');
    expect(tags).toEqual(['a']);
  });
});

describe('bq-tag-input', () => {
  beforeAll(async () => {
    await import('../src/components/tag-input/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (attrs: Record<string, string> = {}): HTMLElement => {
    const el = doc.createElement('bq-tag-input');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    doc.body.appendChild(el);
    return el;
  };

  const input = (el: HTMLElement): HTMLInputElement =>
    el.shadowRoot?.querySelector('input') as HTMLInputElement;

  const tags = (el: HTMLElement): string[] =>
    Array.from(el.shadowRoot?.querySelectorAll('.tag') ?? []).map((tag) =>
      tag.textContent?.replace('×', '').trim() ?? ''
    );

  const type = (el: HTMLElement, text: string) => {
    const field = input(el);
    field.value = text;
    field.dispatchEvent(
      new win.Event('input', { bubbles: true, composed: true })
    );
  };

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
    expect(win.customElements.get('bq-tag-input')).toBeDefined();
  });

  it('renders existing tags from the value', async () => {
    const el = create({ value: 'red,green' });
    await waitForFrame();
    expect(tags(el)).toEqual(['red', 'green']);
  });

  it('commits a tag on Enter and clears the draft', async () => {
    const el = create();
    await waitForFrame();

    let added = '';
    el.addEventListener('bq-add', (event) => {
      added = (event as CustomEvent<{ tag: string }>).detail.tag;
    });

    type(el, 'alpha');
    press(el, 'Enter');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('alpha');
    expect(added).toBe('alpha');
    expect(input(el).value).toBe('');
  });

  it('lets Enter through when the draft is empty', async () => {
    const el = create();
    await waitForFrame();
    expect(press(el, 'Enter')).toBe(true);
  });

  it('splits on a delimiter typed mid-string', async () => {
    const el = create();
    await waitForFrame();

    type(el, 'a,b,c');
    await waitForFrame();

    // Trailing segment stays in the field as the in-progress draft.
    expect(el.getAttribute('value')).toBe('a,b');
    expect(input(el).value).toBe('c');
  });

  it('supports custom delimiters', async () => {
    const el = create({ delimiters: ';' });
    await waitForFrame();

    type(el, 'x;y');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('x');
  });

  it('removes the last tag on Backspace with an empty draft', async () => {
    const el = create({ value: 'a,b' });
    await waitForFrame();

    let removed = '';
    el.addEventListener('bq-remove', (event) => {
      removed = (event as CustomEvent<{ tag: string }>).detail.tag;
    });

    input(el).value = '';
    press(el, 'Backspace');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('a');
    expect(removed).toBe('b');
  });

  it('leaves tags alone when Backspace has a draft to delete', async () => {
    const el = create({ value: 'a,b' });
    await waitForFrame();

    input(el).value = 'draft';
    press(el, 'Backspace');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('a,b');
  });

  it('removes a tag through its remove button', async () => {
    const el = create({ value: 'a,b,c' });
    await waitForFrame();

    const button = el.shadowRoot?.querySelectorAll(
      '.tag button'
    )[1] as HTMLElement;
    button.click();
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('a,c');
  });

  it('names each remove button after its tag', async () => {
    const el = create({ value: 'urgent' });
    await waitForFrame();

    const button = el.shadowRoot?.querySelector('.tag button');
    expect(button?.getAttribute('aria-label')).toBe('Remove urgent');
  });

  it('rejects duplicates unless allowed', async () => {
    const el = create({ value: 'a' });
    await waitForFrame();

    type(el, 'a');
    press(el, 'Enter');
    await waitForFrame();
    expect(el.getAttribute('value')).toBe('a');

    el.setAttribute('allow-duplicates', '');
    type(el, 'a');
    press(el, 'Enter');
    await waitForFrame();
    expect(el.getAttribute('value')).toBe('a,a');
  });

  it('stops accepting input at the maximum', async () => {
    const el = create({ value: 'a,b', max: '2' });
    await waitForFrame();

    expect(input(el).disabled).toBe(true);
    expect(el.shadowRoot?.querySelector('.count')?.textContent).toBe('2/2');
  });

  it('clears the draft on Escape', async () => {
    const el = create();
    await waitForFrame();

    type(el, 'half-typed');
    press(el, 'Escape');
    await waitForFrame();

    expect(input(el).value).toBe('');
    expect(el.getAttribute('value')).toBe('');
  });

  it('commits a pending draft on blur rather than discarding it', async () => {
    const el = create();
    await waitForFrame();

    type(el, 'pending');
    input(el).dispatchEvent(
      new win.Event('focusout', { bubbles: true, composed: true })
    );
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('pending');
  });

  it('emits bq-change with the parsed tags', async () => {
    const el = create();
    await waitForFrame();

    let detail: { value: string; tags: string[] } | null = null;
    el.addEventListener('bq-change', (event) => {
      detail = (event as CustomEvent<{ value: string; tags: string[] }>).detail;
    });

    type(el, 'one');
    press(el, 'Enter');
    await waitForFrame();

    expect(detail).toEqual({ value: 'one', tags: ['one'] });
  });

  it('ignores interaction while disabled', async () => {
    const el = create({ disabled: '', value: 'a' });
    await waitForFrame();

    press(el, 'Backspace');
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('a');
  });

  it('participates in forms and enforces required', async () => {
    const form = doc.createElement('form');
    const el = doc.createElement('bq-tag-input') as HTMLElement & {
      checkValidity(): boolean;
    };
    el.setAttribute('name', 'labels');
    el.setAttribute('required', '');
    form.appendChild(el);
    doc.body.appendChild(form);
    await waitForFrame();

    expect(el.checkValidity()).toBe(false);

    el.setAttribute('value', 'bug');
    await waitForFrame();

    const proxy = form.querySelector(
      'input[data-bq-form-proxy]'
    ) as HTMLInputElement;
    expect(proxy.name).toBe('labels');
    expect(proxy.value).toBe('bug');
    expect(el.checkValidity()).toBe(true);
  });

  it('keeps focus in the field while typing', async () => {
    const el = create();
    await waitForFrame();

    const field = input(el);
    field.focus();
    type(el, 'abc');
    await waitForFrame();

    expect(el.shadowRoot?.activeElement).toBe(
      el.shadowRoot?.querySelector('input') as Element
    );
  });
});
