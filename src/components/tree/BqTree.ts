/**
 * Tree view — hierarchical navigation with the ARIA tree keyboard pattern.
 *
 * A tree is not a nested list of buttons: the whole widget is one tab stop,
 * and the arrow keys move a *roving* focus through the nodes that are actually
 * visible. Right opens a branch or descends into it, Left collapses or climbs
 * out, Home and End jump to the ends, and typing a letter jumps to the next
 * node starting with it. That is the entire reason this component exists —
 * markup alone gets none of it.
 *
 * Nodes are supplied as JSON, matching `bq-table`:
 *
 * ```html
 * <bq-tree items='[{"id":"src","label":"src","children":[{"id":"a","label":"a.ts"}]}]'></bq-tree>
 * ```
 *
 * @element bq-tree
 * @prop {string}  items       - JSON array of nodes
 * @prop {string}  expanded    - Comma-separated ids of open branches
 * @prop {string}  selected    - Selected node id
 * @prop {string}  label       - Accessible name for the tree
 * @prop {boolean} multiple    - Allow more than one selected node
 * @prop {boolean} disabled
 * @fires bq-select - { id: string, ids: string[], node: TreeNode }
 * @fires bq-expand - { id: string, expanded: boolean }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { bind, host, release } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { markFocus, restorePreservedFocus } from '../../utils/focus.js';
import { iconCss } from '../../utils/icons.js';
import { baseStyles, focusRing, reset } from '../../utils/styles.js';

/** One node of the tree. */
export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  disabled?: boolean;
  /** Icon name from the built-in set, drawn before the label. */
  icon?: string;
}

/** A node together with where it sits, as the keyboard walk sees it. */
export interface FlatNode {
  node: TreeNode;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
}

type BqTreeProps = {
  items: string;
  expanded: string;
  selected: string;
  label: string;
  multiple: boolean;
  disabled: boolean;
};

type BqTreeState = { uid: string; active: string };

/** Parses the `items` JSON, tolerating malformed input rather than throwing. */
export function parseNodes(raw: string): TreeNode[] {
  try {
    const parsed: unknown = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? (parsed as TreeNode[]) : [];
  } catch {
    return [];
  }
}

