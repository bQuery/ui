// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import {
  filterCommands,
  isPlainHotkey,
  matchesHotkey,
  nextEnabled,
  readCommands,
  scoreCommand,
} from '../src/components/command-palette/BqCommandPalette.js';
import type { PaletteCommand } from '../src/components/command-palette/BqCommandPalette.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

const cmd = (label: string, extra: Partial<PaletteCommand> = {}): PaletteCommand => ({
  value: label.toLowerCase(),
  label,
  group: '',
  keywords: '',
  shortcut: '',
  description: '',
  disabled: false,
  ...extra,
});

const keyEvent = (key: string, mods: Partial<KeyboardEvent> = {}) => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  shiftKey: false,
  ...mods,
});

describe('command palette helpers', () => {
  it('ranks prefix > word prefix > substring > keyword > fuzzy', () => {
    const commands = [
      cmd('Toggle theme', { keywords: 'dark mode' }),
      cmd('Open settings'),
      cmd('Settings: reset'),
      cmd('Presets'),
      cmd('Sign out'),
    ];
    expect(filterCommands(commands, 'set').map((c) => c.label)).toEqual([
      'Settings: reset',
      'Open settings',
      'Presets',
    ]);
    expect(filterCommands(commands, 'dark').map((c) => c.label)).toEqual([
      'Toggle theme',
    ]);
    expect(filterCommands(commands, 'sgnt').map((c) => c.label)).toEqual([
      'Sign out',
    ]);
  });

  it('matches diacritic-insensitively and keeps order for an empty query', () => {
    const commands = [cmd('Café menu'), cmd('Bar')];
    expect(scoreCommand(commands[0]!, 'cafe')).toBeGreaterThan(0);
    expect(filterCommands(commands, '  ')).toEqual(commands);
  });

  it('skips disabled commands when moving', () => {
    const commands = [cmd('A', { disabled: true }), cmd('B'), cmd('C', { disabled: true })];
    expect(nextEnabled(commands, -1, 1)).toBe(1);
    expect(nextEnabled(commands, 1, 1)).toBe(1);
    expect(nextEnabled([cmd('X', { disabled: true })], -1, 1)).toBe(-1);
  });

  it('matches hotkeys with platform-aware mod', () => {
    expect(matchesHotkey(keyEvent('k', { metaKey: true }), 'mod+k', true)).toBe(true);
    expect(matchesHotkey(keyEvent('k', { ctrlKey: true }), 'mod+k', true)).toBe(false);
    expect(matchesHotkey(keyEvent('k', { ctrlKey: true }), 'mod+k', false)).toBe(true);
    expect(matchesHotkey(keyEvent('K', { ctrlKey: true, shiftKey: true }), 'ctrl+shift+k', false)).toBe(true);
    expect(matchesHotkey(keyEvent('K', { ctrlKey: true, shiftKey: true }), 'ctrl+k', false)).toBe(false);
    expect(matchesHotkey(keyEvent('/'), '/', false)).toBe(true);
    expect(matchesHotkey(keyEvent('?', { shiftKey: true }), '?', false)).toBe(true);
    expect(matchesHotkey(keyEvent('k'), '', false)).toBe(false);
  });

  it('tells plain hotkeys from modified ones', () => {
    expect(isPlainHotkey('/')).toBe(true);
    expect(isPlainHotkey('shift+?')).toBe(true);
    expect(isPlainHotkey('mod+k')).toBe(false);
    expect(isPlainHotkey('Ctrl+Shift+P')).toBe(false);
  });

  it('reads options, groups and data attributes', () => {
    const host = doc.createElement('div');
    host.innerHTML = `
      <optgroup label="Nav">
        <option value="home" data-shortcut="G H" data-keywords="start" data-description="Dashboard">Go home</option>
      </optgroup>
      <option disabled>Locked</option>`;
    expect(readCommands(host)).toEqual([
      {
        value: 'home',
        label: 'Go home',
        group: 'Nav',
        keywords: 'start',
        shortcut: 'G H',
        description: 'Dashboard',
        disabled: false,
      },
      {
        value: 'Locked',
        label: 'Locked',
        group: '',
        keywords: '',
        shortcut: '',
        description: '',
        disabled: true,
      },
    ]);
  });
});

