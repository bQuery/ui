/**
 * PIN / one-time-code input — a row of single-character cells.
 *
 * A verification code pasted from a text message arrives as one string, and
 * typed one character at a time. Both have to work: paste distributes across
 * the cells from wherever the caret is, typing advances, and Backspace in an
 * empty cell steps back and clears the one before it.
 *
 * @element bq-pin-input
 * @prop {number}  length      - Number of cells
 * @prop {string}  value       - Current code
 * @prop {string}  name        - Form field name
 * @prop {string}  type        - numeric | alphanumeric | text
 * @prop {boolean} mask        - Obscure the characters, like a password
 * @prop {boolean} disabled
 * @prop {boolean} readonly
 * @prop {boolean} required
 * @prop {string}  label
 * @prop {string}  hint
 * @prop {string}  error
 * @prop {string}  size        - sm | md | lg
 * @fires bq-input    - { value: string }
 * @fires bq-change   - { value: string }
 * @fires bq-complete - { value: string } once every cell is filled
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { bool, component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { markFocus, restorePreservedFocus } from '../../utils/focus.js';
import { bindFormProxy, syncFormProxy } from '../../utils/form.js';
import { baseStyles, fieldStyles, reset, srOnly } from '../../utils/styles.js';
import { bindValidation } from '../../utils/validation.js';

type BqPinInputProps = {
  length: number;
  value: string;
  name: string;
  type: string;
  mask: boolean;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  label: string;
  hint: string;
  error: string;
  size: string;
};

type BqPinInputState = { uid: string };

/** Characters each `type` accepts. Anything else is dropped as it is typed. */
const PATTERNS: Record<string, RegExp> = {
  numeric: /[0-9]/,
  alphanumeric: /[0-9a-zA-Z]/,
  text: /[^\s]/,
};

/** Keeps only the characters valid for `type`, capped at `length`. */
export function sanitizePin(raw: string, type: string, length: number): string {
  const pattern = PATTERNS[type] ?? PATTERNS['numeric']!;
  let out = '';
  for (const ch of raw) {
    if (pattern.test(ch)) out += ch;
    if (out.length >= length) break;
  }
  return out;
}

/**
 * Splices `insert` into `value` at `index`, overwriting the cells it covers.
 *
 * Overwriting rather than inserting is what makes a paste land predictably:
 * dropping six digits onto a half-filled field replaces what was there
 * instead of pushing it off the end.
 */
export function applyPinEdit(
  value: string,
  index: number,
  insert: string,
  length: number
): string {
  const cells = value.padEnd(length, ' ').slice(0, length).split('');
  for (let i = 0; i < insert.length && index + i < length; i += 1) {
    cells[index + i] = insert[i] as string;
  }
  return cells.join('').replace(/\s+$/, '');
}

