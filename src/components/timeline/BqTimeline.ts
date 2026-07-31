/**
 * Timeline component — ordered list of events along a connecting line.
 * @element bq-timeline
 * @prop {string}  variant - default | compact
 * @prop {string}  align   - start | alternate
 * @prop {string}  label   - Accessible label for the timeline
 * @slot - `bq-timeline-item` elements
 */
/**
 * Timeline item.
 * @element bq-timeline-item
 * @prop {string}  variant  - primary | success | danger | warning | info | neutral
 * @prop {string}  headline - Item title
 * @prop {string}  datetime - Machine-readable timestamp for the `<time>` element
 * @prop {string}  timestamp - Human-readable timestamp
 * @prop {boolean} last     - Hide the trailing connector
 * @slot          - Item body
 * @slot marker   - Custom marker content
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqTimelineProps = { variant: string; align: string; label: string };
type BqTimelineItemProps = {
  variant: string;
  headline: string;
  datetime: string;
  timestamp: string;
  last: boolean;
};

const timelineDefinition: ComponentDefinition<BqTimelineProps> = {
  props: {
    variant: { type: String, default: 'default' },
    align: { type: String, default: 'start' },
    label: { type: String, default: '' },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: block; }
    .timeline { list-style: none; margin: 0; padding: 0; font-family: var(--bq-font-family-sans); }
    :host([variant="compact"]) { --bq-timeline-gap: 0.75rem; }
    :host { --bq-timeline-gap: 1.5rem; }
  `,
  render({ props }) {
    const label = props.label.trim() || t('timeline.nav');
    return html`
      <ol
        part="timeline"
        class="timeline"
        aria-label="${escapeHtml(label)}"
        data-align="${escapeHtml(props.align)}"
      >
        <slot></slot>
      </ol>
    `;
  },
};

const itemDefinition: ComponentDefinition<BqTimelineItemProps> = {
  // `datetime` is outside the framework's base allowlist; the value is
  // escaped and only ever comes from this component's own prop.
  sanitize: { allowAttributes: ['datetime'] },
  props: {
    variant: { type: String, default: 'primary' },
    headline: { type: String, default: '' },
    datetime: { type: String, default: '' },
    timestamp: { type: String, default: '' },
    last: { type: Boolean, default: false },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: block; }
    .item {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: 0.875rem;
      font-family: var(--bq-font-family-sans);
    }
    .rail { display: flex; flex-direction: column; align-items: center; }
    .marker {
      display: inline-flex; align-items: center; justify-content: center;
      width: 0.875rem; height: 0.875rem; margin-top: 0.25rem; flex: 0 0 auto;
      border-radius: var(--bq-radius-full,9999px);
      background: var(--bq-color-primary-600,#2563eb);
      box-shadow: 0 0 0 3px var(--bq-color-primary-100,#dbeafe);
      color: var(--bq-text-on-primary,#fff); font-size: 0.5rem; line-height: 1;
    }
    .item[data-variant="success"] .marker { background: var(--bq-color-success-600,#16a34a); box-shadow: 0 0 0 3px var(--bq-color-success-100,#dcfce7); }
    .item[data-variant="danger"]  .marker { background: var(--bq-color-danger-600,#dc2626);  box-shadow: 0 0 0 3px var(--bq-color-danger-100,#fee2e2); }
    .item[data-variant="warning"] .marker { background: var(--bq-color-warning-600,#d97706); box-shadow: 0 0 0 3px var(--bq-color-warning-100,#fef3c7); }
    .item[data-variant="info"]    .marker { background: var(--bq-color-info-600,#2563eb);    box-shadow: 0 0 0 3px var(--bq-color-info-100,#dbeafe); }
    .item[data-variant="neutral"] .marker { background: var(--bq-text-subtle,#94a3b8);       box-shadow: 0 0 0 3px var(--bq-bg-emphasis,#e2e8f0); }

    .connector { flex: 1 1 auto; width: 2px; background: var(--bq-border-base,#e2e8f0); margin-top: 0.25rem; min-height: 0.5rem; }
    :host([last]) .connector { display: none; }

    .content { padding-bottom: var(--bq-timeline-gap, 1.5rem); min-width: 0; }
    :host([last]) .content { padding-bottom: 0; }
    .headline {
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-semibold,600);
      color: var(--bq-text-base,#0f172a);
      margin: 0;
    }
    .timestamp {
      display: block;
      font-size: var(--bq-font-size-xs,0.75rem);
      color: var(--bq-text-subtle,#94a3b8);
      margin-top: 0.125rem;
    }
    .body { font-size: var(--bq-font-size-sm,0.875rem); color: var(--bq-text-muted,#475569); margin-top: 0.375rem; }
  `,
  render({ props }) {
    const headline = props.headline.trim();
    const timestamp = props.timestamp.trim();
    const datetime = props.datetime.trim();
    return html`
      <li part="item" class="item" data-variant="${escapeHtml(props.variant)}">
        <div class="rail">
          <span class="marker" part="marker"><slot name="marker"></slot></span>
          <span class="connector" part="connector"></span>
        </div>
        <div class="content" part="content">
          ${headline ? `<p class="headline" part="headline">${escapeHtml(headline)}</p>` : ''}
          ${
            timestamp
              ? `<time class="timestamp" part="timestamp"${datetime ? ` datetime="${escapeHtml(datetime)}"` : ''}>${escapeHtml(timestamp)}</time>`
              : ''
          }
          <div class="body" part="body"><slot></slot></div>
        </div>
      </li>
    `;
  },
};

component<BqTimelineProps>('bq-timeline', timelineDefinition);
component<BqTimelineItemProps>('bq-timeline-item', itemDefinition);
