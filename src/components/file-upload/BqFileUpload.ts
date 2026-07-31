/**
 * File upload component — drop zone with a native file input behind it.
 * @element bq-file-upload
 * @prop {string}  accept    - Comma-separated accept list forwarded to the input
 * @prop {boolean} multiple
 * @prop {boolean} disabled
 * @prop {number}  max-size  - Maximum size per file in bytes (0 = unlimited)
 * @prop {string}  name      - Form field name
 * @prop {string}  label
 * @prop {string}  hint      - Helper text shown under the drop zone
 * @prop {string}  error     - Error message; marks the field invalid
 * @slot icon - Drop zone icon
 * @fires bq-change   - { files: File[] }
 * @fires bq-rejected - { files: { file: File, reason: string }[] }
 */
import { bool, component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { iconCss } from '../../utils/icons.js';
import { baseStyles, focusRing, reset, srOnly } from '../../utils/styles.js';

type BqFileUploadProps = {
  accept: string;
  multiple: boolean;
  disabled: boolean;
  'max-size': number;
  name: string;
  label: string;
  hint: string;
  error: string;
};
type BqFileUploadState = { uid: string };

const uploadStore = (owner: object) =>
  store<{ files: File[]; renderFiles?: () => void }>(owner, () => ({
    files: [],
  }));

/** Human-readable byte size, e.g. `1.4 MB`. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  const rounded = exponent === 0 ? String(bytes) : value.toFixed(1);
  return `${rounded} ${units[exponent]}`;
}

/** True when the file satisfies an `accept` list of extensions and MIME patterns. */
export function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (patterns.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = (file.type || '').toLowerCase();
  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) return name.endsWith(pattern);
    if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1));
    return type === pattern;
  });
}

