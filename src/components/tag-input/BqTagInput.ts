/**
 * Tag input — free-form entry that turns text into removable tokens.
 *
 * Distinct from `bq-combobox`: there is no predefined option list. The user
 * types whatever they want and commits it with Enter (or one of the
 * `delimiters`), which is the right control for keywords, recipients and
 * labels.
 *
 * The token list is exposed to assistive technology as a real list, and each
 * remove button names the tag it removes, so a screen-reader user is never
 * left with an unlabelled "×".
 *
 * @element bq-tag-input
 * @prop {string}  label
 * @prop {string}  value       - Current tags, joined by `separator`
 * @prop {string}  placeholder
 * @prop {string}  name        - Form field name
 * @prop {string}  separator   - Character joining the submitted value @default ','
 * @prop {string}  delimiters  - Characters that commit a tag while typing @default ','
 * @prop {number}  max         - Maximum number of tags; 0 means unlimited
 * @prop {boolean} allow-duplicates
 * @prop {boolean} disabled
 * @prop {boolean} required
 * @prop {string}  error
 * @prop {string}  hint
 * @prop {string}  size        - sm | md | lg
 * @fires bq-change - { value: string, tags: string[] }
 * @fires bq-add    - { tag: string }
 * @fires bq-remove - { tag: string }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { captureFocus, restoreFocus } from '../../utils/focus.js';
import type { FocusSnapshot } from '../../utils/focus.js';
import { bindFormProxy, syncFormProxy } from '../../utils/form.js';
import { baseStyles, reset, srOnly } from '../../utils/styles.js';
import { bindValidation } from '../../utils/validation.js';

type BqTagInputProps = {
  label: string;
  value: string;
  placeholder: string;
  name: string;
  separator: string;
  delimiters: string;
  max: number;
  'allow-duplicates': boolean;
  disabled: boolean;
  required: boolean;
  error: string;
  hint: string;
  size: string;
};

type BqTagInputState = { uid: string; draft: string };

const tagStore = (owner: object) =>
  store<{ snapshot?: FocusSnapshot | null }>(owner, () => ({}));

/** Splits a joined value into individual tags. */
export function parseTags(raw: string, separator = ','): string[] {
  const sep = separator || ',';
  return raw
    .split(sep)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

/**
 * Adds a tag, returning the new list — or `null` when nothing changed.
 *
 * Returning `null` rather than an unchanged copy lets the caller skip both the
 * re-render and the `bq-add` event when the tag was rejected as a duplicate or
 * because the list is full.
 */
export function addTag(
  tags: string[],
  candidate: string,
  options: { max?: number; allowDuplicates?: boolean } = {}
): string[] | null {
  const tag = candidate.trim();
  if (!tag) return null;
  const { max = 0, allowDuplicates = false } = options;
  if (max > 0 && tags.length >= max) return null;
  if (!allowDuplicates && tags.includes(tag)) return null;
  return [...tags, tag];
}

const definition: ComponentDefinition<BqTagInputProps, BqTagInputState> = {
  props: {
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    name: { type: String, default: '' },
    separator: { type: String, default: ',' },
    delimiters: { type: String, default: ',' },
    max: { type: Number, default: 0 },
    'allow-duplicates': { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    size: { type: String, default: 'md' },
  },
  state: { uid: '', draft: '' },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    :host { display: block; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; }
    .label {
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-medium,500);
      color: var(--bq-text-base,#0f172a);
      font-family: var(--bq-font-family-sans);
    }
    .required-mark { color: var(--bq-color-danger-600,#dc2626); }
    .control {
      display: flex; align-items: center; flex-wrap: wrap; gap: 0.25rem;
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

    .tags { display: contents; list-style: none; margin: 0; padding: 0; }
    .tag {
      display: inline-flex; align-items: center; gap: 0.25rem;
      background: var(--bq-color-primary-50,#eff6ff);
      color: var(--bq-color-primary-700,#1d4ed8);
      border: 1px solid var(--bq-color-primary-200,#bfdbfe);
      border-radius: var(--bq-radius-sm,0.25rem);
      padding: 0.125rem 0.25rem 0.125rem 0.5rem;
      font-size: var(--bq-font-size-sm,0.875rem);
      font-family: var(--bq-font-family-sans);
    }
    .tag button {
      border: none; background: none; cursor: pointer; line-height: 1;
      color: inherit; padding: 0 0.125rem;
      border-radius: var(--bq-radius-sm,0.25rem);
    }
    .tag button:hover { color: var(--bq-color-danger-600,#dc2626); }
    .tag button:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }

    input {
      flex: 1 1 6rem; min-width: 4rem;
      border: none; outline: none; background: transparent;
      color: var(--bq-text-base,#0f172a);
      font-family: var(--bq-font-family-sans);
    }
    :host([size="sm"]) input { font-size: 0.875rem; padding: 0.25rem 0.375rem; }
    :host([size="md"]) input, :host(:not([size])) input { font-size: 1rem; padding: 0.375rem 0.5rem; }
    :host([size="lg"]) input { font-size: 1.125rem; padding: 0.5rem 0.625rem; }
    input:disabled { cursor: not-allowed; }

    .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); }
    .error-msg { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-color-danger-600,#dc2626); font-family: var(--bq-font-family-sans); }
    .count { margin-inline-start: auto; font-size: var(--bq-font-size-xs,0.75rem); color: var(--bq-text-muted,#475569); }
    @media (prefers-reduced-motion: reduce) {
      .control { transition: none; }
    }
  `,
  connected() {
    const self = host<BqTagInputState>(this);
    const scope = bind(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-tags'));

    const separator = () => self.getAttribute('separator') || ',';
    const readTags = () =>
      parseTags(self.getAttribute('value') ?? '', separator());
    const isInteractive = () => !self.hasAttribute('disabled');

    bindFormProxy(self, scope, {
      value: () => self.getAttribute('value') ?? '',
    });
    bindValidation(self, scope, {
      value: () => self.getAttribute('value') ?? '',
    });

    const commitTags = (tags: string[]) => {
      self.setAttribute('value', tags.join(separator()));
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: { value: tags.join(separator()), tags },
          bubbles: true,
          composed: true,
        })
      );
    };

    const commitDraft = (raw: string): boolean => {
      const next = addTag(readTags(), raw, {
        max: Number(self.getAttribute('max') ?? '0') || 0,
        allowDuplicates: self.hasAttribute('allow-duplicates'),
      });
      if (!next) return false;
      const tag = raw.trim();
      commitTags(next);
      self.dispatchEvent(
        new CustomEvent('bq-add', {
          detail: { tag },
          bubbles: true,
          composed: true,
        })
      );
      return true;
    };

    const removeAt = (index: number) => {
      const tags = readTags();
      const tag = tags[index];
      if (tag === undefined) return;
      commitTags(tags.filter((_, i) => i !== index));
      self.dispatchEvent(
        new CustomEvent('bq-remove', {
          detail: { tag },
          bubbles: true,
          composed: true,
        })
      );
    };

    const delimiters = (): string[] =>
      Array.from(self.getAttribute('delimiters') ?? ',').filter(
        (ch) => ch !== ''
      );

    scope.on(self.shadowRoot, 'input', (event) => {
      const input = event.target as HTMLInputElement | null;
      if (input?.tagName !== 'INPUT') return;

      // A delimiter typed (or pasted) mid-string splits the draft into as many
      // tags as it contains, so pasting "a, b, c" yields three tags.
      const chars = delimiters();
      if (chars.some((ch) => input.value.includes(ch))) {
        const pattern = new RegExp(
          `[${chars.map((ch) => ch.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')).join('')}]`
        );
        const parts = input.value.split(pattern);
        const trailing = parts.pop() ?? '';
        for (const part of parts) commitDraft(part);
        input.value = trailing;
        self.setState('draft', trailing);
        return;
      }
      self.setState('draft', input.value);
    });

    scope.on(self.shadowRoot, 'keydown', (event) => {
      const ke = event as KeyboardEvent;
      if (!isInteractive()) return;
      const input = ke.target as HTMLInputElement | null;

      if (ke.key === 'Enter') {
        if (!input || input.tagName !== 'INPUT') return;
        // Only swallow Enter when it actually creates a tag, so an empty
        // field still submits the surrounding form.
        if (input.value.trim() === '') return;
        ke.preventDefault();
        if (commitDraft(input.value)) {
          input.value = '';
          self.setState('draft', '');
        }
        return;
      }

      if (ke.key === 'Backspace') {
        if (!input || input.value !== '') return;
        const tags = readTags();
        if (tags.length === 0) return;
        ke.preventDefault();
        removeAt(tags.length - 1);
        return;
      }

      if (ke.key === 'Escape') {
        if (!input || input.value === '') return;
        ke.preventDefault();
        input.value = '';
        self.setState('draft', '');
      }
    });

    // Committing on blur means a half-typed tag is not silently discarded
    // when the user tabs away.
    scope.on(self.shadowRoot, 'focusout', (event) => {
      const input = event.target as HTMLInputElement | null;
      if (input?.tagName !== 'INPUT' || input.value.trim() === '') return;
      if (commitDraft(input.value)) {
        input.value = '';
        self.setState('draft', '');
      }
    });

    scope.on(self.shadowRoot, 'click', (event) => {
      const button = (event.target as Element).closest(
        '.tag button'
      ) as HTMLElement | null;
      if (button) {
        if (!isInteractive()) return;
        removeAt(Number(button.getAttribute('data-index') ?? '-1'));
        return;
      }
      // Clicking anywhere in the field should put the caret in the input,
      // the way a native multi-value field behaves.
      if ((event.target as Element).closest('.control')) {
        (
          self.shadowRoot?.querySelector('input') as HTMLInputElement | null
        )?.focus();
      }
    });
  },
  beforeUpdate() {
    tagStore(this).snapshot = captureFocus(this.shadowRoot);
  },
  disconnected() {
    release(this);
  },
  updated() {
    const local = tagStore(this);
    restoreFocus(this.shadowRoot, local.snapshot);
    local.snapshot = null;
    syncFormProxy(this);
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-tags';
    const inputId = `${uid}-input`;
    const tags = parseTags(props.value, props.separator || ',');
    const hasError = Boolean(props.error);
    const hasHint = Boolean(props.hint) && !hasError;
    const max = Math.max(0, Math.trunc(props.max) || 0);
    const full = max > 0 && tags.length >= max;

    const describedBy: string[] = [];
    if (hasError) describedBy.push(`${uid}-err`);
    if (hasHint) describedBy.push(`${uid}-hint`);

    const tagMarkup = tags
      .map(
        (tag, index) => `<li class="tag" part="tag">${escapeHtml(tag)}<button
            type="button"
            part="tag-remove"
            data-index="${index}"
            aria-label="${escapeHtml(t('tagInput.remove', { tag }))}"
            ${props.disabled ? 'disabled' : ''}
          >&times;</button></li>`
      )
      .join('');

    return html`
      <div class="field" part="field">
        ${
          props.label
            ? `<label class="label" part="label" for="${escapeHtml(inputId)}">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</label>`
            : ''
        }
        <div class="control" part="control">
          <ul
            class="tags"
            part="tags"
            aria-label="${escapeHtml(t('tagInput.listLabel'))}"
          >${tagMarkup}</ul>
          <input
            id="${escapeHtml(inputId)}"
            part="input"
            type="text"
            autocomplete="off"
            value="${escapeHtml(state.draft ?? '')}"
            placeholder="${escapeHtml(full ? '' : props.placeholder || t('tagInput.placeholder'))}"
            aria-invalid="${hasError ? 'true' : 'false'}"
            aria-describedby="${escapeHtml([...describedBy, `${uid}-help`].join(' '))}"
            ${props.required ? 'aria-required="true"' : ''}
            ${props.disabled || full ? 'disabled' : ''}
          />
          ${max > 0 ? `<span class="count" part="count">${tags.length}/${max}</span>` : ''}
        </div>
        ${hasHint ? `<span class="hint" id="${uid}-hint" part="hint">${escapeHtml(props.hint)}</span>` : ''}
        ${hasError ? `<span class="error-msg" id="${uid}-err" role="alert" part="error">${escapeHtml(props.error)}</span>` : ''}
        <span class="sr-only" id="${uid}-help">${escapeHtml(t('tagInput.help'))}</span>
        <span class="sr-only" role="status" aria-live="polite"
          >${escapeHtml(t('tagInput.count', { count: tags.length }))}</span
        >
      </div>
    `;
  },
};

component<BqTagInputProps, BqTagInputState>('bq-tag-input', definition);
