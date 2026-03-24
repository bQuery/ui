/**
 * Divider component - horizontal or vertical separator.
 * @element bq-divider
 * @prop {string} orientation - horizontal | vertical
 * @prop {string} variant     - solid | dashed | dotted
 * @prop {string} label       - Optional center label
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqDividerProps = { orientation: string; variant: string; label: string };

const definition: ComponentDefinition<BqDividerProps> = {
  props: {
    orientation: { type: String, default: 'horizontal' },
    variant: { type: String, default: 'solid' },
    label: { type: String, default: '' },
  },
  styles: `
    ${getBaseStyles()}
    :host { display: block; }
    .divider {
      display: flex; align-items: center; gap: 0.75rem;
      color: var(--bq-text-subtle,#94a3b8);
      font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-sm,0.875rem);
    }
    .line {
      flex: 1; border: none; border-top: 1px solid var(--bq-border-base,#e2e8f0); margin: 0;
    }
    .divider[data-variant="dashed"] .line { border-top-style: dashed; }
    .divider[data-variant="dotted"] .line { border-top-style: dotted; }
    :host([orientation="vertical"]) .divider { flex-direction: column; height: 100%; width: fit-content; }
    :host([orientation="vertical"]) .line { flex: 1; border-top: none; border-left: 1px solid var(--bq-border-base,#e2e8f0); width: 0; }
    :host([orientation="vertical"]) [part="label"] {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      line-height: 1;
      white-space: nowrap;
    }
  `,
  render({ props }) {
    const label = props.label
      ? `<span part="label">${escapeHtml(props.label)}</span>`
      : '';
    return html`<div
      part="divider"
      class="divider"
      data-variant="${escapeHtml(props.variant)}"
      role="separator"
      aria-orientation="${escapeHtml(props.orientation)}"
    >
      <hr class="line" part="line" />
      ${label} ${props.label ? '<hr class="line" part="line" />' : ''}
    </div>`;
  },
};

component<BqDividerProps>('bq-divider', definition);
