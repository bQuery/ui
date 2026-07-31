/**
 * Combobox — a text input that filters a list of options.
 *
 * Implements the ARIA 1.2 combobox pattern with a non-editable-or-editable
 * text field and a popup listbox: the input carries `role="combobox"`,
 * `aria-expanded` and `aria-controls`, and the active option is pointed at
 * with `aria-activedescendant` rather than by moving DOM focus — so the user
 * keeps typing while arrowing through results.
 *
 * Options are declared as light-DOM `<option>` elements, matching `bq-select`,
 * so the same markup works with or without JavaScript filtering.
 *
 * @element bq-combobox
 * @prop {string}  label       - Field label
 * @prop {string}  value       - Selected value; comma-separated when `multiple`
 * @prop {string}  placeholder
 * @prop {string}  name        - Form field name
 * @prop {boolean} disabled
 * @prop {boolean} required
 * @prop {boolean} multiple    - Allow more than one selection
 * @prop {boolean} clearable   - Show a button that clears the selection
 * @prop {boolean} no-filter   - Show every option; filtering is done by the host app
 * @prop {string}  filter-mode - contains | starts-with
 * @prop {string}  error
 * @prop {string}  hint
 * @prop {string}  size        - sm | md | lg
 * @slot - `<option>` elements
 * @fires bq-change - { value: string, values: string[] }
 * @fires bq-input  - { query: string }
 * @fires bq-open
 * @fires bq-close
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import type { Disposer } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { captureFocus, restoreFocus } from '../../utils/focus.js';
import type { FocusSnapshot } from '../../utils/focus.js';
import { bindFormProxy, syncFormProxy } from '../../utils/form.js';
import { autoPosition } from '../../utils/position.js';
import { baseStyles, reset, srOnly } from '../../utils/styles.js';
import { bindValidation } from '../../utils/validation.js';

type BqComboboxProps = {
  label: string;
  value: string;
  placeholder: string;
  name: string;
  disabled: boolean;
  required: boolean;
  multiple: boolean;
  clearable: boolean;
  'no-filter': boolean;
  'filter-mode': string;
  error: string;
  hint: string;
  size: string;
};

type BqComboboxState = {
  uid: string;
  open: boolean;
  query: string;
  activeIndex: number;
  /**
   * Mirror of the light-DOM `<option>` children. `render()` receives only
   * props and state — it cannot reach the host's children — so the
   * declarative option list is synced into state by `connected()`,
   * `updated()` and a MutationObserver.
   */
  options: ComboboxOption[];
};

/** A single selectable entry, read from a light-DOM `<option>`. */
export interface ComboboxOption {
  value: string;
  label: string;
  disabled: boolean;
  group: string;
}

const comboboxStore = (owner: object) =>
  store<{
    snapshot?: FocusSnapshot | null;
    syncPosition?: () => void;
    syncOptions?: () => void;
    stopPosition?: Disposer | null;
  }>(owner, () => ({}));

/** Reads the declarative `<option>` / `<optgroup>` children. */
export function readOptions(el: Element): ComboboxOption[] {
  const options: ComboboxOption[] = [];
  const visit = (parent: Element, group: string) => {
    for (const child of Array.from(parent.children)) {
      const tag = child.tagName.toLowerCase();
      if (tag === 'optgroup') {
        visit(child, child.getAttribute('label') ?? '');
        continue;
      }
      if (tag !== 'option') continue;
      const label = child.textContent?.trim() ?? '';
      options.push({
        value: child.getAttribute('value') ?? label,
        label,
        disabled: child.hasAttribute('disabled'),
        group,
      });
    }
  };
  visit(el, '');
  return options;
}

