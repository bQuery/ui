/**
 * Tooltip component - contextual popup on hover/focus.
 * @element bq-tooltip
 * @prop {string} content   - Tooltip text
 * @prop {string} placement - top | bottom | left | right
 * @prop {number} delay     - Show delay in ms
 * @slot - The trigger element
 */
import { component, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { getBaseStyles } from '../../utils/styles.js';

type BqTooltipProps = { content: string; placement: string; delay: number };

const definition: ComponentDefinition<BqTooltipProps> = {
  props: {
    content:   { type: String, default: '' },
    placement: { type: String, default: 'top' },
    delay:     { type: Number, default: 200 },
  },
  state: { visible: false },
  styles: `
    ${getBaseStyles()}
    :host { display: inline-block; position: relative; }
    .tip {
      position: absolute; z-index: var(--bq-z-tooltip,700);
      background: var(--bq-color-secondary-900,#0f172a); color: #fff;
      font-family: var(--bq-font-family-sans); font-size: var(--bq-font-size-sm,0.875rem);
      padding: 0.375rem 0.625rem; border-radius: var(--bq-radius-md,0.375rem);
      white-space: nowrap; pointer-events: none;
      opacity: 0; transition: opacity var(--bq-duration-fast);
    }
    .tip[data-visible="true"] { opacity: 1; }
    .tip[data-placement="top"]    { bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
    .tip[data-placement="bottom"] { top:  calc(100% + 6px); left: 50%; transform: translateX(-50%); }
    .tip[data-placement="left"]   { right: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
    .tip[data-placement="right"]  { left:  calc(100% + 6px); top: 50%; transform: translateY(-50%); }
  `,
  connected() {
    type BQEl = HTMLElement & { setState(k: string, v: unknown): void; getState<T>(k: string): T };
    const self = this as unknown as BQEl;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const show = () => {
      const d = parseInt(self.getAttribute('delay') ?? '200', 10);
      timer = setTimeout(() => self.setState('visible', true), d);
    };
    const hide = () => { if (timer) clearTimeout(timer); self.setState('visible', false); };
    const kh = (e: Event) => { if ((e as KeyboardEvent).key === 'Escape') hide(); };
    (self as unknown as Record<string, unknown>)['_show'] = show;
    (self as unknown as Record<string, unknown>)['_hide'] = hide;
    (self as unknown as Record<string, unknown>)['_kh'] = kh;
    self.addEventListener('mouseenter', show);
    self.addEventListener('mouseleave', hide);
    self.addEventListener('focusin', show);
    self.addEventListener('focusout', hide);
    document.addEventListener('keydown', kh);
  },
  disconnected() {
    const self = this as unknown as Record<string, unknown>;
    const show = self['_show'] as EventListener; const hide = self['_hide'] as EventListener;
    const kh = self['_kh'] as EventListener;
    this.removeEventListener('mouseenter', show);
    this.removeEventListener('mouseleave', hide);
    this.removeEventListener('focusin', show);
    this.removeEventListener('focusout', hide);
    document.removeEventListener('keydown', kh);
  },
  render({ props, state }) {
    const visible = Boolean(state['visible']);
    return html`
      <slot></slot>
      <div part="tooltip" class="tip" role="tooltip" data-placement="${escapeHtml(props.placement)}" data-visible="${visible ? 'true' : 'false'}">
        ${escapeHtml(props.content)}
      </div>
    `;
  },
};

component<BqTooltipProps>('bq-tooltip', definition);