/** Splits a comma-separated id list. */
export function parseIds(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Flattens the tree to the nodes a user can currently reach.
 *
 * Collapsed branches contribute nothing, which is exactly what arrow-key
 * navigation needs: "the next node" means the next *visible* one, not the
 * next one in the data.
 */
export function visibleNodes(
  nodes: TreeNode[],
  expanded: Set<string>,
  level = 1,
  parentId: string | null = null
): FlatNode[] {
  const out: FlatNode[] = [];
  for (const node of nodes) {
    const children = node.children ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = hasChildren && expanded.has(node.id);
    out.push({ node, level, parentId, hasChildren, expanded: isExpanded });
    if (isExpanded) {
      out.push(...visibleNodes(children, expanded, level + 1, node.id));
    }
  }
  return out;
}

/** Steps to the next selectable node, skipping disabled ones. Clamps at the ends. */
export function stepNode(
  flat: FlatNode[],
  from: number,
  step: 1 | -1
): number {
  for (let i = from + step; i >= 0 && i < flat.length; i += step) {
    if (!flat[i]?.node.disabled) return i;
  }
  return from;
}

/** Finds the next node whose label starts with `char`, wrapping around. */
export function typeaheadIndex(
  flat: FlatNode[],
  from: number,
  char: string
): number {
  const needle = char.toLowerCase();
  for (let i = 1; i <= flat.length; i += 1) {
    const index = (from + i) % flat.length;
    const entry = flat[index];
    if (entry && !entry.node.disabled && entry.node.label.toLowerCase().startsWith(needle)) {
      return index;
    }
  }
  return from;
}

const definition: ComponentDefinition<BqTreeProps, BqTreeState> = {
  props: {
    items: { type: String, default: '[]' },
    expanded: { type: String, default: '' },
    selected: { type: String, default: '' },
    label: { type: String, default: '' },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  state: { uid: '', active: '' },
  sanitize: { allowAttributes: ['style'] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${focusRing}
    ${iconCss(
      'chevron-right',
      'folder',
      'file',
      'check',
      'circle',
      'dot',
      'home',
      'user',
      'users',
      'image',
      'mail',
      'settings',
      'star',
      'link'
    )}
    :host { display: block; }
    .tree {
      font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-sm, 0.875rem);
      color: var(--bq-text-base, #0f172a);
      list-style: none;
      margin: 0;
      padding: 0;
      outline: none;
    }
    .node {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      /* One shared indent unit keeps the guide rails aligned no matter how
         deep the tree goes. */
      padding-block: 0.3125rem;
      padding-inline: calc(0.5rem + (var(--bq-tree-level, 1) - 1) * var(--bq-tree-indent, 1.125rem)) 0.5rem;
      border-radius: var(--bq-radius-md, 0.375rem);
      cursor: pointer;
      user-select: none;
      -webkit-user-select: none;
      transition: background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .node:hover { background: var(--bq-bg-hover, rgba(15,23,42,0.04)); }
    .node[aria-selected='true'] {
      background: var(--bq-bg-selected, rgba(37,99,235,0.1));
      color: var(--bq-color-primary-700, #1d4ed8);
      font-weight: var(--bq-font-weight-medium, 500);
    }
    .node[aria-disabled='true'] { opacity: 0.5; cursor: not-allowed; }
    .tree:focus-visible .node[data-active='true'],
    .node[data-active='true']:focus-visible {
      outline: 2px solid transparent;
      box-shadow: var(--bq-focus-ring);
    }
    .twisty {
      flex: none;
      inline-size: 1rem;
      block-size: 1rem;
      display: grid;
      place-items: center;
      color: var(--bq-text-subtle, #94a3b8);
      --bq-icon-size: 0.875rem;
      transition: transform var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .node[aria-expanded='true'] .twisty { transform: rotate(90deg); }
    /* An RTL tree opens leftwards, so the collapsed arrow has to start
       pointing the other way. */
    :host(:dir(rtl)) .twisty { transform: rotate(180deg); }
    :host(:dir(rtl)) .node[aria-expanded='true'] .twisty { transform: rotate(90deg); }
    .node-icon { flex: none; color: var(--bq-text-muted, #475569); --bq-icon-size: 1rem; }
    .node[aria-selected='true'] .node-icon { color: inherit; }
    .node-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .group { list-style: none; margin: 0; padding: 0; }
  `,
  connected() {
    const self = host<BqTreeState>(this);
    const scope = bind(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-tree'));

    const nodes = () => parseNodes(self.getAttribute('items') ?? '[]');
    const expandedSet = () =>
      new Set(parseIds(self.getAttribute('expanded') ?? ''));
    const flat = () => visibleNodes(nodes(), expandedSet());
    const isInteractive = () => !self.hasAttribute('disabled');

    const activeIndex = (list: FlatNode[]): number => {
      const active = self.getState<string>('active');
      const found = list.findIndex((entry) => entry.node.id === active);
      if (found >= 0) return found;
      return list.findIndex((entry) => !entry.node.disabled);
    };

    const setActive = (list: FlatNode[], index: number) => {
      const entry = list[index];
      if (!entry) return;
      markFocus(self);
      self.setState('active', entry.node.id);
    };

    const setExpanded = (id: string, open: boolean) => {
      const set = expandedSet();
      if (open === set.has(id)) return;
      if (open) set.add(id);
      else set.delete(id);
      markFocus(self);
      self.setAttribute('expanded', Array.from(set).join(','));
      self.dispatchEvent(
        new CustomEvent('bq-expand', {
          detail: { id, expanded: open },
          bubbles: true,
          composed: true,
        })
      );
    };

    const select = (entry: FlatNode) => {
      if (entry.node.disabled) return;
      const id = entry.node.id;
      let ids: string[];
      if (self.hasAttribute('multiple')) {
        const current = parseIds(self.getAttribute('selected') ?? '');
        ids = current.includes(id)
          ? current.filter((value) => value !== id)
          : [...current, id];
      } else {
        ids = [id];
      }
      markFocus(self);
      self.setState('active', id);
      self.setAttribute('selected', ids.join(','));
      self.dispatchEvent(
        new CustomEvent('bq-select', {
          detail: { id, ids, node: entry.node },
          bubbles: true,
          composed: true,
        })
      );
    };

    const entryFor = (target: Element | null): FlatNode | undefined => {
      const row = target?.closest('.node') as HTMLElement | null;
      if (!row) return undefined;
      const id = row.getAttribute('data-id');
      return flat().find((entry) => entry.node.id === id);
    };

    scope.on(self.shadowRoot, 'click', (event) => {
      if (!isInteractive()) return;
      const target = event.target as Element;
      const entry = entryFor(target);
      if (!entry) return;
      // The twisty is a separate affordance: clicking it opens a branch
      // without selecting it, which is how every file tree behaves.
      if (target.closest('.twisty') && entry.hasChildren) {
        setExpanded(entry.node.id, !entry.expanded);
        self.setState('active', entry.node.id);
        return;
      }
      if (entry.hasChildren && !entry.expanded) setExpanded(entry.node.id, true);
      select(entry);
    });

    scope.on(self.shadowRoot, 'keydown', (event) => {
      const ke = event as KeyboardEvent;
      if (!isInteractive()) return;
      const list = flat();
      if (list.length === 0) return;
      const index = activeIndex(list);
      const entry = list[index];

      switch (ke.key) {
        case 'ArrowDown':
          ke.preventDefault();
          setActive(list, stepNode(list, index, 1));
          return;
        case 'ArrowUp':
          ke.preventDefault();
          setActive(list, stepNode(list, index, -1));
          return;
        case 'ArrowRight':
          ke.preventDefault();
          if (!entry) return;
          if (entry.hasChildren && !entry.expanded) {
            setExpanded(entry.node.id, true);
            return;
          }
          if (entry.hasChildren) setActive(list, stepNode(list, index, 1));
          return;
        case 'ArrowLeft': {
          ke.preventDefault();
          if (!entry) return;
          if (entry.expanded) {
            setExpanded(entry.node.id, false);
            return;
          }
          // A collapsed node climbs to its parent, so Left repeatedly walks
          // out of a deep branch instead of doing nothing.
          const parent = list.findIndex(
            (candidate) => candidate.node.id === entry.parentId
          );
          if (parent >= 0) setActive(list, parent);
          return;
        }
        case 'Home':
          ke.preventDefault();
          setActive(list, stepNode(list, -1, 1));
          return;
        case 'End':
          ke.preventDefault();
          setActive(list, stepNode(list, list.length, -1));
          return;
        case 'Enter':
        case ' ':
          ke.preventDefault();
          if (entry) select(entry);
          return;
        case '*': {
          // Expand every sibling of the active node — the pattern's shortcut
          // for "show me this whole level".
          ke.preventDefault();
          if (!entry) return;
          const set = expandedSet();
          for (const candidate of list) {
            if (candidate.parentId === entry.parentId && candidate.hasChildren) {
              set.add(candidate.node.id);
            }
          }
          markFocus(self);
          self.setAttribute('expanded', Array.from(set).join(','));
          return;
        }
        default:
          if (ke.key.length === 1 && !ke.ctrlKey && !ke.metaKey && !ke.altKey) {
            const next = typeaheadIndex(list, index, ke.key);
            if (next !== index) {
              ke.preventDefault();
              setActive(list, next);
            }
          }
      }
    });
  },
  disconnected() {
    release(this);
  },
  beforeUpdate() {
    markFocus(this);
  },
  updated() {
    restorePreservedFocus(this);
    // The roving tab stop has to end up on the node the keyboard moved to.
    // bQuery >= 1.18 patches the tree in place, so the node that had focus
    // keeps it; older releases replaced it and `restorePreservedFocus` put
    // focus back on its stand-in. Either way focus still sits on the old
    // node, so move it whenever it is on a node other than the active one.
    const root = this.shadowRoot;
    const active = root?.querySelector(
      '.node[data-active="true"]'
    ) as HTMLElement | null;
    const focused = root?.activeElement as HTMLElement | null | undefined;
    const focusInTree = focused
      ? focused.classList.contains('node')
      : this.matches(':focus-within');
    if (active && focused !== active && focusInTree) {
      active.focus();
    }
    active?.scrollIntoView?.({ block: 'nearest' });
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-tree';
    const nodes = parseNodes(props.items);
    const expanded = new Set(parseIds(props.expanded));
    const selected = new Set(parseIds(props.selected));
    const flat = visibleNodes(nodes, expanded);

    // Exactly one node is in the tab order; the arrow keys move it. Without
    // that, tabbing through a large tree means every node is a stop.
    const activeId =
      flat.find((entry) => entry.node.id === state.active)?.node.id ??
      flat.find((entry) => selected.has(entry.node.id))?.node.id ??
      flat.find((entry) => !entry.node.disabled)?.node.id ??
      '';

    const renderLevel = (list: TreeNode[], level: number): string =>
      list
        .map((node) => {
          const children = node.children ?? [];
          const hasChildren = children.length > 0;
          const isExpanded = hasChildren && expanded.has(node.id);
          const isSelected = selected.has(node.id);
          const isActive = node.id === activeId;
          const icon = typeof node.icon === 'string' ? node.icon : '';
          return `<li role="none">
            <div
              class="node"
              part="node"
              role="treeitem"
              id="${escapeHtml(`${uid}-${node.id}`)}"
              data-id="${escapeHtml(node.id)}"
              data-active="${isActive ? 'true' : 'false'}"
              style="--bq-tree-level: ${level}"
              tabindex="${isActive ? '0' : '-1'}"
              aria-level="${level}"
              aria-selected="${isSelected ? 'true' : 'false'}"
              ${hasChildren ? `aria-expanded="${isExpanded ? 'true' : 'false'}"` : ''}
              ${node.disabled ? 'aria-disabled="true"' : ''}
            >
              ${
                hasChildren
                  ? `<span class="twisty" part="twisty" aria-hidden="true"><span class="icon" data-icon="chevron-right"></span></span>`
                  : '<span class="twisty" aria-hidden="true"></span>'
              }
              ${icon ? `<span class="icon node-icon" data-icon="${escapeHtml(icon)}" aria-hidden="true"></span>` : ''}
              <span class="node-label" part="label">${escapeHtml(node.label)}</span>
            </div>
            ${
              isExpanded
                ? `<ul class="group" role="group">${renderLevel(children, level + 1)}</ul>`
                : ''
            }
          </li>`;
        })
        .join('');

    return html`
      <ul
        class="tree"
        part="tree"
        role="tree"
        ${props.label ? `aria-label="${escapeHtml(props.label)}"` : ''}
        ${props.multiple ? 'aria-multiselectable="true"' : ''}
        ${props.disabled ? 'aria-disabled="true"' : ''}
      >
        ${renderLevel(nodes, 1)}
      </ul>
    `;
  },
};

component<BqTreeProps, BqTreeState>('bq-tree', definition);
