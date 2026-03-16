/**
 * Avatar component - user/entity image or initials.
 * @element bq-avatar
 * @prop {string} src    - Image URL
 * @prop {string} alt    - Alt text / initials source
 * @prop {string} size   - xs | sm | md | lg | xl
 * @prop {string} shape  - circle | square
 * @prop {string} status - online | away | busy | offline | ""
 * @slot - Custom content
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqAvatarProps = { src: string; alt: string; size: string; shape: string; status: string };

function getInitials(alt: string): string {
  const words = alt.trim().split(/\s+/);
  if (!words.length || !words[0]) return '?';
  if (words.length === 1) return (words[0]?.[0] ?? '').toUpperCase();
  return ((words[0]?.[0] ?? '') + (words[words.length - 1]?.[0] ?? '')).toUpperCase();
}

const definition: ComponentDefinition<BqAvatarProps> = {
  props: {
    src:    { type: String, default: '' },
    alt:    { type: String, default: '' },
    size:   { type: String, default: 'md' },
    shape:  { type: String, default: 'circle' },
    status: { type: String, default: '' },
  },
  styles: `
    ${getBaseStyles()}
    :host { display: inline-block; position: relative; }
    .avatar {
      overflow: hidden; display: flex; align-items: center; justify-content: center;
      background: var(--bq-color-primary-100,#dbeafe); color: var(--bq-color-primary-700,#1d4ed8);
      font-weight: var(--bq-font-weight-semibold,600); font-family: var(--bq-font-family-sans);
      user-select: none; flex-shrink: 0;
    }
    .avatar[data-shape="circle"] { border-radius: var(--bq-radius-full,9999px); }
    .avatar[data-shape="square"] { border-radius: var(--bq-radius-lg,0.5rem); }
    .avatar[data-size="xs"]  { width: 1.5rem; height: 1.5rem; font-size: 0.5625rem; }
    .avatar[data-size="sm"]  { width: 2rem;   height: 2rem;   font-size: 0.75rem; }
    .avatar[data-size="md"]  { width: 2.5rem; height: 2.5rem; font-size: 0.9375rem; }
    .avatar[data-size="lg"]  { width: 3rem;   height: 3rem;   font-size: 1.125rem; }
    .avatar[data-size="xl"]  { width: 4rem;   height: 4rem;   font-size: 1.5rem; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .status {
      position: absolute; bottom: 0; right: 0; border-radius: var(--bq-radius-full,9999px);
      border: 2px solid var(--bq-bg-base,#fff);
    }
    :host([size="xs"])  .status { width: 0.4rem;  height: 0.4rem; }
    :host([size="sm"])  .status { width: 0.5rem;  height: 0.5rem; }
    :host([size="md"])  .status { width: 0.7rem;  height: 0.7rem; }
    :host([size="lg"])  .status { width: 0.85rem; height: 0.85rem; }
    :host([size="xl"])  .status { width: 1.1rem;  height: 1.1rem; }
    .status[data-status="online"]  { background: #22c55e; }
    .status[data-status="away"]    { background: #f59e0b; }
    .status[data-status="busy"]    { background: #ef4444; }
    .status[data-status="offline"] { background: #94a3b8; }
  `,
  render({ props }) {
    const content = props.src
      ? `<img src="${escapeHtml(props.src)}" alt="${escapeHtml(props.alt)}" />`
      : `<slot>${escapeHtml(getInitials(props.alt))}</slot>`;
    const statusEl = props.status
      ? `<span part="status" class="status" data-status="${escapeHtml(props.status)}" title="${escapeHtml(props.status)}" aria-label="${escapeHtml(props.status)}"></span>`
      : '';
    return html`
      <div part="avatar" class="avatar" data-size="${escapeHtml(props.size)}" data-shape="${escapeHtml(props.shape)}" role="img" aria-label="${escapeHtml(props.alt)}">${content}</div>
      ${statusEl}
    `;
  },
};

component<BqAvatarProps>('bq-avatar', definition);
