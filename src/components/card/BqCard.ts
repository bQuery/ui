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
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqCardProps = { title: string; elevated: boolean; padding: string };

const definition: ComponentDefinition<BqCardProps> = {
  props: {
    title: { type: String, default: '' },
    elevated: { type: Boolean, default: true },
    padding: { type: String, default: 'md' },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .card {
      background: var(--bq-bg-base,#fff);
      border-radius: var(--bq-radius-xl,0.75rem);
      border: 1px solid var(--bq-border-base,#e2e8f0);
      overflow: hidden; font-family: var(--bq-font-family-sans);
    }
    :host([elevated]) .card { box-shadow: var(--bq-shadow-md); }
    .card-header {
      padding: var(--bq-space-5,1.25rem) var(--bq-space-6,1.5rem);
      border-bottom: 1px solid var(--bq-border-base,#e2e8f0);
    }
    .card-header:empty { display: none; }
    .card-title { font-size: var(--bq-font-size-lg,1.125rem); font-weight: var(--bq-font-weight-semibold,600); color: var(--bq-text-base,#0f172a); margin: 0; }
    .card-body[data-padding="none"] { padding: 0; }
    .card-body[data-padding="sm"]   { padding: var(--bq-space-3,0.75rem); }
    .card-body[data-padding="md"]   { padding: var(--bq-space-6,1.5rem); }
    .card-body[data-padding="lg"]   { padding: var(--bq-space-8,2rem); }
    .card-footer {
      padding: var(--bq-space-4,1rem) var(--bq-space-6,1.5rem);
      border-top: 1px solid var(--bq-border-base,#e2e8f0);
      background: var(--bq-bg-subtle,#f8fafc);
    }
    .card-footer:empty { display: none; }
  `,
  render({ props }) {
    const headerContent = props.title
      ? `<div class="card-header" part="header"><h3 class="card-title">${escapeHtml(props.title)}</h3><slot name="header"></slot></div>`
      : '<slot name="header"></slot>';
    return html`
      <article part="card" class="card">
        ${headerContent}
        <div
          part="body"
          class="card-body"
          data-padding="${escapeHtml(props.padding)}"
        >
          <slot></slot>
        </div>
        <div part="footer" class="card-footer"><slot name="footer"></slot></div>
      </article>
    `;
  },
};

component<BqCardProps>('bq-card', definition);
