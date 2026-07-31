/**
 * Card component - content container with optional header and footer.
 * @element bq-card
 * @prop {string}  title    - Card header title
 * @prop {boolean} elevated - box-shadow elevation
 * @prop {string}  padding  - none | sm | md | lg
 * @slot         - Card body content
 * @slot header  - Custom header
 * @slot footer  - Card footer
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { bind, host, release } from '../../utils/component.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqCardProps = { title: string; elevated: boolean; padding: string };

/**
 * Marks the header and footer bands as empty when nothing is slotted into them.
 *
 * `:empty` cannot answer this: the band always contains a `<slot>` element, so
 * it is never empty in the CSS sense even when nothing is assigned to it. The
 * card used to rely on that and drew a bordered grey strip under every card
 * that had no footer.
 */
function syncSlotState(el: HTMLElement): void {
  const root = el.shadowRoot;
  if (!root) return;
  for (const name of ['header', 'footer']) {
    const band = root.querySelector(`.card-${name}`);
    const slot = root.querySelector(
      `slot[name="${name}"]`
    ) as HTMLSlotElement | null;
    if (!band) continue;
    const assigned = slot?.assignedNodes({ flatten: true }) ?? [];
    const filled =
      assigned.some(
        (node) =>
          node.nodeType === 1 || (node.textContent ?? '').trim().length > 0
      ) || (name === 'header' && Boolean(el.getAttribute('title')));
    band.toggleAttribute('data-empty', !filled);
  }
}

const definition: ComponentDefinition<BqCardProps> = {
  props: {
    title: { type: String, default: '' },
    elevated: { type: Boolean, default: true },
    padding: { type: String, default: 'md' },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: block; }
    .card {
      background: var(--bq-surface-raised,#fff);
      border-radius: var(--bq-radius-xl,0.75rem);
      border: 1px solid var(--bq-border-base,#e2e8f0);
      overflow: hidden; font-family: var(--bq-font-family-sans);
      color: var(--bq-text-base,#0f172a);
    }
    :host([elevated]) .card { box-shadow: var(--bq-shadow-md); }
    .card-header {
      display: flex; align-items: center; gap: var(--bq-space-3,0.75rem);
      padding: var(--bq-space-5,1.25rem) var(--bq-space-6,1.5rem);
      border-block-end: 1px solid var(--bq-border-base,#e2e8f0);
    }
    .card-title {
      font-size: var(--bq-font-size-lg,1.125rem);
      font-weight: var(--bq-font-weight-semibold,600);
      letter-spacing: var(--bq-letter-spacing-tight,-0.015em);
      color: var(--bq-text-base,#0f172a);
      margin: 0;
    }
    .card-body[data-padding="none"] { padding: 0; }
    .card-body[data-padding="sm"]   { padding: var(--bq-space-3,0.75rem); }
    .card-body[data-padding="md"]   { padding: var(--bq-space-6,1.5rem); }
    .card-body[data-padding="lg"]   { padding: var(--bq-space-8,2rem); }
    .card-footer {
      display: flex; align-items: center; gap: var(--bq-space-3,0.75rem);
      padding: var(--bq-space-4,1rem) var(--bq-space-6,1.5rem);
      border-block-start: 1px solid var(--bq-border-base,#e2e8f0);
      background: var(--bq-bg-subtle,#f8fafc);
    }
    .card-header[data-empty],
    .card-footer[data-empty] { display: none; }
  `,
  connected() {
    const self = host(this);
    const scope = bind(self);
    // The slots only exist after the first render.
    queueMicrotask(() => {
      if (!self.isConnected) return;
      for (const slot of Array.from(
        self.shadowRoot?.querySelectorAll('slot') ?? []
      )) {
        scope.on(slot, 'slotchange', () => syncSlotState(self));
      }
      syncSlotState(self);
    });
  },
  disconnected() {
    release(this);
  },
  updated() {
    // Every render replaces the slots, so the bands are unmarked again.
    syncSlotState(this);
  },
  render({ props }) {
    return html`
      <article part="card" class="card">
        <div class="card-header" part="header" data-empty>
          ${
            props.title
              ? `<h3 class="card-title" part="title">${escapeHtml(props.title)}</h3>`
              : ''
          }
          <slot name="header"></slot>
        </div>
        <div
          part="body"
          class="card-body"
          data-padding="${escapeHtml(props.padding)}"
        >
          <slot></slot>
        </div>
        <div part="footer" class="card-footer" data-empty>
          <slot name="footer"></slot>
        </div>
      </article>
    `;
  },
};

component<BqCardProps>('bq-card', definition);
