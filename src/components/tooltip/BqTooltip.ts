/**
 * Tooltip component - contextual popup on hover/focus.
 * @element bq-tooltip
 * @prop {string} content   - Tooltip text
 * @prop {string} placement - top | bottom | left | right
 * @prop {number} delay     - Show delay in ms
 * @slot - The trigger element
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { uniqueId } from '../../utils/dom.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqTooltipProps = { content: string; placement: string; delay: number };
type BqTooltipState = { visible: boolean; uid: string };

function addDescribedBy(element: HTMLElement, tooltipId: string): void {
  const current = element.getAttribute('aria-describedby');
  const tokens = new Set((current ?? '').split(/\s+/).filter(Boolean));
  tokens.add(tooltipId);
  element.setAttribute('aria-describedby', Array.from(tokens).join(' '));
}

function removeDescribedBy(element: HTMLElement, tooltipId: string): void {
  const current = element.getAttribute('aria-describedby');
  if (!current) return;
  const tokens = current
    .split(/\s+/)
    .filter((token) => token && token !== tooltipId);
  if (tokens.length > 0) {
    element.setAttribute('aria-describedby', tokens.join(' '));
    return;
  }
  element.removeAttribute('aria-describedby');
}

const definition: ComponentDefinition<BqTooltipProps, BqTooltipState> = {
  props: {
    content: { type: String, default: '' },
    placement: { type: String, default: 'top' },
    delay: { type: Number, default: 200 },
  },
  state: { visible: false, uid: '' },
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
    @media (prefers-reduced-motion: reduce) {
      .tip { transition: none; }
    }
  `,
  connected() {
    type BQEl = HTMLElement & {
      setState(k: 'visible' | 'uid', v: unknown): void;
      getState<T>(k: string): T;
    };
    const self = this as unknown as BQEl;
    const internalState = self as unknown as Record<string, unknown>;
    if (!self.getState<string>('uid')) {
      self.setState('uid', uniqueId('bq-tooltip'));
    }
    const clearShowTimer = () => {
      const timer = internalState['_showTimer'] as
        | ReturnType<typeof setTimeout>
        | null
        | undefined;
      if (timer) {
        clearTimeout(timer);
      }
      internalState['_showTimer'] = null;
    };
    const show = () => {
      clearShowTimer();
      const d = parseInt(self.getAttribute('delay') ?? '200', 10);
      internalState['_showTimer'] = setTimeout(() => {
        internalState['_showTimer'] = null;
        self.setState('visible', true);
      }, d);
    };
    const hide = () => {
      clearShowTimer();
      self.setState('visible', false);
    };
    const kh = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') hide();
    };
    const syncTrigger = () => {
      const state = self as unknown as Record<string, unknown>;
      const tooltipId = self.getState<string>('uid');
      const previous =
        (state['_triggerElements'] as HTMLElement[] | undefined) ?? [];
      previous.forEach((element) => removeDescribedBy(element, tooltipId));

      const slot = self.shadowRoot?.querySelector(
        'slot'
      ) as HTMLSlotElement | null;
      if (!slot) {
        state['_triggerElements'] = [];
        return;
      }

      const content = self.getAttribute('content')?.trim() ?? '';
      const next = slot
        .assignedElements({ flatten: true })
        .filter(
          (element): element is HTMLElement => element instanceof HTMLElement
        );

      if (content) {
        next.forEach((element) => addDescribedBy(element, tooltipId));
      }
      state['_triggerElements'] = next;
    };
    internalState['_show'] = show;
    internalState['_hide'] = hide;
    internalState['_kh'] = kh;
    internalState['_syncTrigger'] = syncTrigger;
    internalState['_clearShowTimer'] = clearShowTimer;
    self.addEventListener('mouseenter', show);
    self.addEventListener('mouseleave', hide);
    self.addEventListener('focusin', show);
    self.addEventListener('focusout', hide);
    document.addEventListener('keydown', kh);
    queueMicrotask(() => {
      if (!self.isConnected) return;
      const slot = self.shadowRoot?.querySelector(
        'slot'
      ) as HTMLSlotElement | null;
      if (!slot) return;
      slot.addEventListener('slotchange', syncTrigger);
      internalState['_slot'] = slot;
      syncTrigger();
    });
  },
  disconnected() {
    const self = this as unknown as Record<string, unknown>;
    const show = self['_show'] as EventListener;
    const hide = self['_hide'] as EventListener;
    const kh = self['_kh'] as EventListener;
    const slot = self['_slot'] as HTMLSlotElement | undefined;
    const syncTrigger = self['_syncTrigger'] as EventListener | undefined;
    const clearShowTimer = self['_clearShowTimer'] as (() => void) | undefined;
    const triggerElements =
      (self['_triggerElements'] as HTMLElement[] | undefined) ?? [];
    const tooltipId =
      (this as unknown as { getState?<T>(key: string): T }).getState?.<string>(
        'uid'
      ) ?? this.id;
    clearShowTimer?.();
    this.removeEventListener('mouseenter', show);
    this.removeEventListener('mouseleave', hide);
    this.removeEventListener('focusin', show);
    this.removeEventListener('focusout', hide);
    document.removeEventListener('keydown', kh);
    if (slot && syncTrigger)
      slot.removeEventListener('slotchange', syncTrigger);
    triggerElements.forEach((element) => removeDescribedBy(element, tooltipId));
  },
  updated() {
    const syncTrigger = (this as unknown as Record<string, unknown>)[
      '_syncTrigger'
    ] as (() => void) | undefined;
    syncTrigger?.();
  },
  render({ props, state }) {
    const visible = Boolean(state['visible']);
    const uid = state['uid'] || 'bq-tooltip';
    return html`
      <slot></slot>
      <div
        id="${escapeHtml(uid)}"
        part="tooltip"
        class="tip"
        role="tooltip"
        aria-hidden="${visible ? 'false' : 'true'}"
        data-placement="${escapeHtml(props.placement)}"
        data-visible="${visible ? 'true' : 'false'}"
      >
        ${escapeHtml(props.content)}
      </div>
    `;
  },
};

component<BqTooltipProps, BqTooltipState>('bq-tooltip', definition);
