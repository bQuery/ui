/**
 * Command palette — a modal search box for jumping to pages and running actions.
 *
 * Commands are declared as light-DOM `<option>` elements (optionally inside
 * `<optgroup label="…">`), the same data source `bq-select` and
 * `bq-combobox` use:
 *
 * ```html
 * <bq-command-palette hotkey="mod+k">
 *   <optgroup label="Navigation">
 *     <option value="home" data-shortcut="G H" data-keywords="start dashboard">Go home</option>
 *   </optgroup>
 * </bq-command-palette>
 * ```
 *
 * The search field follows the ARIA 1.2 combobox pattern: focus stays in the
 * field while the arrow keys move `aria-activedescendant` through the results.
 * Matching is case- and diacritic-insensitive and ranks results — a label that
 * starts with the query beats a word that starts with it, which beats a plain
 * substring, which beats a fuzzy (in-order letters) match — and also searches
 * each command's `data-keywords` and group.
 *
 * @element bq-command-palette
 * @prop {boolean} open        - Whether the palette is shown
 * @prop {string}  hotkey      - Global shortcut that toggles it, e.g. `mod+k` (mod = ⌘ on Apple, Ctrl elsewhere); empty disables
 * @prop {string}  placeholder - Search field placeholder
 * @prop {string}  label       - Accessible name of the dialog
 * @prop {boolean} keep-open   - Stay open after a command is chosen
 * @slot - `<option>` / `<optgroup>` elements (data source)
 * @slot empty  - Custom content when nothing matches
 * @slot footer - Content below the results, e.g. key hints
 * @fires bq-select - { value: string, label: string } — cancelable; cancel to keep the palette open
 * @fires bq-input  - { query: string }
 * @fires bq-open
 * @fires bq-close
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import type { OverlayFocusState } from '../../utils/dom.js';
import {
  cleanupOverlayFocus,
  createAnimatedClose,
  uniqueId,
  updateOverlayFocus,
} from '../../utils/dom.js';
import {
  markFocus,
  restorePreservedFocus,
  trackFocus,
} from '../../utils/focus.js';
import { iconCss } from '../../utils/icons.js';
import { baseStyles, focusRing, reset, srOnly } from '../../utils/styles.js';

type BqCommandPaletteProps = {
  open: boolean;
  hotkey: string;
  placeholder: string;
  label: string;
  'keep-open': boolean;
};

/** A single command, read from a light-DOM `<option>`. */
export interface PaletteCommand {
  value: string;
  label: string;
  group: string;
  keywords: string;
  shortcut: string;
  description: string;
  disabled: boolean;
}

type BqCommandPaletteState = {
  uid: string;
  query: string;
  activeIndex: number;
  commands: PaletteCommand[];
};

/** Reads the declarative `<option>` / `<optgroup>` children. */
export function readCommands(el: Element): PaletteCommand[] {
  const commands: PaletteCommand[] = [];
  const visit = (parent: Element, group: string) => {
    for (const child of Array.from(parent.children)) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'optgroup') {
        visit(child, child.getAttribute('label') ?? '');
        continue;
      }
      if (tag !== 'option') continue;
      const label = child.textContent?.trim() ?? '';
      commands.push({
        value: child.getAttribute('value') ?? label,
        label,
        group,
        keywords: child.getAttribute('data-keywords') ?? '',
        shortcut: child.getAttribute('data-shortcut') ?? '',
        description: child.getAttribute('data-description') ?? '',
        disabled: child.hasAttribute('disabled'),
      });
    }
  };
  visit(el, '');
  return commands;
}

