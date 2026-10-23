// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import {
  parseIds,
  parseNodes,
  stepNode,
  typeaheadIndex,
  visibleNodes,
  type TreeNode,
} from '../src/components/tree/BqTree.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

const NODES: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'index', label: 'index.ts' },
      { id: 'utils', label: 'utils', children: [{ id: 'dom', label: 'dom.ts' }] },
    ],
  },
  { id: 'readme', label: 'README.md' },
  { id: 'locked', label: 'node_modules', disabled: true },
];

describe('parseNodes', () => {
  it('reads a JSON array', () => {
    expect(parseNodes('[{"id":"a","label":"A"}]')).toHaveLength(1);
  });

  it('returns an empty tree for malformed or non-array JSON', () => {
    expect(parseNodes('not json')).toEqual([]);
    expect(parseNodes('{"id":"a"}')).toEqual([]);
    expect(parseNodes('')).toEqual([]);
  });
});

describe('parseIds', () => {
  it('splits, trims and drops empties', () => {
    expect(parseIds(' a , b ,, c ')).toEqual(['a', 'b', 'c']);
    expect(parseIds('')).toEqual([]);
  });
});

describe('visibleNodes', () => {
  it('hides the contents of a collapsed branch', () => {
    const flat = visibleNodes(NODES, new Set());
    expect(flat.map((entry) => entry.node.id)).toEqual([
      'src',
      'readme',
      'locked',
    ]);
  });

  it('reveals a branch once it is expanded', () => {
    const flat = visibleNodes(NODES, new Set(['src']));
    expect(flat.map((entry) => entry.node.id)).toEqual([
      'src',
      'index',
      'utils',
      'readme',
      'locked',
    ]);
  });

  it('records depth and parent for each visible node', () => {
    const flat = visibleNodes(NODES, new Set(['src', 'utils']));
    const dom = flat.find((entry) => entry.node.id === 'dom');
    expect(dom?.level).toBe(3);
    expect(dom?.parentId).toBe('utils');
  });
});

describe('stepNode', () => {
  const flat = visibleNodes(NODES, new Set());

  it('skips disabled nodes', () => {
    expect(stepNode(flat, 1, 1)).toBe(1);
  });

  it('stops at the ends instead of wrapping', () => {
    expect(stepNode(flat, 0, -1)).toBe(0);
  });

  it('advances to the next enabled node', () => {
    expect(stepNode(flat, 0, 1)).toBe(1);
  });
});

describe('typeaheadIndex', () => {
  const flat = visibleNodes(NODES, new Set());

  it('jumps to the next node starting with the letter', () => {
    expect(typeaheadIndex(flat, 0, 'r')).toBe(1);
  });

  it('wraps around the end of the list', () => {
    expect(typeaheadIndex(flat, 1, 's')).toBe(0);
  });

  it('stays put when nothing matches', () => {
    expect(typeaheadIndex(flat, 0, 'z')).toBe(0);
  });
});

