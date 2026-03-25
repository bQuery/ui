/**
 * Skeleton loading placeholder.
 * @element bq-skeleton
 * @prop {string}  variant  - text | circle | rect | card
 * @prop {string}  width    - CSS width value
 * @prop {string}  height   - CSS height value
 * @prop {number}  lines    - Number of text lines
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqSkeletonProps = {
  variant: string;
  width: string;
  height: string;
  lines: number;
};

const DISALLOWED_DIMENSION_PATTERN =
  /[;{}]|(?:url\s*\(|expression\s*\(|javascript:|data:|@import)|[\r\n]/i;

const sanitizeDimension = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed) return '';
  if (DISALLOWED_DIMENSION_PATTERN.test(trimmed)) return '';

  return trimmed;
};

const getStyleAttribute = (
  width: string,
  height: string,
  widthOverride?: string
): string => {
  const styles: string[] = [];
  const safeWidth = sanitizeDimension(widthOverride ?? width);
  const safeHeight = sanitizeDimension(height);

  if (safeWidth) styles.push(`width:${safeWidth}`);
  if (safeHeight) styles.push(`height:${safeHeight}`);

  return styles.join(';');
};

const definition: ComponentDefinition<BqSkeletonProps> = {
  props: {
    variant: { type: String, default: 'text' },
    width: { type: String, default: '100%' },
    height: { type: String, default: '' },
    lines: { type: Number, default: 1 },
  },
  sanitize: {
    allowAttributes: ['style'],
  },
  styles: `
    ${getBaseStyles()}
    :host { display: block; }
    .skeleton {
      background: var(--bq-bg-emphasis,#e2e8f0);
      border-radius: var(--bq-radius-md,0.375rem);
      overflow: hidden; position: relative;
    }
    .skeleton::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
    @media (prefers-reduced-motion: reduce) {
      .skeleton::after { animation: none; }
    }
    .skeleton[data-variant="circle"] { border-radius: var(--bq-radius-full,9999px); }
    .skeleton[data-variant="text"]   { height: 1em; margin-bottom: 0.5em; }
    .skeleton[data-variant="text"]:last-child { width: 70%; }
    .lines { display: flex; flex-direction: column; gap: 0.5rem; }
  `,
  render({ props }) {
    if (props.variant === 'text' && props.lines > 1) {
      const lineStyle = getStyleAttribute(props.width, props.height);
      const items = Array.from(
        { length: props.lines },
        (_, i) =>
          `<div class="skeleton" data-variant="text" part="skeleton" style="${escapeHtml(i === props.lines - 1 ? getStyleAttribute(props.width, props.height, '70%') : lineStyle)}"></div>`
      ).join('');
      return html`<div class="lines" part="lines">${items}</div>`;
    }
    return html`<div
      part="skeleton"
      class="skeleton"
      data-variant="${escapeHtml(props.variant)}"
      style="${escapeHtml(getStyleAttribute(props.width, props.height))}"
    ></div>`;
  },
};

component<BqSkeletonProps>('bq-skeleton', definition);