describe('bq-command-palette', () => {
  beforeAll(async () => {
    await import('../src/components/command-palette/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (attrs: Record<string, string> = {}) => {
    const el = doc.createElement('bq-command-palette');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.innerHTML = `
      <optgroup label="Navigation">
        <option value="home" data-shortcut="G H">Go home</option>
        <option value="projects">Go to projects</option>
      </optgroup>
      <optgroup label="Actions">
        <option value="new" data-keywords="create add">New project</option>
        <option value="delete" disabled>Delete project</option>
        <option value="theme" data-description="Switch light and dark">Toggle theme</option>
      </optgroup>`;
    doc.body.appendChild(el);
    return el;
  };
  const input = (el: HTMLElement) =>
    el.shadowRoot?.querySelector('input') as HTMLInputElement;
  const options = (el: HTMLElement) =>
    Array.from(el.shadowRoot?.querySelectorAll('.option') ?? []) as HTMLElement[];
  const labels = (el: HTMLElement) =>
    options(el).map((o) => o.querySelector('.title')?.textContent);
  const type = (el: HTMLElement, text: string) => {
    input(el).value = text;
    input(el).dispatchEvent(new win.Event('input', { bubbles: true, composed: true }));
  };
  const press = (target: EventTarget, key: string, mods: Partial<KeyboardEventInit> = {}) =>
    target.dispatchEvent(
      new win.KeyboardEvent('keydown', {
        key,
        bubbles: true,
        composed: true,
        cancelable: true,
        ...mods,
      })
    );

  it('renders an accessible dialog with a combobox search field', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    const panel = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(panel?.getAttribute('aria-modal')).toBe('true');
    expect(panel?.getAttribute('aria-label')).toBe('Command palette');
    const field = input(el);
    expect(field.getAttribute('role')).toBe('combobox');
    expect(field.getAttribute('aria-controls')).toBe(
      el.shadowRoot?.querySelector('[role="listbox"]')?.id ?? ''
    );
    expect(field.getAttribute('aria-activedescendant')).toBe(options(el)[0]?.id ?? '');
  });

  it('shows group headings and shortcuts for the full list', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    const groups = Array.from(el.shadowRoot?.querySelectorAll('.group-label') ?? []).map(
      (g) => g.textContent
    );
    expect(groups).toEqual(['Navigation', 'Actions']);
    const kbds = Array.from(options(el)[0]?.querySelectorAll('kbd') ?? []).map(
      (k) => k.textContent
    );
    expect(kbds).toEqual(['G', 'H']);
    expect(options(el)[0]?.getAttribute('aria-keyshortcuts')).toBe('G H');
  });

  it('filters and ranks as the user types, searching keywords too', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    type(el, 'go');
    await waitForFrame();
    expect(labels(el)).toEqual(['Go home', 'Go to projects']);
    type(el, 'create');
    await waitForFrame();
    expect(labels(el)).toEqual(['New project']);
    type(el, 'zzz');
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('.empty')?.textContent?.trim()).toBe(
      'No matching commands'
    );
  });

  it('moves the active option with the arrow keys, skipping disabled ones', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    type(el, 'project');
    await waitForFrame();
    // Go to projects, New project, Delete project (disabled)
    expect(labels(el)).toEqual(['Go to projects', 'New project', 'Delete project']);
    press(input(el), 'ArrowDown');
    await waitForFrame();
    expect(options(el)[1]?.getAttribute('data-active')).toBe('true');
    press(input(el), 'ArrowDown');
    await waitForFrame();
    expect(options(el)[0]?.getAttribute('data-active')).toBe('true');
    press(input(el), 'End');
    await waitForFrame();
    expect(options(el)[1]?.getAttribute('data-active')).toBe('true');
  });

  it('emits bq-select on Enter and closes', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    let detail: { value: string; label: string } | null = null;
    el.addEventListener('bq-select', (e) => {
      detail = (e as CustomEvent<{ value: string; label: string }>).detail;
    });
    let closed = false;
    el.addEventListener('bq-close', () => {
      closed = true;
    });
    press(input(el), 'ArrowDown');
    await waitForFrame();
    press(input(el), 'Enter');
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(detail).toEqual({ value: 'projects', label: 'Go to projects' });
    expect(el.hasAttribute('open')).toBe(false);
    expect(closed).toBe(true);
  });

  it('stays open when bq-select is cancelled or keep-open is set', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    el.addEventListener('bq-select', (e) => e.preventDefault(), { once: true });
    press(input(el), 'Enter');
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(el.hasAttribute('open')).toBe(true);

    el.setAttribute('keep-open', '');
    press(input(el), 'Enter');
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(el.hasAttribute('open')).toBe(true);
  });

  it('selects on click', async () => {
    const el = create({ open: '', 'keep-open': '' });
    await waitForFrame();
    const values: string[] = [];
    el.addEventListener('bq-select', (e) =>
      values.push((e as CustomEvent<{ value: string }>).detail.value)
    );
    options(el)[2]?.click();
    options(el)[3]?.click(); // disabled
    expect(values).toEqual(['new']);
  });

  it('toggles with the hotkey and opens with a fresh query', async () => {
    const el = create({ hotkey: 'ctrl+k' });
    await waitForFrame();
    let opened = 0;
    el.addEventListener('bq-open', () => {
      opened += 1;
    });
    press(doc, 'k', { ctrlKey: true });
    await waitForFrame();
    expect(el.hasAttribute('open')).toBe(true);
    expect(opened).toBe(1);

    type(el, 'theme');
    await waitForFrame();
    press(doc, 'k', { ctrlKey: true });
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(el.hasAttribute('open')).toBe(false);

    press(doc, 'k', { ctrlKey: true });
    await waitForFrame();
    expect(input(el).value).toBe('');
    expect(labels(el)).toHaveLength(5);
  });

  it('clears the query on the first Escape and closes on the second', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    type(el, 'home');
    await waitForFrame();
    press(input(el), 'Escape');
    await waitForFrame();
    expect(el.hasAttribute('open')).toBe(true);
    expect(input(el).value).toBe('');
    press(input(el), 'Escape');
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('closes on a backdrop click', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    el.shadowRoot
      ?.querySelector('.overlay')
      ?.dispatchEvent(new win.MouseEvent('mousedown', { bubbles: true, composed: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('picks up commands added later', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    const option = doc.createElement('option');
    option.value = 'help';
    option.textContent = 'Open help';
    el.appendChild(option);
    await waitForFrame();
    await waitForFrame();
    expect(labels(el)).toContain('Open help');
  });

  it('removes its document listeners on disconnect', async () => {
    const el = create({ hotkey: 'ctrl+k' });
    await waitForFrame();
    el.remove();
    press(doc, 'k', { ctrlKey: true });
    await waitForFrame();
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('does not steal a plain hotkey typed into a text field', async () => {
    const el = create({ hotkey: '/' });
    const field = doc.createElement('input');
    doc.body.appendChild(field);
    await waitForFrame();
    const typed = press(field, '/');
    await waitForFrame();
    expect(typed).toBe(true); // not prevented
    expect(el.hasAttribute('open')).toBe(false);
    press(doc.body, '/');
    await waitForFrame();
    expect(el.hasAttribute('open')).toBe(true);
    // Typing "/" into the palette's own search field must not close it.
    press(input(el), '/');
    await waitForFrame();
    expect(el.hasAttribute('open')).toBe(true);
  });

  it('ignores Enter while an IME composition is active', async () => {
    const el = create({ open: '' });
    await waitForFrame();
    let selected = false;
    el.addEventListener('bq-select', () => {
      selected = true;
    });
    press(input(el), 'Enter', { isComposing: true } as KeyboardEventInit);
    await waitForFrame();
    expect(selected).toBe(false);
    expect(el.hasAttribute('open')).toBe(true);
  });
});