const definition: ComponentDefinition<BqFileUploadProps, BqFileUploadState> = {
  // `accept` is outside the framework's base allowlist; the value is escaped
  // and only ever comes from this component's own prop.
  sanitize: { allowAttributes: ['accept'] },
  props: {
    accept: { type: String, default: '' },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    'max-size': { type: Number, default: 0 },
    name: { type: String, default: '' },
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
  },
  state: {
    uid: '',
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    ${focusRing}
    ${iconCss('upload')}
    :host { display: block; }
    .field { font-family: var(--bq-font-family-sans); }
    .label {
      display: block;
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-medium,500);
      color: var(--bq-text-base,#0f172a);
      margin-bottom: 0.375rem;
    }
    .zone {
      display: flex; flex-direction: column; align-items: center; gap: 0.375rem;
      padding: 1.5rem 1rem; width: 100%;
      border: 2px dashed var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-lg,0.5rem);
      background: var(--bq-bg-subtle,#f8fafc);
      color: var(--bq-text-muted,#475569);
      font: inherit; font-size: var(--bq-font-size-sm,0.875rem);
      cursor: pointer; text-align: center;
      transition: border-color var(--bq-duration-fast) var(--bq-easing-standard),
                  background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .zone:hover:not(:disabled) { border-color: var(--bq-color-primary-600,#2563eb); background: var(--bq-bg-selected,rgba(37,99,235,0.1)); }
    .zone:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }
    .zone:disabled { opacity: 0.55; cursor: not-allowed; }
    :host([data-dragging]) .zone { border-color: var(--bq-color-primary-600,#2563eb); background: var(--bq-bg-selected,rgba(37,99,235,0.1)); }
    :host([error]) .zone { border-color: var(--bq-color-danger-600,#dc2626); }
    .browse { color: var(--bq-color-primary-600,#2563eb); font-weight: var(--bq-font-weight-semibold,600); }
    .dropzone-icon { display: inline-flex; color: var(--bq-text-subtle,#94a3b8); }
    .dropzone-icon .icon { --bq-icon-size: 2rem; }

    input[type="file"] {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }

    .files { list-style: none; margin: 0.625rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.375rem; }
    .file {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.375rem 0.5rem;
      border: 1px solid var(--bq-border-base,#e2e8f0);
      border-radius: var(--bq-radius-md,0.375rem);
      background: var(--bq-bg-base,#fff);
      font-size: var(--bq-font-size-xs,0.75rem);
    }
    .file-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--bq-text-base,#0f172a); }
    .file-size { flex: 0 0 auto; color: var(--bq-text-subtle,#94a3b8); }
    .remove {
      flex: 0 0 auto;
      display: inline-flex; align-items: center; justify-content: center;
      width: 1.25rem; height: 1.25rem;
      border: none; border-radius: var(--bq-radius-sm,0.25rem);
      background: transparent; color: var(--bq-text-muted,#475569);
      cursor: pointer; font-size: 0.875rem; line-height: 1;
    }
    .remove:hover { background: var(--bq-bg-muted,#f1f5f9); color: var(--bq-color-danger-600,#dc2626); }
    .remove:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); }

    .message { font-size: var(--bq-font-size-xs,0.75rem); margin-top: 0.375rem; }
    .hint  { color: var(--bq-text-subtle,#94a3b8); }
    .error { color: var(--bq-color-danger-600,#dc2626); }
    @media (prefers-reduced-motion: reduce) {
      .zone { transition: none; }
    }
  `,
  connected() {
    const self = host<BqFileUploadState>(this);
    const scope = bind(self);
    const local = uploadStore(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-upload'));

    const input = () =>
      self.shadowRoot?.querySelector('input[type="file"]') as
        | HTMLInputElement
        | null;

    const renderFiles = () => {
      const list = self.shadowRoot?.querySelector('.files');
      if (!list) return;
      list.textContent = '';
      const doc = self.ownerDocument;
      for (const [index, file] of local.files.entries()) {
        const item = doc.createElement('li');
        item.className = 'file';
        item.setAttribute('part', 'file');

        const name = doc.createElement('span');
        name.className = 'file-name';
        // textContent, not innerHTML: file names are attacker-controlled.
        name.textContent = file.name;

        const size = doc.createElement('span');
        size.className = 'file-size';
        size.textContent = formatBytes(file.size);

        const remove = doc.createElement('button');
        remove.type = 'button';
        remove.className = 'remove';
        remove.setAttribute('data-index', String(index));
        remove.setAttribute('aria-label', `${t('fileUpload.remove')}: ${file.name}`);
        remove.textContent = '×';

        item.append(name, size, remove);
        list.appendChild(item);
      }
      const status = self.shadowRoot?.querySelector('.status');
      if (status) {
        status.textContent =
          local.files.length > 0
            ? t('fileUpload.selected', { count: local.files.length })
            : '';
      }
    };

    const accept = (incoming: File[]) => {
      const acceptList = self.getAttribute('accept') ?? '';
      const maxSize = Number(self.getAttribute('max-size') ?? '0');
      const multiple = self.hasAttribute('multiple');

      const accepted: File[] = [];
      const rejected: { file: File; reason: string }[] = [];
      for (const file of incoming) {
        if (!matchesAccept(file, acceptList)) {
          rejected.push({ file, reason: 'accept' });
        } else if (maxSize > 0 && file.size > maxSize) {
          rejected.push({ file, reason: 'max-size' });
        } else {
          accepted.push(file);
        }
      }

      local.files = multiple
        ? [...local.files, ...accepted]
        : accepted.slice(0, 1);
      renderFiles();

      if (rejected.length > 0) {
        self.dispatchEvent(
          new CustomEvent('bq-rejected', {
            detail: { files: rejected },
            bubbles: true,
            composed: true,
          })
        );
      }
      if (accepted.length > 0) {
        self.dispatchEvent(
          new CustomEvent('bq-change', {
            detail: { files: [...local.files] },
            bubbles: true,
            composed: true,
          })
        );
      }
    };

    scope.on(self.shadowRoot, 'click', (e) => {
      const target = e.target as Element;
      const remove = target.closest('.remove') as HTMLElement | null;
      if (remove) {
        const index = Number(remove.getAttribute('data-index') ?? '-1');
        if (index < 0 || index >= local.files.length) return;
        local.files = local.files.filter((_, i) => i !== index);
        renderFiles();
        self.dispatchEvent(
          new CustomEvent('bq-change', {
            detail: { files: [...local.files] },
            bubbles: true,
            composed: true,
          })
        );
        return;
      }
      if (target.closest('.zone') && !self.hasAttribute('disabled')) {
        input()?.click();
      }
    });

    scope.on(self.shadowRoot, 'change', (e) => {
      const field = e.target as HTMLInputElement | null;
      if (!field || field.type !== 'file') return;
      accept(Array.from(field.files ?? []));
      // Reset so re-picking the same file still fires `change`.
      field.value = '';
    });

    const setDragging = (dragging: boolean) => {
      if (dragging) self.setAttribute('data-dragging', '');
      else self.removeAttribute('data-dragging');
    };

    scope.on(self, 'dragover', (e) => {
      if (self.hasAttribute('disabled')) return;
      e.preventDefault();
      setDragging(true);
    });
    scope.on(self, 'dragleave', (e) => {
      // Ignore the dragleave fired when moving between descendants.
      const related = (e as DragEvent).relatedTarget as Node | null;
      if (related && self.contains(related)) return;
      setDragging(false);
    });
    scope.on(self, 'drop', (e) => {
      if (self.hasAttribute('disabled')) return;
      e.preventDefault();
      setDragging(false);
      const dropped = (e as DragEvent).dataTransfer?.files;
      if (dropped && dropped.length > 0) accept(Array.from(dropped));
    });

    // The list lives in the shadow root, which every re-render replaces, so
    // `updated()` has to paint it again from the retained selection.
    local.renderFiles = renderFiles;

    scope.add(() => {
      local.files = [];
      delete local.renderFiles;
    });
    scope.frame(renderFiles);
  },
  disconnected() {
    release(this);
  },
  updated() {
    uploadStore(this).renderFiles?.();
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-upload';
    const inputId = `${uid}-input`;
    const hintId = `${uid}-hint`;
    const errorId = `${uid}-error`;
    const describedBy = [props.hint ? hintId : '', props.error ? errorId : '']
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="field" part="field">
        ${
          props.label
            ? `<label class="label" part="label" for="${escapeHtml(inputId)}">${escapeHtml(props.label)}</label>`
            : ''
        }
        <input
          id="${escapeHtml(inputId)}"
          type="file"
          part="input"
          tabindex="-1"
          aria-hidden="true"
          ${props.accept ? `accept="${escapeHtml(props.accept)}"` : ''}
          ${bool('multiple', props.multiple)}
          ${bool('disabled', props.disabled)}
          ${props.name ? `name="${escapeHtml(props.name)}"` : ''}
        />
        <button
          type="button"
          class="zone"
          part="zone"
          ${bool('disabled', props.disabled)}
          ${props.error ? 'aria-invalid="true"' : ''}
          ${describedBy ? `aria-describedby="${escapeHtml(describedBy)}"` : ''}
        >
          <span class="dropzone-icon" part="icon"><slot name="icon"><span class="icon" data-icon="upload" aria-hidden="true"></span></slot></span>
          <span
            >${escapeHtml(t('fileUpload.hint'))}
            <span class="browse">${escapeHtml(t('fileUpload.browse'))}</span></span
          >
        </button>
        <ul class="files" part="files"></ul>
        <span class="sr-only status" role="status" aria-live="polite"></span>
        ${
          props.error
            ? `<p class="message error" part="error" id="${escapeHtml(errorId)}" role="alert">${escapeHtml(props.error)}</p>`
            : props.hint
              ? `<p class="message hint" part="hint" id="${escapeHtml(hintId)}">${escapeHtml(props.hint)}</p>`
              : ''
        }
      </div>
    `;
  },
};

component<BqFileUploadProps, BqFileUploadState>('bq-file-upload', definition);