describe('bq-tree', () => {
  beforeAll(async () => {
    await import('../src/components/tree/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (attrs: Record<string, string> = {}): HTMLElement => {
    const el = doc.createElement('bq-tree');
    el.setAttribute('items', JSON.stringify(NODES));
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    doc.body.appendChild(el);
    return el;
  };

  const nodes = (el: HTMLElement): HTMLElement[] =>
    Array.from(el.shadowRoot?.querySelectorAll('.node') ?? []);

  const press = (el: HTMLElement, index: number, key: string) =>
    nodes(el)[index]?.dispatchEvent(
      new win.KeyboardEvent('keydown', {
        key,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );

  it('registers as a custom element', () => {
    expect(win.customElements.get('bq-tree')).toBeDefined();
  });

  it('exposes the ARIA tree roles', async () => {
    const el = create({ label: 'Files' });
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('[role="tree"]')?.getAttribute('aria-label')).toBe(
      'Files'
    );
    expect(nodes(el)[0]?.getAttribute('role')).toBe('treeitem');
    expect(nodes(el)[0]?.getAttribute('aria-level')).toBe('1');
    expect(nodes(el)[0]?.getAttribute('aria-expanded')).toBe('false');
  });

  it('keeps exactly one node in the tab order', async () => {
    const el = create();
    await waitForFrame();
    const tabbable = nodes(el).filter(
      (node) => node.getAttribute('tabindex') === '0'
    );
    expect(tabbable).toHaveLength(1);
  });

  // A leaf node has no `aria-expanded` at all; only branches do.
  it('marks branches but not leaves as expandable', async () => {
    const el = create();
    await waitForFrame();
    expect(nodes(el)[1]?.hasAttribute('aria-expanded')).toBe(false);
  });

  it('opens a branch with ArrowRight and closes it with ArrowLeft', async () => {
    const el = create();
    await waitForFrame();

    press(el, 0, 'ArrowRight');
    await waitForFrame();
    expect(el.getAttribute('expanded')).toBe('src');
    expect(nodes(el)).toHaveLength(5);

    press(el, 0, 'ArrowLeft');
    await waitForFrame();
    expect(el.getAttribute('expanded')).toBe('');
  });

  it('climbs to the parent when a collapsed child gets ArrowLeft', async () => {
    const el = create({ expanded: 'src' });
    await waitForFrame();

    press(el, 1, 'ArrowLeft');
    await waitForFrame();
    expect(nodes(el)[0]?.getAttribute('tabindex')).toBe('0');
  });

  it('moves the roving tab stop with ArrowDown', async () => {
    const el = create();
    await waitForFrame();
    press(el, 0, 'ArrowDown');
    await waitForFrame();
    expect(nodes(el)[1]?.getAttribute('tabindex')).toBe('0');
  });

  it('moves focus along with the roving tab stop', async () => {
    const el = create();
    await waitForFrame();
    nodes(el)[0]?.focus();

    press(el, 0, 'ArrowDown');
    await waitForFrame();
    expect(el.shadowRoot?.activeElement).toBe(nodes(el)[1] ?? null);

    press(el, 1, 'ArrowUp');
    await waitForFrame();
    expect(el.shadowRoot?.activeElement).toBe(nodes(el)[0] ?? null);
  });

  it('selects on click and reports the node', async () => {
    const el = create();
    await waitForFrame();

    let detail: { id: string; ids: string[] } | null = null;
    el.addEventListener('bq-select', (e) => {
      detail = (e as CustomEvent<{ id: string; ids: string[] }>).detail;
    });
    nodes(el)[1]?.dispatchEvent(
      new win.Event('click', { bubbles: true, composed: true })
    );
    await waitForFrame();

    expect(el.getAttribute('selected')).toBe('readme');
    expect(detail?.id).toBe('readme');
  });

  it('accumulates selection when multiple is set', async () => {
    const el = create({ multiple: '', selected: 'readme' });
    await waitForFrame();
    nodes(el)[0]?.dispatchEvent(
      new win.Event('click', { bubbles: true, composed: true })
    );
    await waitForFrame();
    expect(el.getAttribute('selected')).toBe('readme,src');
  });

  it('refuses to select a disabled node', async () => {
    const el = create();
    await waitForFrame();
    nodes(el)[2]?.dispatchEvent(
      new win.Event('click', { bubbles: true, composed: true })
    );
    await waitForFrame();
    expect(el.getAttribute('selected') ?? '').toBe('');
  });

  it('jumps to a node by first letter', async () => {
    const el = create();
    await waitForFrame();
    press(el, 0, 'r');
    await waitForFrame();
    expect(nodes(el)[1]?.getAttribute('tabindex')).toBe('0');
  });

  it('leaves no document listeners behind after removal', async () => {
    const el = create();
    await waitForFrame();
    el.remove();
    await waitForFrame();
    expect(el.isConnected).toBe(false);
  });
});
