/**
 * Empty state component - placeholder for empty content areas.
 * @element bq-empty-state
 * @prop {string} title       - Main heading
 * @prop {string} description - Descriptive text
 * @prop {string} icon        - Icon character/emoji, for the simplest case
 * @slot icon - Illustration or `bq-icon` shown above the title
 * @slot - Additional content (e.g. action button)
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqEmptyStateProps = { title: string; description: string; icon: string };

const definition: ComponentDefinition<BqEmptyStateProps> = {
  props: {
    title:       { type: String, default: '' },
    description: { type: String, default: '' },
    icon:        { type: String, default: '' },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: block; }
    .empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: var(--bq-space-12,3rem) var(--bq-space-6,1.5rem);
      font-family: var(--bq-font-family-sans);
    }
    .icon {
      display: flex; align-items: center; justify-content: center;
      font-size: 3rem; line-height: 1;
      margin-block-end: var(--bq-space-4,1rem);
      color: var(--bq-text-subtle,#94a3b8);
      --bq-icon-size: 3rem;
    }
    /* An empty slot must not reserve the icon's margin. */
    .icon:empty { display: none; }
    .title { font-size: var(--bq-font-size-xl,1.25rem); font-weight: var(--bq-font-weight-semibold,600); letter-spacing: var(--bq-letter-spacing-tight,-0.015em); color: var(--bq-text-base,#0f172a); margin: 0 0 0.5rem; }
    .description { font-size: var(--bq-font-size-md,1rem); line-height: var(--bq-line-height-relaxed,1.625); color: var(--bq-text-muted,#475569); margin: 0 0 var(--bq-space-6,1.5rem); max-inline-size: 28rem; }
    .actions { display: flex; gap: var(--bq-space-3,0.75rem); flex-wrap: wrap; justify-content: center; }
  `,
  render({ props }) {
    const title = props.title.trim() || t('emptyState.title');
    const description = props.description.trim() || t('emptyState.description');
    return html`
      <div part="empty-state" class="empty" role="status" aria-live="polite">
        <span class="icon" part="icon" aria-hidden="true"
          ><slot name="icon">${props.icon ? escapeHtml(props.icon) : ''}</slot
        ></span>
        ${title ? `<h3 class="title" part="title">${escapeHtml(title)}</h3>` : ''}
        ${description ? `<p class="description" part="description">${escapeHtml(description)}</p>` : ''}
        <div class="actions" part="actions"><slot></slot></div>
      </div>
    `;
  },
};

component<BqEmptyStateProps>('bq-empty-state', definition);
