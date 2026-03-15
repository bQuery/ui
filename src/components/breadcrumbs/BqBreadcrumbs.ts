/**
 * Breadcrumbs navigation.
 * @element bq-breadcrumbs
 * @prop {string} separator - Separator character or text (default: /)
 * @slot - <a> or other link elements
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqBreadcrumbsProps = { separator: string };
const SEPARATOR_ATTR = 'data-bq-breadcrumb-separator';

const isSeparatorElement = (element: Element): boolean =>
  element.hasAttribute(SEPARATOR_ATTR);

const getBreadcrumbSignature = (items: Element[], separator: string): string =>
  `${separator}::${items.map((item) => `${item.tagName}:${item.getAttribute('href') ?? ''}:${item.textContent?.trim() ?? ''}`).join('|')}`;

const definition: ComponentDefinition<BqBreadcrumbsProps> = {
  props: {
    separator: { type: String, default: '/' },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .breadcrumbs { display: flex; align-items: center; flex-wrap: wrap; list-style: none; margin: 0; padding: 0; font-family: var(--bq-font-family-sans); font-size: var(--bq-font-size-sm,0.875rem); gap: 0; }
    ::slotted(a) { color: var(--bq-text-muted,#475569); text-decoration: none; transition: color var(--bq-duration-fast); }
    ::slotted(a:hover) { color: var(--bq-color-primary-600,#2563eb); text-decoration: underline; }
    ::slotted([aria-current="page"]) { color: var(--bq-text-base,#0f172a); font-weight: var(--bq-font-weight-medium,500); pointer-events: none; }
    ::slotted([data-bq-breadcrumb-separator]) { color: var(--bq-text-subtle,#94a3b8); margin: 0 var(--bq-space-2,0.5rem); user-select: none; }
  `,
  connected() {
    const self = this;
    const applyAttrs = () => {
      const slot = self.shadowRoot?.querySelector('slot') as HTMLSlotElement | null;
      if (!slot) return;
      const items = slot.assignedElements({ flatten: true }).filter((item) => !isSeparatorElement(item));
      const separatorText = self.getAttribute('separator') || '/';
      const state = self as unknown as Record<string, unknown>;
      if (state['_syncingSeparators']) return;
      const signature = getBreadcrumbSignature(items, separatorText);

      items.forEach((item, i) => {
        if (i === items.length - 1) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });

      const separatorCount = self.querySelectorAll<HTMLElement>(`[${SEPARATOR_ATTR}]`).length;
      if (state['_separatorSignature'] === signature && separatorCount === Math.max(0, items.length - 1)) {
        return;
      }

      state['_syncingSeparators'] = true;
      state['_separatorSignature'] = signature;
      try {
        self.querySelectorAll<HTMLElement>(`[${SEPARATOR_ATTR}]`).forEach((separator) => separator.remove());
        items.forEach((item, i) => {
          if (i < items.length - 1) {
            const separator = document.createElement('span');
            separator.setAttribute(SEPARATOR_ATTR, '');
            separator.setAttribute('aria-hidden', 'true');
            separator.textContent = separatorText;
            item.after(separator);
          }
        });
      } finally {
        state['_syncingSeparators'] = false;
      }
    };
    (self as unknown as Record<string, unknown>)['_applyAttrs'] = applyAttrs;
    queueMicrotask(() => {
      const slot = self.shadowRoot?.querySelector('slot') as HTMLSlotElement | null;
      if (!slot) return;
      slot.addEventListener('slotchange', applyAttrs);
      (self as unknown as Record<string, unknown>)['_slot'] = slot;
      applyAttrs();
    });
  },
  disconnected() {
    const self = this as unknown as Record<string, unknown>;
    const applyAttrs = self['_applyAttrs'] as EventListener | undefined;
    const slot = self['_slot'] as HTMLSlotElement | null | undefined;
    if (slot && applyAttrs) slot.removeEventListener('slotchange', applyAttrs);
  },
  updated() {
    const applyAttrs = (this as unknown as Record<string, unknown>)['_applyAttrs'] as (() => void) | undefined;
    applyAttrs?.();
  },
  render({ props }) {
    return html`
      <nav aria-label="Breadcrumb" part="nav">
        <ol class="breadcrumbs" part="list">
          <slot></slot>
        </ol>
      </nav>
    `;
  },
};

export function registerBqBreadcrumbs(prefix = 'bq'): string {
  const tag = `${prefix}-breadcrumbs`;
  component<BqBreadcrumbsProps>(tag, definition);
  return tag;
}
