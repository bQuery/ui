/**
 * Empty state component - placeholder for empty content areas.
 * @element bq-empty-state
 * @prop {string} title       - Main heading
 * @prop {string} description - Descriptive text
 * @prop {string} icon        - Icon character/emoji
 * @slot - Additional content (e.g. action button)
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqEmptyStateProps = { title: string; description: string; icon: string };

const definition: ComponentDefinition<BqEmptyStateProps> = {
  props: {
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
    icon:        { type: String, default: '' },
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: var(--bq-space-12,3rem) var(--bq-space-6,1.5rem);
      font-family: var(--bq-font-family-sans);
    }
    .icon { font-size: 3rem; line-height: 1; margin-bottom: var(--bq-space-4,1rem); color: var(--bq-text-subtle,#94a3b8); }
    .title { font-size: var(--bq-font-size-xl,1.25rem); font-weight: var(--bq-font-weight-semibold,600); color: var(--bq-text-base,#0f172a); margin: 0 0 0.5rem; }
    .description { font-size: var(--bq-font-size-md,1rem); color: var(--bq-text-muted,#475569); margin: 0 0 var(--bq-space-6,1.5rem); max-width: 28rem; }
    .actions { display: flex; gap: var(--bq-space-3,0.75rem); flex-wrap: wrap; justify-content: center; }
  `,
  render({ props }) {
    const title = props.title.trim() || t('emptyState.title');
    const description = props.description.trim() || t('emptyState.description');
    return html`
      <div part="empty-state" class="empty" role="status" aria-live="polite">
        ${props.icon ? `<span class="icon" part="icon" aria-hidden="true">${escapeHtml(props.icon)}</span>` : ''}
        <h3 class="title" part="title">${escapeHtml(title)}</h3>
        <p class="description" part="description">${escapeHtml(description)}</p>
        <div class="actions" part="actions"><slot></slot></div>
      </div>
    `;
  },
};

component<BqEmptyStateProps>('bq-empty-state', definition);
