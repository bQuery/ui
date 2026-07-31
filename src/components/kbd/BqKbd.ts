/**
 * Keyboard key component — renders a keystroke or key combination.
 * @element bq-kbd
 * @prop {string}  keys    - Combination such as "Ctrl+Shift+K"; overrides slotted content
 * @prop {string}  size    - sm | md | lg
 * @prop {string}  variant - solid | outline
 * @slot - Key content, used when `keys` is not set
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { baseStyles, reset } from '../../utils/styles.js';

type BqKbdProps = { keys: string; size: string; variant: string };

/** Symbols shown instead of the written-out key name. */
const KEY_SYMBOLS: Record<string, string> = {
  cmd: '⌘',
  command: '⌘',
  meta: '⌘',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: '⌥',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  backspace: '⌫',
  delete: '⌦',
  escape: 'Esc',
  esc: 'Esc',
  tab: '⇥',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  space: 'Space',
};

/** Splits "Ctrl+Shift+K" into display-ready key names. */
export function parseKeys(keys: string): string[] {
  return keys
    .split('+')
    .map((key) => key.trim())
    .filter(Boolean)
    .map((key) => KEY_SYMBOLS[key.toLowerCase()] ?? key);
}

const definition: ComponentDefinition<BqKbdProps> = {
  props: {
    keys: { type: String, default: '' },
    size: { type: String, default: 'md' },
    variant: { type: String, default: 'solid' },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: inline-flex; }
    .kbd {
      display: inline-flex; align-items: center; gap: 0.25rem;
      font-family: var(--bq-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
      color: var(--bq-text-base,#0f172a);
      line-height: 1;
    }
    .key {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: var(--bq-radius-md,0.375rem);
      font-weight: var(--bq-font-weight-medium,500);
      white-space: nowrap;
    }
    .sep { color: var(--bq-text-subtle,#94a3b8); }
    .kbd[data-size="sm"] .key { font-size: 0.6875rem; min-width: 1.25rem; height: 1.25rem; padding: 0 0.3rem; }
    .kbd[data-size="md"] .key { font-size: 0.75rem;   min-width: 1.5rem;  height: 1.5rem;  padding: 0 0.4rem; }
    .kbd[data-size="lg"] .key { font-size: 0.875rem;  min-width: 1.75rem; height: 1.75rem; padding: 0 0.5rem; }
    .kbd[data-variant="solid"] .key {
      background: var(--bq-bg-muted,#f1f5f9);
      border: 1px solid var(--bq-border-emphasis,#cbd5e1);
      border-bottom-width: 2px;
    }
    .kbd[data-variant="outline"] .key {
      background: transparent;
      border: 1px solid var(--bq-border-emphasis,#cbd5e1);
    }
  `,
  render({ props }) {
    const keys = parseKeys(props.keys);
    const body =
      keys.length > 0
        ? keys
            .map((key) => `<kbd class="key" part="key">${escapeHtml(key)}</kbd>`)
            .join('<span class="sep" aria-hidden="true">+</span>')
        : '<kbd class="key" part="key"><slot></slot></kbd>';
    return html`
      <span
        part="kbd"
        class="kbd"
        data-size="${escapeHtml(props.size)}"
        data-variant="${escapeHtml(props.variant)}"
      >${body}</span>
    `;
  },
};

component<BqKbdProps>('bq-kbd', definition);