function sameCommands(a: PaletteCommand[], b: PaletteCommand[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((cmd, i) => {
    const other = b[i];
    return (
      other !== undefined &&
      cmd.value === other.value &&
      cmd.label === other.label &&
      cmd.group === other.group &&
      cmd.keywords === other.keywords &&
      cmd.shortcut === other.shortcut &&
      cmd.description === other.description &&
      cmd.disabled === other.disabled
    );
  });
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** True when every character of `needle` appears in `haystack`, in order. */
function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0;
  for (const ch of haystack) {
    if (ch === needle[i]) i += 1;
    if (i === needle.length) return true;
  }
  return needle.length === 0;
}

/**
 * Scores how well `query` matches a command; 0 means no match.
 * Label matches outrank keyword and group matches at every tier.
 */
export function scoreCommand(command: PaletteCommand, query: string): number {
  const needle = normalize(query);
  if (!needle) return 1;
  const label = normalize(command.label);
  const extra = normalize(
    `${command.keywords} ${command.group} ${command.description}`
  );

  if (label.startsWith(needle)) return 100;
  if (label.split(/[\s\-_/]+/).some((word) => word.startsWith(needle))) return 80;
  if (label.includes(needle)) return 60;
  if (extra.split(/[\s\-_/,]+/).some((word) => word.startsWith(needle))) return 40;
  if (extra.includes(needle)) return 30;
  if (isSubsequence(needle.replace(/\s+/g, ''), label.replace(/\s+/g, ''))) return 10;
  return 0;
}

/**
 * Filters and ranks commands. With an empty query the declared order (and
 * therefore the grouping) is kept; otherwise results are sorted by score,
 * ties keeping their declared order.
 */
export function filterCommands(
  commands: PaletteCommand[],
  query: string
): PaletteCommand[] {
  if (!normalize(query)) return commands;
  return commands
    .map((command, index) => ({ command, index, score: scoreCommand(command, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.command);
}

/** Moves an index past disabled commands, wrapping. Returns -1 if none is enabled. */
export function nextEnabled(
  commands: PaletteCommand[],
  from: number,
  step: 1 | -1
): number {
  if (commands.length === 0) return -1;
  let index = from;
  for (let i = 0; i < commands.length; i += 1) {
    index = (index + step + commands.length) % commands.length;
    if (!commands[index]?.disabled) return index;
  }
  return -1;
}

/**
 * The option that is really active: the stored index when it points at an
 * enabled command, otherwise the first enabled one. The stored index can go
 * stale whenever the command list or the query changes underneath it.
 */
export function resolveActive(commands: PaletteCommand[], index: number): number {
  const command = commands[index];
  if (command && !command.disabled) return index;
  return nextEnabled(commands, -1, 1);
}

/** Whether the platform uses ⌘ as its primary modifier. */
function isApplePlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? nav.platform ?? '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/**
 * Tests a keyboard event against a hotkey string such as `mod+k`,
 * `ctrl+shift+p` or `/`. `mod` is ⌘ on Apple platforms and Ctrl elsewhere.
 */
export function matchesHotkey(
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>,
  hotkey: string,
  apple = isApplePlatform()
): boolean {
  const parts = hotkey
    .toLowerCase()
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean);
  const key = parts.pop();
  if (!key) return false;
  const want = { ctrl: false, meta: false, alt: false, shift: false };
  for (const part of parts) {
    if (part === 'mod') want[apple ? 'meta' : 'ctrl'] = true;
    else if (part === 'ctrl' || part === 'control') want.ctrl = true;
    else if (part === 'meta' || part === 'cmd' || part === 'command') want.meta = true;
    else if (part === 'alt' || part === 'option') want.alt = true;
    else if (part === 'shift') want.shift = true;
  }
  if ((event.key ?? '').toLowerCase() !== key) return false;
  if (event.ctrlKey !== want.ctrl || event.metaKey !== want.meta) return false;
  if (event.altKey !== want.alt) return false;
  // A symbol such as "?" needs Shift on many layouts, so Shift is only
  // enforced for letters, digits and named keys, or when the hotkey names it.
  if (want.shift) return event.shiftKey;
  return key.length === 1 && !/[a-z0-9]/.test(key) ? true : !event.shiftKey;
}

const paletteStore = (owner: object) =>
  store<{
    syncCommands?: () => void;
    wasOpen: boolean;
  }>(owner, () => ({ wasOpen: false }));

const definition: ComponentDefinition<BqCommandPaletteProps, BqCommandPaletteState> = {
  props: {
    open: { type: Boolean, default: false },
    hotkey: { type: String, default: 'mod+k' },
    placeholder: { type: String, default: '' },
    label: { type: String, default: '' },
    'keep-open': { type: Boolean, default: false },
  },
  state: { uid: '', query: '', activeIndex: 0, commands: [] },
  sanitize: { allowAttributes: ['spellcheck'] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    ${focusRing}
    ${iconCss('search')}
    :host { display: contents; }
    :host(:not([open])) .overlay { display: none; }
    .source { display: none; }
    .overlay {
      position: fixed; inset: 0; z-index: var(--bq-z-modal,400);
      display: flex; align-items: flex-start; justify-content: center;
      padding: min(15vh, 8rem) var(--bq-space-4,1rem) var(--bq-space-4,1rem);
      background: var(--bq-overlay-backdrop,rgba(15,23,42,0.5));
      animation: cpFadeIn var(--bq-duration-normal,200ms) var(--bq-easing-decelerate);
    }
    .panel {
      inline-size: 100%; max-inline-size: 40rem;
      max-block-size: min(32rem, 100% - 2rem);
      display: flex; flex-direction: column;
      background: var(--bq-surface-overlay,#fff);
      border: 1px solid var(--bq-border-base,#e2e8f0);
      border-radius: var(--bq-radius-2xl,1rem);
      box-shadow: var(--bq-shadow-xl);
      overflow: hidden;
      font-family: var(--bq-font-family-sans);
      animation: cpScaleIn var(--bq-duration-normal,200ms) var(--bq-easing-spring);
    }
    :host([data-closing]) .overlay { animation: cpFadeOut var(--bq-duration-fast,150ms) var(--bq-easing-accelerate) forwards; }
    :host([data-closing]) .panel { animation: cpScaleOut var(--bq-duration-fast,150ms) var(--bq-easing-accelerate) forwards; }
    @keyframes cpFadeIn { from { opacity: 0; } }
    @keyframes cpFadeOut { to { opacity: 0; } }
    @keyframes cpScaleIn { from { transform: scale(0.97); opacity: 0; } }
    @keyframes cpScaleOut { to { transform: scale(0.97); opacity: 0; } }
    .search {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0 1rem;
      border-bottom: 1px solid var(--bq-border-base,#e2e8f0);
      color: var(--bq-text-muted,#475569);
      --bq-icon-size: 1.125rem;
    }
    input {
      flex: 1; min-inline-size: 0;
      block-size: 3.25rem;
      border: none; outline: none; background: transparent;
      color: var(--bq-text-base,#0f172a);
      font: inherit; font-size: var(--bq-font-size-md,1rem);
    }
    input::placeholder { color: var(--bq-text-subtle,#94a3b8); }
    /* The field is the only control in the panel and always holds focus, so
       the open panel itself is the focus indicator; a ring around the
       borderless field would only be clipped by the panel edge. */
    input:focus-visible { box-shadow: none; outline: none; }
    .listbox { overflow-y: auto; padding: 0.375rem; flex: 1; overscroll-behavior: contain; }
    .group-label {
      padding: 0.5rem 0.625rem 0.25rem;
      font-size: var(--bq-font-size-xs,0.75rem);
      font-weight: var(--bq-font-weight-semibold,600);
      color: var(--bq-text-muted,#475569);
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .option {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.5rem 0.625rem;
      border-radius: var(--bq-radius-lg,0.5rem);
      color: var(--bq-text-base,#0f172a);
      font-size: var(--bq-font-size-sm,0.875rem);
      cursor: pointer;
    }
    .option[data-active="true"] { background: var(--bq-intent-primary-bg, var(--bq-bg-muted,#f1f5f9)); color: var(--bq-intent-primary-fg, var(--bq-text-base,#0f172a)); }
    .option[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; }
    .text { display: flex; flex-direction: column; min-inline-size: 0; flex: 1; }
    .title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .description { font-size: var(--bq-font-size-xs,0.75rem); color: var(--bq-text-muted,#475569); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .meta { margin-inline-start: auto; display: inline-flex; align-items: center; gap: 0.5rem; flex: none; }
    .group-hint { font-size: var(--bq-font-size-xs,0.75rem); color: var(--bq-text-subtle,#94a3b8); }
    kbd {
      display: inline-flex; align-items: center; justify-content: center;
      min-inline-size: 1.25rem; block-size: 1.25rem; padding: 0 0.3rem;
      border: 1px solid var(--bq-border-emphasis,#cbd5e1); border-bottom-width: 2px;
      border-radius: var(--bq-radius-sm,0.25rem);
      background: var(--bq-bg-muted,#f1f5f9);
      color: var(--bq-text-muted,#475569);
      font-family: var(--bq-font-family-mono, ui-monospace, monospace);
      font-size: 0.6875rem; line-height: 1;
    }
    .shortcut { display: inline-flex; gap: 0.25rem; }
    .empty { padding: 2rem 1rem; text-align: center; color: var(--bq-text-muted,#475569); font-size: var(--bq-font-size-sm,0.875rem); }
    ::slotted([slot="footer"]) {
      display: block;
      border-top: 1px solid var(--bq-border-base,#e2e8f0);
    }
    @media (prefers-reduced-motion: reduce) {
      .overlay, .panel { animation: none !important; }
    }
  `,
  connected() {
    const self = host<BqCommandPaletteState>(this);
    const scope = bind(self);
    const local = paletteStore(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-cmd'));

    const syncCommands = () => {
      const next = readCommands(self);
      const current = self.getState<PaletteCommand[]>('commands') ?? [];
      if (sameCommands(current, next)) return;
      self.setState('commands', next);
    };
    local.syncCommands = syncCommands;

    const visible = () =>
      filterCommands(
        self.getState<PaletteCommand[]>('commands') ?? [],
        self.getState<string>('query') ?? ''
      );

    const closeAnimated = createAnimatedClose({
      host: self,
      scope,
      panelSelector: '.panel',
      fallbackDuration: '150ms',
    });
    const close = () => {
      if (!self.hasAttribute('open')) return;
      closeAnimated();
    };
    const open = () => {
      if (self.hasAttribute('open')) return;
      self.setAttribute('open', '');
    };

    const choose = (command: PaletteCommand | undefined) => {
      if (!command || command.disabled) return;
      const proceed = self.dispatchEvent(
        new CustomEvent('bq-select', {
          detail: { value: command.value, label: command.label },
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      );
      if (proceed && !self.hasAttribute('keep-open')) close();
    };

    trackFocus(self, scope);

    scope.on(document, 'keydown', (event) => {
      const ke = event as KeyboardEvent;
      const hotkey = self.getAttribute('hotkey') ?? 'mod+k';
      if (hotkey && matchesHotkey(ke, hotkey)) {
        ke.preventDefault();
        if (self.hasAttribute('open')) close();
        else open();
        return;
      }
      if (ke.key === 'Escape' && self.hasAttribute('open')) {
        ke.preventDefault();
        // First Escape clears a typed query, the second closes.
        if (self.getState<string>('query')) {
          self.setState('query', '');
          self.setState('activeIndex', nextEnabled(visible(), -1, 1));
        } else {
          close();
        }
      }
    });

    scope.on(self.shadowRoot, 'input', (event) => {
      const input = event.target as HTMLInputElement | null;
      if (input?.tagName !== 'INPUT') return;
      self.setState('query', input.value);
      self.setState('activeIndex', nextEnabled(visible(), -1, 1));
      self.dispatchEvent(
        new CustomEvent('bq-input', {
          detail: { query: input.value },
          bubbles: true,
          composed: true,
        })
      );
    });

    scope.on(self.shadowRoot, 'keydown', (event) => {
      const ke = event as KeyboardEvent;
      if ((ke.target as Element | null)?.tagName !== 'INPUT') return;
      const list = visible();
      const current = resolveActive(list, self.getState<number>('activeIndex') ?? -1);
      switch (ke.key) {
        case 'ArrowDown':
          ke.preventDefault();
          self.setState('activeIndex', nextEnabled(list, current, 1));
          return;
        case 'ArrowUp':
          ke.preventDefault();
          self.setState('activeIndex', nextEnabled(list, current < 0 ? 0 : current, -1));
          return;
          return;
        case 'Home':
          if (ke.shiftKey) return;
          ke.preventDefault();
          self.setState('activeIndex', nextEnabled(list, -1, 1));
          return;
        case 'End':
          if (ke.shiftKey) return;
          ke.preventDefault();
          self.setState('activeIndex', nextEnabled(list, 0, -1));
          return;
        case 'Enter':
          ke.preventDefault();
          choose(list[current]);
          return;
      }
    });

    scope.on(self.shadowRoot, 'mousedown', (event) => {
      const target = event.target as Element;
      if (target.classList.contains('overlay')) {
        event.preventDefault();
        close();
        return;
      }
      // Keep focus in the search field when clicking a result.
      if (target.closest('.option')) event.preventDefault();
    });

    scope.on(self.shadowRoot, 'click', (event) => {
      const option = (event.target as Element).closest('.option');
      if (!option) return;
      const index = Number(option.getAttribute('data-index') ?? '-1');
      choose(visible()[index]);
    });

    scope.on(self.shadowRoot, 'mousemove', (event) => {
      const option = (event.target as Element).closest('.option');
      if (!option || option.getAttribute('aria-disabled') === 'true') return;
      const index = Number(option.getAttribute('data-index') ?? '-1');
      if (index !== self.getState<number>('activeIndex')) {
        self.setState('activeIndex', index);
      }
    });

    const observer = new MutationObserver(() => syncCommands());
    observer.observe(self, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        'value',
        'label',
        'disabled',
        'data-keywords',
        'data-shortcut',
        'data-description',
      ],
    });
    scope.add(() => observer.disconnect());

    syncCommands();
  },
  beforeUpdate() {
    markFocus(this);
  },
  disconnected() {
    cleanupOverlayFocus(this as unknown as OverlayFocusState);
    paletteStore(this).wasOpen = false;
    release(this);
  },
  updated() {
    const self = host<BqCommandPaletteState>(this);
    const local = paletteStore(self);
    restorePreservedFocus(self);
    local.syncCommands?.();

    const isOpen = self.hasAttribute('open');
    if (isOpen && !local.wasOpen) {
      local.wasOpen = true;
      // Every opening starts with an empty query and the first command active.
      const commands = self.getState<PaletteCommand[]>('commands') ?? [];
      if (self.getState<string>('query')) self.setState('query', '');
      const first = nextEnabled(commands, -1, 1);
      if (self.getState<number>('activeIndex') !== first) {
        self.setState('activeIndex', first);
      }
      self.dispatchEvent(new CustomEvent('bq-open', { bubbles: true, composed: true }));
    } else if (!isOpen && local.wasOpen) {
      local.wasOpen = false;
    }
    updateOverlayFocus(self, self as unknown as OverlayFocusState, '.panel');

    const active = self.shadowRoot?.querySelector(
      '.option[data-active="true"]'
    ) as HTMLElement | null;
    active?.scrollIntoView?.({ block: 'nearest' });
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-cmd';
    const inputId = `${uid}-input`;
    const listboxId = `${uid}-listbox`;
    const query = state.query ?? '';
    const commands = filterCommands((state.commands ?? []) as PaletteCommand[], query);
    const activeIndex = resolveActive(commands, state.activeIndex ?? -1);
    const active = commands[activeIndex];
    const searching = query.trim() !== '';
    const label = props.label || t('commandPalette.label');

    let lastGroup = '';
    const items = commands
      .map((command, index) => {
        const header =
          !searching && command.group && command.group !== lastGroup
            ? `<div class="group-label" role="presentation" part="group-label">${escapeHtml(command.group)}</div>`
            : '';
        lastGroup = command.group;
        const shortcut = command.shortcut
          ? `<span class="shortcut" aria-hidden="true">${command.shortcut
              .split(/\s+/)
              .filter(Boolean)
              .map((key) => `<kbd>${escapeHtml(key)}</kbd>`)
              .join('')}</span>`
          : '';
        const groupHint =
          searching && command.group
            ? `<span class="group-hint">${escapeHtml(command.group)}</span>`
            : '';
        return `${header}<div
            id="${escapeHtml(`${uid}-opt-${index}`)}"
            class="option"
            part="option"
            role="option"
            data-index="${index}"
            data-active="${index === activeIndex ? 'true' : 'false'}"
            aria-selected="${index === activeIndex ? 'true' : 'false'}"
            aria-disabled="${command.disabled ? 'true' : 'false'}"
            ${command.shortcut ? `aria-keyshortcuts="${escapeHtml(command.shortcut.replace(/\s+/g, ' '))}"` : ''}
          ><span class="text"><span class="title">${escapeHtml(command.label)}</span>${
            command.description
              ? `<span class="description">${escapeHtml(command.description)}</span>`
              : ''
          }</span><span class="meta">${groupHint}${shortcut}</span></div>`;
      })
      .join('');

    return html`
      <slot class="source" aria-hidden="true"></slot>
      <div class="overlay" part="overlay" role="presentation">
        <div
          class="panel"
          part="panel"
          role="dialog"
          aria-modal="true"
          aria-label="${escapeHtml(label)}"
        >
          <div class="search" part="search">
            <span class="icon" data-icon="search" aria-hidden="true"></span>
            <input
              id="${escapeHtml(inputId)}"
              part="input"
              type="text"
              role="combobox"
              autocomplete="off"
              spellcheck="false"
              value="${escapeHtml(query)}"
              placeholder="${escapeHtml(props.placeholder || t('commandPalette.placeholder'))}"
              aria-label="${escapeHtml(label)}"
              aria-expanded="true"
              aria-controls="${escapeHtml(listboxId)}"
              aria-autocomplete="list"
              ${active ? `aria-activedescendant="${escapeHtml(`${uid}-opt-${activeIndex}`)}"` : ''}
            />
          </div>
          <div class="listbox" part="listbox" role="listbox" id="${escapeHtml(listboxId)}" aria-label="${escapeHtml(label)}">
            ${
              commands.length > 0
                ? items
                : `<div class="empty" part="empty" role="presentation"><slot name="empty">${escapeHtml(t('commandPalette.noResults'))}</slot></div>`
            }
          </div>
          <div class="footer" part="footer"><slot name="footer"></slot></div>
          <span class="sr-only" role="status" aria-live="polite">${
            props.open && searching
              ? escapeHtml(t('commandPalette.resultCount', { count: commands.length }))
              : ''
          }</span>
        </div>
      </div>
    `;
  },
};

component<BqCommandPaletteProps, BqCommandPaletteState>('bq-command-palette', definition);
