/**
 * Textarea form field.
 * @element bq-textarea
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqTextareaProps = {
  label: string; value: string; placeholder: string; name: string; rows: number;
  disabled: boolean; readonly: boolean; required: boolean; error: string; hint: string; maxlength: string;
};

const definition: ComponentDefinition<BqTextareaProps> = {
  props: {
    label:      { type: String, default: '' },
    value:      { type: String, default: '' },
    placeholder:{ type: String, default: '' },
    name:       { type: String, default: '' },
    rows:       { type: Number, default: 4 },
    disabled:   { type: Boolean, default: false },
    readonly:   { type: Boolean, default: false },
    required:   { type: Boolean, default: false },
    error:      { type: String, default: '' },
    hint:       { type: String, default: '' },
    maxlength:  { type: String, default: '' },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; }
    .label { font-size: var(--bq-font-size-sm,0.875rem); font-weight: var(--bq-font-weight-medium,500); color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans); display: flex; align-items: center; gap: 0.25rem; }
    .required-mark { color: var(--bq-color-danger-600,#dc2626); }
    textarea {
      display: block; width: 100%; border: 1.5px solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-lg,0.5rem); background: var(--bq-bg-base,#fff);
      color: var(--bq-text-base,#0f172a); font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-md,1rem); padding: 0.5rem 0.875rem;
      resize: vertical; outline: none;
      transition: border-color var(--bq-duration-fast) var(--bq-easing-standard), box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    textarea:focus { border-color: var(--bq-border-focus,#2563eb); box-shadow: var(--bq-focus-ring); }
    :host([error]:not([error=""])) textarea { border-color: var(--bq-color-danger-500,#ef4444); }
    :host([error]:not([error=""])) textarea:focus { border-color: var(--bq-color-danger-500,#ef4444); box-shadow: var(--bq-focus-ring-danger); }
    :host([disabled]) textarea { opacity: 0.5; cursor: not-allowed; background: var(--bq-bg-muted,#f1f5f9); }
    textarea::placeholder { color: var(--bq-text-subtle,#94a3b8); }
    .hint { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); font-family: var(--bq-font-family-sans); }
    .error-msg { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-color-danger-600,#dc2626); font-family: var(--bq-font-family-sans); }
  `,
  connected() {
    const self = this;
    const ih = (e: Event) => { const t = e.target as HTMLTextAreaElement | null; if (t?.tagName === 'TEXTAREA') self.dispatchEvent(new CustomEvent('bq-input', { detail: { value: t.value }, bubbles: true, composed: true })); };
    const ch = (e: Event) => { const t = e.target as HTMLTextAreaElement | null; if (t?.tagName === 'TEXTAREA') self.dispatchEvent(new CustomEvent('bq-change', { detail: { value: t.value }, bubbles: true, composed: true })); };
    const fh = (e: Event) => { if ((e.target as Element)?.tagName === 'TEXTAREA') self.dispatchEvent(new CustomEvent('bq-focus', { bubbles: true, composed: true })); };
    const bh = (e: Event) => { if ((e.target as Element)?.tagName === 'TEXTAREA') self.dispatchEvent(new CustomEvent('bq-blur', { bubbles: true, composed: true })); };
    const s = self as unknown as Record<string, unknown>;
    s['_ih'] = ih; s['_ch'] = ch; s['_fh'] = fh; s['_bh'] = bh;
    self.shadowRoot?.addEventListener('input', ih);
    self.shadowRoot?.addEventListener('change', ch);
    self.shadowRoot?.addEventListener('focusin', fh);
    self.shadowRoot?.addEventListener('focusout', bh);
  },
  disconnected() {
    const s = this as unknown as Record<string, unknown>;
    const sr = this.shadowRoot;
    (['_ih','_ch','_fh','_bh'] as const).forEach(k => { const h = s[k] as EventListener | undefined; if (h) sr?.removeEventListener(k === '_ih' ? 'input' : k === '_ch' ? 'change' : k === '_fh' ? 'focusin' : 'focusout', h); });
  },
  render({ props }) {
    const hasError = Boolean(props.error);
    const uid = `bq-ta-${Math.random().toString(36).slice(2,8)}`;
    return html`
      <div class="field" part="field">
        ${props.label ? `<label class="label" for="${uid}" part="label">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</label>` : ''}
        <textarea part="textarea" id="${uid}" name="${escapeHtml(props.name)}" rows="${String(props.rows)}"
          placeholder="${escapeHtml(props.placeholder)}"
          ${props.maxlength ? `maxlength="${escapeHtml(props.maxlength)}"` : ''}
          ${props.disabled ? 'disabled' : ''} ${props.readonly ? 'readonly' : ''} ${props.required ? 'required' : ''}
          aria-invalid="${hasError ? 'true' : 'false'}"
          ${hasError ? `aria-describedby="${uid}-err"` : (props.hint ? `aria-describedby="${uid}-hint"` : '')}
        >${escapeHtml(props.value)}</textarea>
        ${hasError ? `<span class="error-msg" id="${uid}-err" role="alert" part="error">${escapeHtml(props.error)}</span>` : ''}
        ${(props.hint && !hasError) ? `<span class="hint" id="${uid}-hint" part="hint">${escapeHtml(props.hint)}</span>` : ''}
      </div>
    `;
  },
};

export function registerBqTextarea(prefix = 'bq'): string {
  const tag = `${prefix}-textarea`;
  component<BqTextareaProps>(tag, definition);
  return tag;
}
