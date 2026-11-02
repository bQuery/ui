/**
 * Split panel — two panes separated by a draggable, keyboard-operable divider.
 *
 * Implements the WAI-ARIA *window splitter* pattern: the divider is a
 * focusable `role="separator"` whose `aria-valuenow` is the size of the start
 * pane in percent. Arrow keys resize, Home/End jump to the limits, and Enter
 * collapses the start pane to `min` and restores it again.
 *
 * Drag tracking listens on `document` rather than relying on pointer capture
 * of the divider, so a re-render mid-drag (which replaces the shadow tree on
 * bQuery 1.15–1.17) cannot strand the gesture.
 *
 * @element bq-split-panel
 * @prop {number}  position    - Size of the start pane in percent @default 50
 * @prop {number}  min         - Smallest allowed position in percent @default 0
 * @prop {number}  max         - Largest allowed position in percent @default 100
 * @prop {number}  step        - Keyboard step in percent @default 5
 * @prop {string}  snap        - Space-separated snap points in percent, e.g. "25 50 75"
 * @prop {string}  orientation - horizontal (side by side) | vertical (stacked)
 * @prop {boolean} disabled    - Lock the divider
 * @prop {string}  label       - Accessible name for the divider
 * @slot start - First pane
 * @slot end   - Second pane
 * @slot divider - Custom handle content inside the divider
 * @fires bq-resize - { position: number } on every change
 * @csspart base | start | end | divider | handle
 * @cssprop --bq-split-divider-size - Thickness of the divider @default 0.5rem
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import type { Disposer } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { iconCss } from '../../utils/icons.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqSplitPanelProps = {
  position: number;
  min: number;
  max: number;
  step: number;
  snap: string;
  orientation: string;
  disabled: boolean;
  label: string;
};

type BqSplitPanelState = { uid: string };

/** Snap distance in percent: a drag that ends this close to a point lands on it. */
const SNAP_THRESHOLD = 2;

/** Clamps a position into `[min, max]`, tolerating inverted or invalid bounds. */
export function clampPosition(value: number, min: number, max: number): number {
  const lo = Number.isFinite(min) ? Math.max(0, Math.min(100, min)) : 0;
  const hi = Number.isFinite(max) ? Math.max(lo, Math.min(100, max)) : 100;
  if (!Number.isFinite(value)) return lo;
  return Math.min(hi, Math.max(lo, value));
}

/** Parses the `snap` attribute into a sorted list of points. */
export function parseSnapPoints(raw: string): number[] {
  return raw
    .split(/[\s,]+/)
    .map((part) => Number.parseFloat(part))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
}

/** Returns the snap point within the threshold of `value`, or `value` itself. */
export function applySnap(
  value: number,
  points: number[],
  threshold = SNAP_THRESHOLD
): number {
  let best = value;
  let bestDistance = threshold;
  for (const point of points) {
    const distance = Math.abs(point - value);
    if (distance <= bestDistance) {
      best = point;
      bestDistance = distance;
    }
  }
  return best;
}

/** Rounds to two decimals so attribute values stay readable. */
const round = (n: number) => Math.round(n * 100) / 100;

const splitStore = (owner: object) =>
  store<{ restore: number | null; stopDrag: Disposer | null }>(owner, () => ({
    restore: null,
    stopDrag: null,
  }));

