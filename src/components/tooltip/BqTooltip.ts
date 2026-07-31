/**
 * Tooltip component - contextual popup on hover/focus.
 * @element bq-tooltip
 * @prop {string} content   - Tooltip text
 * @prop {string} placement - top | bottom | left | right
 * @prop {number} delay     - Show delay in ms
 * @slot - The trigger element
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import type { Disposer } from '../../utils/component.js';
import { bind, host, release, store } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { baseStyles } from '../../utils/styles.js';

type BqTooltipProps = { content: string; placement: string; delay: number };
type BqTooltipState = { visible: boolean; uid: string };

/** Per-instance handles shared between `connected()` and `updated()`. */
const tooltipStore = (owner: object) =>
  store<{ syncTrigger?: () => void; triggerElements: HTMLElement[] }>(
    owner,
    () => ({ triggerElements: [] })
  );

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
  styles: css`
    ${baseStyles}
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
    const self = host<BqTooltipState>(this);
    const scope = bind(self);
    const local = tooltipStore(self);
    if (!self.getState<string>('uid')) {
      self.setState('uid', uniqueId('bq-tooltip'));
    }
    let cancelShow: Disposer | null = null;
    const clearShowTimer = () => {
      cancelShow?.();
      cancelShow = null;
    };
    const show = () => {
      clearShowTimer();
      const d = parseInt(self.getAttribute('delay') ?? '200', 10);
      cancelShow = scope.timeout(() => {
        cancelShow = null;
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
      const tooltipId = self.getState<string>('uid');
      local.triggerElements.forEach((element) =>
        removeDescribedBy(element, tooltipId)
      );

      const slot = self.shadowRoot?.querySelector(
        'slot'
      ) as HTMLSlotElement | null;
      if (!slot) {
        local.triggerElements = [];
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
      local.triggerElements = next;
    };
    // `updated()` re-syncs the trigger wiring after every render.
    local.syncTrigger = syncTrigger;

    // The tooltip writes aria-describedby onto slotted light-DOM elements that
    // outlive it, so those references must be withdrawn on teardown.
    scope.add(() => {
      const tooltipId = self.getState<string>('uid') ?? self.id;
      local.triggerElements.forEach((element) =>
        removeDescribedBy(element, tooltipId)
      );
      local.triggerElements = [];
    });

    scope.on(self, 'mouseenter', show);
    scope.on(self, 'mouseleave', hide);
    scope.on(self, 'focusin', show);
    scope.on(self, 'focusout', hide);
    scope.on(document, 'keydown', kh);

    queueMicrotask(() => {
      if (!self.isConnected) return;
      const slot = self.shadowRoot?.querySelector(
        'slot'
      ) as HTMLSlotElement | null;
      if (!slot) return;
      scope.on(slot, 'slotchange', syncTrigger);
      syncTrigger();
    });
  },
  disconnected() {
    release(this);
  },
  updated() {
    tooltipStore(this).syncTrigger?.();
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
