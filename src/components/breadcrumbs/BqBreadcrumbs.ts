/**
 * Breadcrumbs navigation.
 * @element bq-breadcrumbs
 * @prop {string} separator - Separator character or text (default: /)
 * @slot - <a> or other link elements; the last item is automatically marked as `aria-current="page"`
 *
 * @cssprop --bq-breadcrumb-separator - Override the separator string ("/" by default)
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { t } from '../../i18n/index.js';
import { host } from '../../utils/component.js';
import { baseStyles } from '../../utils/styles.js';

type BqBreadcrumbsProps = { separator: string };

/**
 * Escape a string for safe use as a CSS `content` value.
 * Wraps in quotes and backslash-escapes embedded backslashes / quotes.
 */
const cssQuote = (raw: string): string =>
  `"${raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const definition: ComponentDefinition<BqBreadcrumbsProps> = {
  props: {
    separator: { type: String, default: '/' },
  },
  styles: css`
    ${baseStyles}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .breadcrumbs { display: flex; align-items: center; flex-wrap: wrap; list-style: none; margin: 0; padding: 0; font-family: var(--bq-font-family-sans); font-size: var(--bq-font-size-sm,0.875rem); gap: 0; }
    ::slotted(*) { display: inline-flex; align-items: center; }
    ::slotted(*:not(:first-child))::before {
      content: var(--bq-breadcrumb-separator, "/");
      color: var(--bq-text-subtle,#94a3b8);
      margin: 0 var(--bq-space-2,0.5rem);
      user-select: none;
      pointer-events: none;
      speak: never;
    }
    ::slotted(a) { color: var(--bq-text-muted,#475569); text-decoration: none; transition: color var(--bq-duration-fast); }
    ::slotted(a:hover) { color: var(--bq-color-primary-600,#2563eb); text-decoration: underline; }
    ::slotted([aria-current="page"]) { color: var(--bq-text-base,#0f172a); font-weight: var(--bq-font-weight-medium,500); pointer-events: none; }
    @media (prefers-reduced-motion: reduce) {
      ::slotted(a) { transition: none; }
    }
  `,
  connected() {
    const self = host(this);
    const applyAttrs = () => {
      const slot = self.shadowRoot?.querySelector(
        'slot'
      ) as HTMLSlotElement | null;
      if (!slot) return;
      const items = slot.assignedElements({ flatten: true });
      items.forEach((item, i) => {
        if (i === items.length - 1) item.setAttribute('aria-current', 'page');
        else item.removeAttribute('aria-current');
      });
    };
    const applySeparatorVar = () => {
      // Only set an inline override when the host explicitly carries a
      // `separator` attribute. This keeps the `--bq-breadcrumb-separator`
      // CSS custom property externally overridable when the prop is omitted.
      const attr = self.getAttribute('separator');
      if (attr === null) {
        self.style.removeProperty('--bq-breadcrumb-separator');
        return;
      }
      self.style.setProperty('--bq-breadcrumb-separator', cssQuote(attr));
    };
    (self as unknown as Record<string, unknown>)['_applyAttrs'] = applyAttrs;
    (self as unknown as Record<string, unknown>)['_applySeparatorVar'] =
      applySeparatorVar;
    applySeparatorVar();
    queueMicrotask(() => {
      const slot = self.shadowRoot?.querySelector(
        'slot'
      ) as HTMLSlotElement | null;
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
    const s = this as unknown as Record<string, unknown>;
    (s['_applySeparatorVar'] as (() => void) | undefined)?.();
    (s['_applyAttrs'] as (() => void) | undefined)?.();
  },
  render() {
    return html`
      <nav aria-label="${t('breadcrumbs.nav')}" part="nav">
        <ol class="breadcrumbs" part="list">
          <slot></slot>
        </ol>
      </nav>
    `;
  },
};

component<BqBreadcrumbsProps>('bq-breadcrumbs', definition);