const definition: ComponentDefinition<BqSplitPanelProps, BqSplitPanelState> = {
  props: {
    position: { type: Number, default: 50 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 5 },
    snap: { type: String, default: '' },
    orientation: { type: String, default: 'horizontal' },
    disabled: { type: Boolean, default: false },
    label: { type: String, default: '' },
  },
  state: { uid: '' },
  sanitize: { allowAttributes: ['style'] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${iconCss('grip-vertical', 'grip-horizontal')}
    :host {
      display: block;
      --bq-split-divider-size: 0.5rem;
      block-size: 100%;
    }
    .split {
      display: grid;
      block-size: 100%;
      inline-size: 100%;
      min-block-size: 0;
    }
    .split[data-orientation="horizontal"] {
      grid-template-columns:
        minmax(0, calc(var(--bq-split-pos) - var(--bq-split-divider-size) / 2))
        var(--bq-split-divider-size)
        minmax(0, 1fr);
    }
    .split[data-orientation="vertical"] {
      grid-template-rows:
        minmax(0, calc(var(--bq-split-pos) - var(--bq-split-divider-size) / 2))
        var(--bq-split-divider-size)
        minmax(0, 1fr);
    }
    .pane { overflow: auto; min-inline-size: 0; min-block-size: 0; }
    .divider {
      position: relative;
      display: flex; align-items: center; justify-content: center;
      background: var(--bq-border-base,#e2e8f0);
      color: var(--bq-text-subtle,#94a3b8);
      touch-action: none;
      user-select: none;
      outline: none;
      transition: background var(--bq-duration-fast,150ms) var(--bq-easing-standard);
      --bq-icon-size: 0.875rem;
    }
    .split[data-orientation="horizontal"] .divider { cursor: col-resize; }
    .split[data-orientation="vertical"] .divider { cursor: row-resize; }
    /* A wider invisible hit area than the visible line, so the divider is
       easy to grab without having to be visually heavy. */
    .divider::before { content: ''; position: absolute; inset: -0.25rem; }
    .divider:hover,
    :host([data-dragging]) .divider {
      background: var(--bq-color-primary-500,#3b82f6);
      color: var(--bq-text-inverse,#fff);
    }
    .divider:focus-visible {
      background: var(--bq-color-primary-500,#3b82f6);
      color: var(--bq-text-inverse,#fff);
      box-shadow: var(--bq-focus-ring);
    }
    :host([disabled]) .divider { cursor: default; background: var(--bq-border-base,#e2e8f0); color: var(--bq-text-subtle,#94a3b8); }
    :host([data-dragging]) .pane { pointer-events: none; user-select: none; }
    .handle { display: inline-flex; pointer-events: none; }
    @media (prefers-reduced-motion: reduce) {
      .divider { transition: none; }
    }
  `,
  connected() {
    const self = host<BqSplitPanelState>(this);
    const scope = bind(self);
    const local = splitStore(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-split'));

    const num = (name: string, fallback: number) => {
      const raw = self.getAttribute(name);
      const n = raw === null || raw === '' ? Number.NaN : Number(raw);
      return Number.isFinite(n) ? n : fallback;
    };
    const bounds = () => ({ min: num('min', 0), max: num('max', 100) });
    const current = () => {
      const { min, max } = bounds();
      return clampPosition(num('position', 50), min, max);
    };
    const isVertical = () => self.getAttribute('orientation') === 'vertical';
    const isRtl = () =>
      self.ownerDocument?.defaultView?.getComputedStyle?.(self)?.direction ===
      'rtl';

    const setPosition = (next: number, options: { snap?: boolean } = {}) => {
      const { min, max } = bounds();
      let value = clampPosition(next, min, max);
      if (options.snap) {
        value = clampPosition(
          applySnap(value, parseSnapPoints(self.getAttribute('snap') ?? '')),
          min,
          max
        );
      }
      value = round(value);
      if (value === round(current()) && self.hasAttribute('position')) return;
      self.setAttribute('position', String(value));
      self.dispatchEvent(
        new CustomEvent('bq-resize', {
          detail: { position: value },
          bubbles: true,
          composed: true,
        })
      );
    };

    const positionFromPointer = (event: PointerEvent): number => {
      const rect = self.getBoundingClientRect();
      if (isVertical()) {
        return rect.height > 0 ? ((event.clientY - rect.top) / rect.height) * 100 : 0;
      }
      if (rect.width <= 0) return 0;
      const offset = isRtl() ? rect.right - event.clientX : event.clientX - rect.left;
      return (offset / rect.width) * 100;
    };

    const stopDrag = () => {
      local.stopDrag?.();
      local.stopDrag = null;
    };

    scope.on(self.shadowRoot, 'pointerdown', (event) => {
      const pe = event as PointerEvent;
      if (self.hasAttribute('disabled')) return;
      if (!(pe.target as Element | null)?.closest?.('.divider')) return;
      if (pe.button !== undefined && pe.button !== 0) return;
      pe.preventDefault();
      stopDrag();
      (self.shadowRoot?.querySelector('.divider') as HTMLElement | null)?.focus();
      self.setAttribute('data-dragging', '');

      const disposers: Disposer[] = [];
      const finish = () => {
        disposers.forEach((dispose) => dispose());
        self.removeAttribute('data-dragging');
      };
      disposers.push(
        scope.on(document, 'pointermove', (move) => {
          setPosition(positionFromPointer(move as PointerEvent), { snap: true });
        }),
        scope.on(document, 'pointerup', stopDrag),
        scope.on(document, 'pointercancel', stopDrag)
      );
      local.stopDrag = scope.add(finish);
    });

    scope.on(self.shadowRoot, 'keydown', (event) => {
      const ke = event as KeyboardEvent;
      if (self.hasAttribute('disabled')) return;
      if (!(ke.target as Element | null)?.closest?.('.divider')) return;
      const step = Math.abs(num('step', 5)) || 5;
      const { min, max } = bounds();
      const value = current();
      const vertical = isVertical();
      const rtl = isRtl();

      let next: number | null = null;
      switch (ke.key) {
        case 'ArrowLeft':
          if (!vertical) next = value + (rtl ? step : -step);
          break;
        case 'ArrowRight':
          if (!vertical) next = value + (rtl ? -step : step);
          break;
        case 'ArrowUp':
          if (vertical) next = value - step;
          break;
        case 'ArrowDown':
          if (vertical) next = value + step;
          break;
        case 'Home':
          next = min;
          break;
        case 'End':
          next = max;
          break;
        case 'Enter': {
          // Collapse the start pane to its minimum, or restore the size it
          // had before the last collapse.
          if (value > min) {
            local.restore = value;
            next = min;
          } else {
            next = local.restore ?? 50;
            local.restore = null;
          }
          break;
        }
        default:
          return;
      }
      if (next === null) return;
      ke.preventDefault();
      setPosition(next);
    });

    scope.add(() => {
      local.stopDrag = null;
      self.removeAttribute('data-dragging');
    });
  },
  disconnected() {
    release(this);
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-split';
    const vertical = props.orientation === 'vertical';
    const position = round(clampPosition(Number(props.position), Number(props.min), Number(props.max)));
    const { min, max } = {
      min: clampPosition(Number(props.min), 0, 100),
      max: clampPosition(Number(props.max), clampPosition(Number(props.min), 0, 100), 100),
    };
    const label = props.label || t('splitPanel.label');
    return html`
      <div
        class="split"
        part="base"
        data-orientation="${vertical ? 'vertical' : 'horizontal'}"
        style="--bq-split-pos: ${position}%"
      >
        <div class="pane start" part="start" id="${escapeHtml(`${uid}-start`)}"><slot name="start"></slot></div>
        <div
          class="divider"
          part="divider"
          role="separator"
          tabindex="${props.disabled ? '-1' : '0'}"
          aria-orientation="${vertical ? 'horizontal' : 'vertical'}"
          aria-valuenow="${position}"
          aria-valuemin="${min}"
          aria-valuemax="${max}"
          aria-controls="${escapeHtml(`${uid}-start`)}"
          aria-label="${escapeHtml(label)}"
          ${props.disabled ? 'aria-disabled="true"' : ''}
        >
          <slot name="divider"><span class="handle" part="handle"><span class="icon" data-icon="${vertical ? 'grip-horizontal' : 'grip-vertical'}" aria-hidden="true"></span></span></slot>
        </div>
        <div class="pane end" part="end"><slot name="end"></slot></div>
      </div>
    `;
  },
};

component<BqSplitPanelProps, BqSplitPanelState>('bq-split-panel', definition);
