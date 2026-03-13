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
  `,
  connected() {
    const self = this;
    const applyAttrs = () => {
      const slot = self.shadowRoot?.querySelector('slot') as HTMLSlotElement | null;
      if (!slot) return;
      const items = slot.assignedElements({ flatten: true });
      items.forEach((item, i) => {
        if (i === items.length - 1) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
    };
    const slot = self.shadowRoot?.querySelector('slot') as HTMLSlotElement | null;
    slot?.addEventListener('slotchange', applyAttrs);
    (self as unknown as Record<string, unknown>)['_applyAttrs'] = applyAttrs;
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
