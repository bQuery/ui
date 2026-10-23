// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { captureFocus, restoreFocus } from '../src/utils/focus.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('captureFocus / restoreFocus', () => {
  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const makeRoot = (markup: string): ShadowRoot => {
    const host = doc.createElement('div');
    doc.body.appendChild(host);
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = markup;
    return root;
  };

  it('returns null when nothing inside is focused', () => {
    const root = makeRoot('<input part="input" />');
    expect(captureFocus(root)).toBeNull();
  });

  it('identifies the focused element by its part', () => {
    const root = makeRoot('<input part="input" class="x" />');
    const input = root.querySelector('input') as HTMLInputElement;
    input.focus();

    const snapshot = captureFocus(root);
    expect(snapshot?.selector).toBe('[part~="input"]');
  });

  it('falls back to id, then to tag and classes', () => {
    const byId = makeRoot('<input id="field" />');
    (byId.querySelector('input') as HTMLInputElement).focus();
    expect(captureFocus(byId)?.selector).toBe('[id="field"]');

    const byClass = makeRoot('<textarea class="body tall"></textarea>');
    (byClass.querySelector('textarea') as HTMLTextAreaElement).focus();
    expect(captureFocus(byClass)?.selector).toBe('textarea.body.tall');
  });

  it('restores focus and the caret onto the replacement node', () => {
    const root = makeRoot('<input part="input" value="hello" />');
    const input = root.querySelector('input') as HTMLInputElement;
    input.focus();
    input.setSelectionRange(3, 3);

    const snapshot = captureFocus(root);
    // Stand in for a re-render: the old node is gone, a new one takes over.
    root.innerHTML = '<input part="input" value="hello" />';
    expect(root.activeElement).toBeFalsy();

    expect(restoreFocus(root, snapshot)).toBe(true);
    const next = root.querySelector('input') as HTMLInputElement;
    expect(root.activeElement).toBe(next);
    expect(next.selectionStart).toBe(3);
  });

  it('does not steal focus when the tree already has some', () => {
    const root = makeRoot('<input part="input" /><input part="other" />');
    const first = root.querySelector('[part~="input"]') as HTMLInputElement;
    first.focus();
    const snapshot = captureFocus(root);

    const other = root.querySelector('[part~="other"]') as HTMLInputElement;
    other.focus();

    expect(restoreFocus(root, snapshot)).toBe(false);
    expect(root.activeElement).toBe(other);
  });

  it('is a no-op when the element no longer exists', () => {
    const root = makeRoot('<input part="input" />');
    (root.querySelector('input') as HTMLInputElement).focus();
    const snapshot = captureFocus(root);

    root.innerHTML = '<span>gone</span>';
    expect(restoreFocus(root, snapshot)).toBe(false);
  });

  it('tolerates a null root or snapshot', () => {
    expect(restoreFocus(null, null)).toBe(false);
    expect(captureFocus(null)).toBeNull();
  });
});

describe('form controls survive a re-render while focused', () => {
  beforeAll(async () => {
    await import('../src/components/input/index.js');
    await import('../src/components/textarea/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('keeps focus in bq-input when the value attribute changes', async () => {
    const el = doc.createElement('bq-input');
    doc.body.appendChild(el);
    await waitForFrame();

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.focus();
    expect(el.shadowRoot?.activeElement).toBe(input);

    // Reflecting a keystroke re-renders the shadow tree. bQuery >= 1.18
    // patches the existing nodes in place; older releases replaced the node
    // the user was typing into, and `restorePreservedFocus` moved focus onto
    // its replacement. Either way the field the user sees keeps focus.
    el.setAttribute('value', 'abc');
    await waitForFrame();

    const next = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(next.value).toBe('abc');
    expect(el.shadowRoot?.activeElement).toBe(next);
  });

  it('keeps the caret position across the re-render', async () => {
    const el = doc.createElement('bq-input');
    el.setAttribute('value', 'hello world');
    doc.body.appendChild(el);
    await waitForFrame();

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.focus();
    input.setSelectionRange(5, 5);

    el.setAttribute('value', 'hello brave world');
    await waitForFrame();

    const next = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(next.selectionStart).toBe(5);
  });

  it('keeps focus in bq-textarea when the value attribute changes', async () => {
    const el = doc.createElement('bq-textarea');
    doc.body.appendChild(el);
    await waitForFrame();

    const ta = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
    ta.focus();

    el.setAttribute('value', 'typed');
    await waitForFrame();

    const next = el.shadowRoot?.querySelector(
      'textarea'
    ) as HTMLTextAreaElement;
    expect(el.shadowRoot?.activeElement).toBe(next);
  });

  it('leaves focus alone when the control was not focused', async () => {
    const outside = doc.createElement('button');
    doc.body.appendChild(outside);
    const el = doc.createElement('bq-input');
    doc.body.appendChild(el);
    await waitForFrame();

    outside.focus();
    el.setAttribute('value', 'changed');
    await waitForFrame();

    expect(el.shadowRoot?.activeElement).toBeFalsy();
  });
});