const definition: ComponentDefinition<BqPinInputProps, BqPinInputState> = {
  props: {
    length: { type: Number, default: 6 },
    value: { type: String, default: '' },
    name: { type: String, default: '' },
    type: { type: String, default: 'numeric' },
    mask: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
    size: { type: String, default: 'md' },
  },
  state: { uid: '' },
  sanitize: { allowAttributes: ['inputmode', 'autocomplete'] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${fieldStyles}
    ${srOnly}
    :host { display: block; }
    .cells { display: flex; align-items: center; gap: 0.5rem; }
    .cell {
      inline-size: var(--bq-pin-size, 2.75rem);
      block-size: var(--bq-pin-size, 2.75rem);
      text-align: center;
      font-family: var(--bq-font-family-mono);
      font-size: var(--bq-font-size-lg, 1.125rem);
      font-weight: var(--bq-font-weight-semibold, 600);
      color: var(--bq-text-base, #0f172a);
      background: var(--bq-bg-base, #fff);
      border: var(--bq-border-width-control, 1.5px) solid var(--bq-border-emphasis, #cbd5e1);
      border-radius: var(--bq-radius-lg, 0.5rem);
      outline: none;
      transition:
        border-color var(--bq-duration-fast) var(--bq-easing-standard),
        box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    :host([size='sm']) .cell { --bq-pin-size: 2.25rem; font-size: var(--bq-font-size-md, 1rem); }
    :host([size='lg']) .cell { --bq-pin-size: 3.25rem; font-size: var(--bq-font-size-xl, 1.25rem); }
    .cell:hover:not(:disabled) { border-color: var(--bq-border-strong, #94a3b8); }
    .cell:focus-visible,
    .cell:focus {
      border-color: var(--bq-border-focus, #2563eb);
      box-shadow: var(--bq-focus-ring);
    }
    /* A filled cell is worth marking: on a six-cell row it is the only way to
       see progress at a glance while the caret sits somewhere in the middle. */
    .cell[data-filled='true'] { border-color: var(--bq-border-strong, #94a3b8); }
    :host([error]:not([error=''])) .cell { border-color: var(--bq-color-danger-500, #ef4444); }
    :host([error]:not([error=''])) .cell:focus { box-shadow: var(--bq-focus-ring-danger); }
    .cell:disabled { opacity: 0.55; cursor: not-allowed; background: var(--bq-bg-muted, #f1f5f9); }
    .cell:read-only { cursor: default; }
  `,
  connected() {
    const self = host<BqPinInputState>(this);
    const scope = bind(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-pin'));

    const length = () => {
      const raw = Number(self.getAttribute('length') ?? 6);
      return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 6;
    };
    const type = () => self.getAttribute('type') ?? 'numeric';
    const readValue = () => self.getAttribute('value') ?? '';
    const isInteractive = () =>
      !self.hasAttribute('disabled') && !self.hasAttribute('readonly');

    const proxy = bindFormProxy(self, scope, { value: readValue });
    bindValidation(self, scope, { value: readValue });

    const cells = (): HTMLInputElement[] =>
      Array.from(self.shadowRoot?.querySelectorAll('.cell') ?? []);

    const focusCell = (index: number) => {
      const list = cells();
      const clamped = Math.max(0, Math.min(index, list.length - 1));
      const cell = list[clamped];
      if (!cell) return;
      cell.focus();
      cell.select();
    };

    /**
     * Commits a new code and reports it.
     *
     * `bq-complete` is separate from `bq-change` on purpose: filling the last
     * cell is the moment an application wants to submit, and detecting it from
     * `bq-change` would mean re-deriving the length on every keystroke.
     */
    const commit = (next: string, caret: number) => {
      const previous = readValue();
      const size = length();
      self.setAttribute('value', next);
      proxy.setValue(next);
      // The attribute write re-renders synchronously, so the cells that exist
      // after it are the ones to move focus into.
      focusCell(caret);
      if (next === previous) return;
      self.dispatchEvent(
        new CustomEvent('bq-input', {
          detail: { value: next },
          bubbles: true,
          composed: true,
        })
      );
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: { value: next },
          bubbles: true,
          composed: true,
        })
      );
      if (next.length === size) {
        self.dispatchEvent(
          new CustomEvent('bq-complete', {
            detail: { value: next },
            bubbles: true,
            composed: true,
          })
        );
      }
    };

    const indexOf = (target: EventTarget | null): number => {
      const cell = target as HTMLInputElement | null;
      if (!cell || !cell.classList?.contains('cell')) return -1;
      return Number(cell.getAttribute('data-index') ?? -1);
    };

    scope.on(self.shadowRoot, 'input', (event) => {
      const index = indexOf(event.target);
      if (index < 0 || !isInteractive()) return;
      markFocus(self);
      const cell = event.target as HTMLInputElement;
      const typed = sanitizePin(cell.value, type(), length());
      const next = applyPinEdit(readValue(), index, typed, length());
      // An empty edit means the character was rejected; re-render anyway so
      // the cell drops what the user typed instead of showing it.
      commit(next, typed ? index + typed.length : index);
    });

    scope.on(self.shadowRoot, 'keydown', (event) => {
      const ke = event as KeyboardEvent;
      const index = indexOf(ke.target);
      if (index < 0) return;
      const value = readValue();

      switch (ke.key) {
        case 'Backspace': {
          if (!isInteractive()) return;
          ke.preventDefault();
          markFocus(self);
          // A filled cell clears itself; an empty one steps back and clears
          // its neighbour, which is what makes holding Backspace feel right.
          const target = value[index] ? index : index - 1;
          if (target < 0) return;
          commit(applyPinEdit(value, target, ' ', length()).trimEnd(), target);
          return;
        }
        case 'Delete': {
          if (!isInteractive()) return;
          ke.preventDefault();
          markFocus(self);
          commit(applyPinEdit(value, index, ' ', length()).trimEnd(), index);
          return;
        }
        case 'ArrowLeft':
          ke.preventDefault();
          focusCell(index - 1);
          return;
        case 'ArrowRight':
          ke.preventDefault();
          focusCell(index + 1);
          return;
        case 'Home':
          ke.preventDefault();
          focusCell(0);
          return;
        case 'End':
          ke.preventDefault();
          focusCell(length() - 1);
          return;
      }
    });

    scope.on(self.shadowRoot, 'paste', (event) => {
      const index = indexOf(event.target);
      if (index < 0 || !isInteractive()) return;
      event.preventDefault();
      markFocus(self);
      const clipboard = (event as ClipboardEvent).clipboardData;
      const pasted = sanitizePin(
        clipboard?.getData('text') ?? '',
        type(),
        length()
      );
      if (!pasted) return;
      const next = applyPinEdit(readValue(), index, pasted, length());
      commit(next, index + pasted.length);
    });

    // Clicking anywhere in a partly filled row lands on the first empty cell:
    // editing the middle of a code is almost never what was meant.
    scope.on(self.shadowRoot, 'focusin', (event) => {
      const index = indexOf(event.target);
      if (index < 0) return;
      const value = readValue();
      if (index <= value.length) return;
      focusCell(value.length);
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
    syncFormProxy(this);
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-pin';
    const size = Number.isFinite(props.length) && props.length > 0
      ? Math.floor(props.length)
      : 6;
    const value = sanitizePin(props.value, props.type, size);
    const hasError = Boolean(props.error);
    const hasHint = Boolean(props.hint) && !hasError;
    const describedBy: string[] = [];
    if (hasError) describedBy.push(`${uid}-err`);
    if (hasHint) describedBy.push(`${uid}-hint`);
    describedBy.push(`${uid}-progress`);

    const cells = Array.from({ length: size }, (_, index) => {
      const char = value[index] ?? '';
      return `<input
          class="cell"
          part="cell"
          data-index="${index}"
          data-filled="${char ? 'true' : 'false'}"
          type="${props.mask ? 'password' : 'text'}"
          inputmode="${props.type === 'numeric' ? 'numeric' : 'text'}"
          autocomplete="${index === 0 ? 'one-time-code' : 'off'}"
          maxlength="1"
          value="${escapeHtml(char)}"
          aria-label="${escapeHtml(t('pinInput.cell', { index: index + 1, total: size }))}"
          ${hasError ? 'aria-invalid="true"' : ''}
          ${describedBy.length > 0 ? `aria-describedby="${escapeHtml(describedBy.join(' '))}"` : ''}
          ${bool('disabled', props.disabled)}
          ${bool('readonly', props.readonly)}
        />`;
    }).join('');

    return html`
      <div class="field" part="field" role="group" ${props.label ? `aria-labelledby="${escapeHtml(`${uid}-label`)}"` : ''}>
        ${
          props.label
            ? `<span class="label" id="${escapeHtml(`${uid}-label`)}" part="label">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</span>`
            : ''
        }
        <div class="cells" part="cells">${cells}</div>
        ${hasHint ? `<span class="hint" id="${uid}-hint" part="hint">${escapeHtml(props.hint)}</span>` : ''}
        ${hasError ? `<span class="error-msg" id="${uid}-err" role="alert" part="error">${escapeHtml(props.error)}</span>` : ''}
        <span class="sr-only" id="${uid}-progress" role="status" aria-live="polite"
          >${escapeHtml(t('pinInput.progress', { count: value.length, total: size }))}</span
        >
      </div>
    `;
  },
};

component<BqPinInputProps, BqPinInputState>('bq-pin-input', definition);