/** Structural comparison, so a re-sync only re-renders on a real change. */
function sameOptions(a: ComboboxOption[], b: ComboboxOption[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((option, i) => {
    const other = b[i];
    return (
      other !== undefined &&
      option.value === other.value &&
      option.label === other.label &&
      option.disabled === other.disabled &&
      option.group === other.group
    );
  });
}

/**
 * Filters options against a query.
 *
 * Matching is case- and diacritic-insensitive so that typing `jose` finds
 * `José` — a plain `toLowerCase()` comparison would not.
 */
export function filterOptions(
  options: ComboboxOption[],
  query: string,
  mode: string = 'contains'
): ComboboxOption[] {
  const needle = normalizeText(query);
  if (!needle) return options;
  return options.filter((option) => {
    const haystack = normalizeText(option.label);
    return mode === 'starts-with'
      ? haystack.startsWith(needle)
      : haystack.includes(needle);
  });
}

function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Splits the `value` attribute into individual selected values. */
export function parseValues(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Moves the active index past disabled options.
 * Returns `-1` when no option can be activated at all.
 */
export function nextEnabledIndex(
  options: ComboboxOption[],
  from: number,
  step: 1 | -1
): number {
  if (options.length === 0) return -1;
  let index = from;
  for (let i = 0; i < options.length; i += 1) {
    index = (index + step + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }
  return -1;
}

const definition: ComponentDefinition<BqComboboxProps, BqComboboxState> = {
  props: {
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    name: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    'no-filter': { type: Boolean, default: false },
    'filter-mode': { type: String, default: 'contains' },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    size: { type: String, default: 'md' },
  },
  state: { uid: '', open: false, query: '', activeIndex: -1, options: [] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    :host { display: block; position: relative; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; }
    .label {
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-medium,500);
      color: var(--bq-text-base,#0f172a);
      font-family: var(--bq-font-family-sans);
    }
    .required-mark { color: var(--bq-color-danger-600,#dc2626); }

    .control {
      display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap;
      border: 1.5px solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-lg,0.5rem);
      background: var(--bq-bg-base,#fff);
      padding: 0.25rem 0.375rem;
      transition: border-color var(--bq-duration-fast) var(--bq-easing-standard),
                  box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .control:focus-within { border-color: var(--bq-border-focus,#2563eb); box-shadow: var(--bq-focus-ring); }
    :host([error]:not([error=""])) .control { border-color: var(--bq-color-danger-500,#ef4444); }
    :host([disabled]) .control { opacity: 0.5; cursor: not-allowed; background: var(--bq-bg-muted,#f1f5f9); }

    input {
      flex: 1 1 6rem; min-width: 4rem;
      border: none; outline: none; background: transparent;
      color: var(--bq-text-base,#0f172a);
      font-family: var(--bq-font-family-sans);
    }
    :host([size="sm"]) input { font-size: 0.875rem; padding: 0.25rem 0.375rem; }
    :host([size="md"]) input, :host(:not([size])) input { font-size: 1rem; padding: 0.375rem 0.5rem; }
    :host([size="lg"]) input { font-size: 1.125rem; padding: 0.5rem 0.625rem; }

    .token {
      display: inline-flex; align-items: center; gap: 0.25rem;
      background: var(--bq-bg-muted,#f1f5f9);
      color: var(--bq-text-base,#0f172a);
      border-radius: var(--bq-radius-sm,0.25rem);
      padding: 0.125rem 0.25rem 0.125rem 0.5rem;
      font-size: var(--bq-font-size-sm,0.875rem);
      font-family: var(--bq-font-family-sans);
    }
    .token button {
      border: none; background: none; cursor: pointer; line-height: 1;
      color: var(--bq-text-muted,#475569); padding: 0 0.125rem;
      border-radius: var(--bq-radius-sm,0.25rem);
    }
    .token button:hover { color: var(--bq-color-danger-600,#dc2626); }
    .token button:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }

    .actions { display: inline-flex; align-items: center; gap: 0.125rem; margin-inline-start: auto; }
    .action {
      display: inline-flex; align-items: center; justify-content: center;
      width: 1.5rem; height: 1.5rem; border: none; background: none;
      color: var(--bq-text-muted,#475569); cursor: pointer; line-height: 1;
      border-radius: var(--bq-radius-sm,0.25rem); font-size: 0.75rem;
    }
    .action:hover { background: var(--bq-bg-muted,#f1f5f9); color: var(--bq-text-base,#0f172a); }
    .action:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }

    .listbox {
      position: absolute; z-index: var(--bq-z-dropdown,100);
      inset-inline-start: 0; min-width: 100%;
      max-height: 16rem; overflow-y: auto;
      margin-top: 0.25rem;
      background: var(--bq-bg-base,#fff);
      border: 1px solid var(--bq-border-base,#e2e8f0);
      border-radius: var(--bq-radius-lg,0.5rem);
      box-shadow: var(--bq-shadow-lg);
      padding: 0.25rem 0;
      font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-sm,0.875rem);
    }
    :host(:not([data-open])) .listbox { display: none; }
    .listbox[data-placement^="top"] { margin-top: 0; margin-bottom: 0.25rem; }

    .option {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.375rem 0.75rem; cursor: pointer;
      color: var(--bq-text-base,#0f172a);
    }
    .option[data-active="true"] { background: var(--bq-bg-muted,#f1f5f9); }
    .option[aria-selected="true"] { font-weight: var(--bq-font-weight-semibold,600); }
    .option[aria-selected="true"]::after { content: "✓"; margin-inline-start: auto; color: var(--bq-color-primary-600,#2563eb); }
    .option[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; }

    .group-label {
      padding: 0.375rem 0.75rem 0.125rem;
      font-size: var(--bq-font-size-xs,0.75rem);
      font-weight: var(--bq-font-weight-semibold,600);
      color: var(--bq-text-muted,#475569);
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .empty { padding: 0.625rem 0.75rem; color: var(--bq-text-muted,#475569); }
    /* The declarative <option> children are a data source, not display
       content — the listbox above is rendered from their mirrored state. */
    .source { display: none; }

    .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); }
    .error-msg { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-color-danger-600,#dc2626); font-family: var(--bq-font-family-sans); }
    @media (prefers-reduced-motion: reduce) {
      .control { transition: none; }
    }
  `,
  connected() {
    const self = host<BqComboboxState>(this);
    const scope = bind(self);
    const local = comboboxStore(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-cb'));

    const readValues = (): string[] =>
      parseValues(self.getAttribute('value') ?? '');
    const isMultiple = () => self.hasAttribute('multiple');
    const isInteractive = () => !self.hasAttribute('disabled');

    /**
     * Pulls the light-DOM options into state. Guarded by a value comparison
     * because `setState` always re-renders, and `updated()` calls this — an
     * unconditional write would loop forever.
     */
    const syncOptions = () => {
      const next = readOptions(self);
      const current = self.getState<ComboboxOption[]>('options') ?? [];
      if (sameOptions(current, next)) return;
      self.setState('options', next);
    };
    local.syncOptions = syncOptions;

    const visibleOptions = (): ComboboxOption[] => {
      const all = self.getState<ComboboxOption[]>('options') ?? [];
      if (self.hasAttribute('no-filter')) return all;
      return filterOptions(
        all,
        self.getState<string>('query') ?? '',
        self.getAttribute('filter-mode') ?? 'contains'
      );
    };

    bindFormProxy(self, scope, {
      value: () => self.getAttribute('value') ?? '',
    });
    bindValidation(self, scope, {
      value: () => self.getAttribute('value') ?? '',
    });

    const emitChange = () => {
      const values = readValues();
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: { value: values.join(','), values },
          bubbles: true,
          composed: true,
        })
      );
    };

    const open = () => {
      if (!isInteractive() || self.getState<boolean>('open')) return;
      self.setState('open', true);
      // `data-open` drives the CSS; state alone is not visible to selectors.
      self.setAttribute('data-open', '');
      self.dispatchEvent(
        new CustomEvent('bq-open', { bubbles: true, composed: true })
      );
    };

    const close = () => {
      if (!self.getState<boolean>('open')) return;
      self.setState('open', false);
      self.setState('activeIndex', -1);
      self.removeAttribute('data-open');
      self.dispatchEvent(
        new CustomEvent('bq-close', { bubbles: true, composed: true })
      );
    };

    const selectValue = (value: string) => {
      if (!value) return;
      if (isMultiple()) {
        const values = readValues();
        const next = values.includes(value)
          ? values.filter((v) => v !== value)
          : [...values, value];
        self.setAttribute('value', next.join(','));
        // Multi-select keeps the list open so several picks cost one trip,
        // but the query is cleared so the next one starts fresh.
        self.setState('query', '');
      } else {
        self.setAttribute('value', value);
        const option = (self.getState<ComboboxOption[]>('options') ?? []).find(
          (o) => o.value === value
        );
        self.setState('query', option?.label ?? value);
        close();
      }
      emitChange();
    };

    const clear = () => {
      self.setAttribute('value', '');
      self.setState('query', '');
      emitChange();
    };

    // ── Positioning ──────────────────────────────────────────────────────
    const syncPosition = () => {
      local.stopPosition?.();
      local.stopPosition = null;
      if (!self.getState<boolean>('open')) return;
      const listbox = self.shadowRoot?.querySelector(
        '.listbox'
      ) as HTMLElement | null;
      if (!listbox) return;
      local.stopPosition = scope.add(
        autoPosition(self, listbox, { placement: 'bottom-start', offset: 4 })
      );
    };
    local.syncPosition = syncPosition;

    // ── Input ────────────────────────────────────────────────────────────
    scope.on(self.shadowRoot, 'input', (event) => {
      const input = event.target as HTMLInputElement | null;
      if (input?.tagName !== 'INPUT') return;
      self.setState('query', input.value);
      self.setState('activeIndex', -1);
      open();
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
      if (!isInteractive()) return;
      const options = visibleOptions();
      const isOpen = self.getState<boolean>('open') === true;
      const current = self.getState<number>('activeIndex') ?? -1;

      switch (ke.key) {
        case 'ArrowDown':
          ke.preventDefault();
          if (!isOpen) {
            open();
            self.setState('activeIndex', nextEnabledIndex(options, -1, 1));
            return;
          }
          self.setState('activeIndex', nextEnabledIndex(options, current, 1));
          return;
        case 'ArrowUp':
          ke.preventDefault();
          if (!isOpen) {
            open();
            self.setState('activeIndex', nextEnabledIndex(options, 0, -1));
            return;
          }
          self.setState('activeIndex', nextEnabledIndex(options, current, -1));
          return;
        case 'Home':
          if (!isOpen) return;
          ke.preventDefault();
          self.setState('activeIndex', nextEnabledIndex(options, -1, 1));
          return;
        case 'End':
          if (!isOpen) return;
          ke.preventDefault();
          self.setState('activeIndex', nextEnabledIndex(options, 0, -1));
          return;
        case 'Enter': {
          if (!isOpen) return;
          const option = options[current];
          if (!option || option.disabled) return;
          // Only swallow the key once it actually selects something, so a
          // combobox in a form can still submit with Enter.
          ke.preventDefault();
          selectValue(option.value);
          return;
        }
        case 'Escape':
          if (!isOpen) return;
          ke.preventDefault();
          close();
          return;
        case 'Tab':
          close();
          return;
        case 'Backspace': {
          // An empty query plus Backspace removes the last token, the
          // convention every tag-style multiselect uses.
          const input = ke.target as HTMLInputElement | null;
          if (!isMultiple() || input?.value !== '') return;
          const values = readValues();
          if (values.length === 0) return;
          self.setAttribute('value', values.slice(0, -1).join(','));
          emitChange();
          return;
        }
      }
    });

    scope.on(self.shadowRoot, 'mousedown', (event) => {
      const target = event.target as Element;
      const option = target.closest('.option') as HTMLElement | null;
      if (option) {
        // Prevent the input from losing focus, which would close the list
        // before the click resolves.
        event.preventDefault();
        if (option.getAttribute('aria-disabled') === 'true') return;
        selectValue(option.getAttribute('data-value') ?? '');
        return;
      }
      if (target.closest('.clear')) {
        event.preventDefault();
        clear();
        return;
      }
      if (target.closest('.toggle')) {
        event.preventDefault();
        if (self.getState<boolean>('open')) close();
        else open();
        return;
      }
      const token = target.closest('.token button') as HTMLElement | null;
      if (token) {
        event.preventDefault();
        const value = token.getAttribute('data-value') ?? '';
        self.setAttribute(
          'value',
          readValues()
            .filter((v) => v !== value)
            .join(',')
        );
        emitChange();
      }
    });

    scope.on(self.shadowRoot, 'focusin', (event) => {
      if ((event.target as Element)?.tagName === 'INPUT') open();
    });

    // Closing on outside click is registered once and gated on `open`, so the
    // listener count does not depend on how often the user toggles.
    scope.on(document, 'mousedown', (event) => {
      if (!self.getState<boolean>('open')) return;
      if (self.contains(event.target as Node)) return;
      close();
    });

    // Light-DOM options are the source of truth. `slotchange` is the platform
    // signal for "the distributed children changed" — cheaper than a subtree
    // MutationObserver and, unlike one, it fires for a slot that was created
    // by this component's own first render.
    //
    // It does not cover attribute edits on an existing <option> (a `disabled`
    // toggle, say); a MutationObserver adds that, scoped to those attributes.
    const observer = new MutationObserver(() => syncOptions());
    observer.observe(self, {
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'disabled', 'label'],
    });
    scope.add(() => observer.disconnect());

    queueMicrotask(() => {
      if (!self.isConnected) return;
      const slot = self.shadowRoot?.querySelector(
        'slot.source'
      ) as HTMLSlotElement | null;
      if (!slot) return;
      scope.on(slot, 'slotchange', syncOptions);
      syncOptions();
    });

    syncOptions();

    // A single selection shows its label in the field; seed it on connect so
    // a server-rendered `value` is not displayed as a raw key.
    if (!isMultiple() && !self.getState<string>('query')) {
      const initial = readValues()[0];
      if (initial) {
        const option = readOptions(self).find((o) => o.value === initial);
        if (option) self.setState('query', option.label);
      }
    }
  },
  beforeUpdate() {
    comboboxStore(this).snapshot = captureFocus(this.shadowRoot);
  },
  disconnected() {
    release(this);
  },
  updated() {
    const local = comboboxStore(this);
    restoreFocus(this.shadowRoot, local.snapshot);
    local.snapshot = null;
    local.syncOptions?.();
    local.syncPosition?.();
    syncFormProxy(this);

    // Keep the active option in view during keyboard navigation.
    const active = this.shadowRoot?.querySelector(
      '.option[data-active="true"]'
    ) as HTMLElement | null;
    active?.scrollIntoView?.({ block: 'nearest' });
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-cb';
    const listboxId = `${uid}-listbox`;
    const inputId = `${uid}-input`;
    const isOpen = state.open === true;
    const values = parseValues(props.value);
    const every = (state.options ?? []) as ComboboxOption[];
    const options = props['no-filter']
      ? every
      : filterOptions(every, state.query ?? '', props['filter-mode']);
    const activeIndex = state.activeIndex ?? -1;
    const activeOption = options[activeIndex];
    const hasError = Boolean(props.error);
    const hasHint = Boolean(props.hint) && !hasError;

    const describedBy: string[] = [];
    if (hasError) describedBy.push(`${uid}-err`);
    if (hasHint) describedBy.push(`${uid}-hint`);

    const tokens =
      props.multiple && values.length > 0
        ? values
            .map((value) => {
              const label =
                every.find((o) => o.value === value)?.label ?? value;
              return `<span class="token" part="token">${escapeHtml(label)}<button
                  type="button"
                  data-value="${escapeHtml(value)}"
                  tabindex="-1"
                  aria-label="${escapeHtml(t('combobox.removeOption', { label }))}"
                >&times;</button></span>`;
            })
            .join('')
        : '';

    let lastGroup = '';
    const optionMarkup = options
      .map((option, index) => {
        const selected = values.includes(option.value);
        const groupHeader =
          option.group && option.group !== lastGroup
            ? `<div class="group-label" role="presentation">${escapeHtml(option.group)}</div>`
            : '';
        lastGroup = option.group;
        return `${groupHeader}<div
            id="${escapeHtml(`${uid}-opt-${index}`)}"
            class="option"
            part="option"
            role="option"
            data-value="${escapeHtml(option.value)}"
            data-active="${index === activeIndex ? 'true' : 'false'}"
            aria-selected="${selected ? 'true' : 'false'}"
            aria-disabled="${option.disabled ? 'true' : 'false'}"
          >${escapeHtml(option.label)}</div>`;
      })
      .join('');

    const emptyMarkup = `<div class="empty" role="presentation">${escapeHtml(t('combobox.noResults'))}</div>`;

    return html`
      <slot class="source" aria-hidden="true"></slot>
      <div class="field" part="field">
        ${
          props.label
            ? `<label class="label" part="label" for="${escapeHtml(inputId)}">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</label>`
            : ''
        }
        <div class="control" part="control">
          ${tokens}
          <input
            id="${escapeHtml(inputId)}"
            part="input"
            type="text"
            role="combobox"
            autocomplete="off"
            spellcheck="false"
            value="${escapeHtml(state.query ?? '')}"
            placeholder="${escapeHtml(props.placeholder || t('combobox.placeholder'))}"
            aria-expanded="${isOpen ? 'true' : 'false'}"
            aria-controls="${escapeHtml(listboxId)}"
            aria-autocomplete="list"
            aria-invalid="${hasError ? 'true' : 'false'}"
            ${props.required ? 'aria-required="true"' : ''}
            ${activeOption ? `aria-activedescendant="${escapeHtml(`${uid}-opt-${activeIndex}`)}"` : ''}
            ${describedBy.length > 0 ? `aria-describedby="${escapeHtml(describedBy.join(' '))}"` : ''}
            ${props.disabled ? 'disabled' : ''}
          />
          <span class="actions">
            ${
              props.clearable && values.length > 0
                ? `<button type="button" class="action clear" part="clear" tabindex="-1" aria-label="${escapeHtml(t('combobox.clear'))}">&times;</button>`
                : ''
            }
            <button type="button" class="action toggle" part="toggle" tabindex="-1" aria-label="${escapeHtml(t('combobox.toggle'))}">&#9660;</button>
          </span>
        </div>
        <div
          id="${escapeHtml(listboxId)}"
          class="listbox"
          part="listbox"
          role="listbox"
          ${props.multiple ? 'aria-multiselectable="true"' : ''}
          ${props.label ? `aria-label="${escapeHtml(props.label)}"` : ''}
        >
          ${options.length > 0 ? optionMarkup : emptyMarkup}
        </div>
        ${hasHint ? `<span class="hint" id="${uid}-hint" part="hint">${escapeHtml(props.hint)}</span>` : ''}
        ${hasError ? `<span class="error-msg" id="${uid}-err" role="alert" part="error">${escapeHtml(props.error)}</span>` : ''}
        <span class="sr-only" role="status" aria-live="polite">
          ${isOpen ? escapeHtml(t('combobox.resultCount', { count: options.length })) : ''}
        </span>
      </div>
    `;
  },
};

component<BqComboboxProps, BqComboboxState>('bq-combobox', definition);
