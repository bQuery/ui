/**
 * Carousel — shows a series of slides one (or a few) at a time.
 *
 * Follows the WAI-ARIA carousel pattern: the region is announced as a
 * "carousel", every slide becomes a labelled `role="group"` with the
 * "slide" role description, and slides outside the view are made `inert` so
 * neither the tab order nor a screen reader wanders into them.
 *
 * Automatic rotation is opt-in (`autoplay`), always paired with a visible
 * pause/play button (WCAG 2.2.2), stops while the pointer or keyboard focus is
 * inside the carousel, and is skipped entirely for users who prefer reduced
 * motion. While it runs, the live region is switched off so the screen reader
 * is not interrupted by every slide change.
 *
 * Every element child is a slide. Slide attributes the component writes
 * (`role`, `aria-*`, `inert`) are removed again when it disconnects.
 *
 * @element bq-carousel
 * @prop {number}  index            - Zero-based index of the first visible slide
 * @prop {number}  per-view         - Slides visible at once @default 1
 * @prop {boolean} loop             - Wrap around at either end
 * @prop {number}  autoplay         - Rotation interval in ms; 0 disables it
 * @prop {string}  label            - Accessible name of the carousel
 * @prop {boolean} hide-controls    - Hide the previous/next buttons
 * @prop {boolean} hide-indicators  - Hide the slide picker dots
 * @slot - Slides
 * @fires bq-change - { index: number }
 * @csspart base | viewport | track | prev | next | indicators | indicator | play-toggle
 * @cssprop --bq-carousel-gap - Space between slides @default 1rem
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import type { Disposer } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { iconCss } from '../../utils/icons.js';
import { baseStyles, focusRing, reset } from '../../utils/styles.js';

type BqCarouselProps = {
  index: number;
  'per-view': number;
  loop: boolean;
  autoplay: number;
  label: string;
  'hide-controls': boolean;
  'hide-indicators': boolean;
};

type BqCarouselState = {
  uid: string;
  count: number;
  /** The user pressed pause. Sticky until they press play. */
  stopped: boolean;
  /** Pointer or focus is inside — rotation waits. */
  hovered: boolean;
};

/** Minimum horizontal travel, in px, for a swipe to count. */
const SWIPE_THRESHOLD = 40;

/** Largest valid start index for `count` slides shown `perView` at a time. */
export function maxIndex(count: number, perView: number): number {
  const pv = Math.max(1, Math.floor(perView) || 1);
  return Math.max(0, count - pv);
}

/**
 * Resolves the index a navigation step lands on. With `loop`, stepping past
 * either end wraps; without it, the index stays at the boundary.
 */
export function stepIndex(
  current: number,
  delta: number,
  count: number,
  perView: number,
  loop: boolean
): number {
  const last = maxIndex(count, perView);
  if (count === 0) return 0;
  const next = current + delta;
  if (next > last) return loop ? 0 : last;
  if (next < 0) return loop ? last : 0;
  return next;
}

const carouselStore = (owner: object) =>
  store<{
    syncSlides?: () => void;
    schedule?: () => void;
    pending: Disposer | null;
    written: WeakSet<Element>;
  }>(owner, () => ({ pending: null, written: new WeakSet() }));

const SLIDE_ATTRIBUTES = [
  'role',
  'aria-roledescription',
  'aria-label',
  'aria-hidden',
  'inert',
] as const;

const definition: ComponentDefinition<BqCarouselProps, BqCarouselState> = {
  props: {
    index: { type: Number, default: 0 },
    'per-view': { type: Number, default: 1 },
    loop: { type: Boolean, default: false },
    autoplay: { type: Number, default: 0 },
    label: { type: String, default: '' },
    'hide-controls': { type: Boolean, default: false },
    'hide-indicators': { type: Boolean, default: false },
  },
  state: { uid: '', count: 0, stopped: false, hovered: false },
  sanitize: { allowAttributes: ['style'] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${focusRing}
    ${iconCss('chevron-left', 'chevron-right', 'play', 'pause')}
    :host { display: block; --bq-carousel-gap: 1rem; }
    .carousel {
      position: relative;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-areas:
        "prev viewport next"
        ". indicators .";
      align-items: center;
      gap: var(--bq-space-2,0.5rem);
      font-family: var(--bq-font-family-sans);
    }
    .viewport { grid-area: viewport; overflow: hidden; border-radius: var(--bq-radius-lg,0.5rem); touch-action: pan-y; }
    .track {
      display: flex;
      gap: var(--bq-carousel-gap);
      transform: translateX(calc((100% + var(--bq-carousel-gap)) / var(--bq-carousel-per-view) * var(--bq-carousel-index) * -1));
      transition: transform var(--bq-duration-slow,300ms) var(--bq-easing-standard);
    }
    :host(:dir(rtl)) .track {
      transform: translateX(calc((100% + var(--bq-carousel-gap)) / var(--bq-carousel-per-view) * var(--bq-carousel-index)));
    }
    ::slotted(*) {
      flex: 0 0 calc((100% - var(--bq-carousel-gap) * (var(--bq-carousel-per-view) - 1)) / var(--bq-carousel-per-view));
      min-inline-size: 0;
    }
    .nav {
      display: inline-flex; align-items: center; justify-content: center;
      inline-size: 2.25rem; block-size: 2.25rem;
      border: 1px solid var(--bq-border-base,#e2e8f0);
      border-radius: var(--bq-radius-full,9999px);
      background: var(--bq-surface-overlay,#fff);
      color: var(--bq-text-base,#0f172a);
      cursor: pointer;
      box-shadow: var(--bq-shadow-sm);
      --bq-icon-size: 1.125rem;
      transition: background var(--bq-duration-fast,150ms) var(--bq-easing-standard);
    }
    .nav:hover:not(:disabled) { background: var(--bq-bg-muted,#f1f5f9); }
    .nav:disabled { opacity: 0.4; cursor: not-allowed; }
    .prev { grid-area: prev; }
    .next { grid-area: next; }
    :host(:dir(rtl)) .nav .icon { transform: scaleX(-1); }
    .indicators {
      grid-area: indicators;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    }
    .dot {
      inline-size: 0.625rem; block-size: 0.625rem; padding: 0;
      border: none; border-radius: var(--bq-radius-full,9999px);
      background: var(--bq-border-emphasis,#cbd5e1);
      cursor: pointer;
      transition: background var(--bq-duration-fast,150ms) var(--bq-easing-standard),
                  inline-size var(--bq-duration-fast,150ms) var(--bq-easing-standard);
    }
    .dot[aria-current="true"] { background: var(--bq-color-primary-600,#2563eb); inline-size: 1.5rem; }
    .play-toggle {
      display: inline-flex; align-items: center; justify-content: center;
      inline-size: 1.75rem; block-size: 1.75rem; padding: 0;
      border: none; border-radius: var(--bq-radius-full,9999px);
      background: transparent; color: var(--bq-text-muted,#475569);
      cursor: pointer; --bq-icon-size: 0.875rem;
    }
    .play-toggle:hover { background: var(--bq-bg-muted,#f1f5f9); color: var(--bq-text-base,#0f172a); }
    :host([hide-controls]) .carousel { grid-template-columns: minmax(0, 1fr); grid-template-areas: "viewport" "indicators"; }
    @media (prefers-reduced-motion: reduce) {
      .track, .nav, .dot { transition: none; }
    }
  `,
  connected() {
    const self = host<BqCarouselState>(this);
    const scope = bind(self);
    const local = carouselStore(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-carousel'));

    const slides = (): HTMLElement[] =>
      Array.from(self.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement
      );
    const perView = () =>
      Math.max(1, Math.floor(Number(self.getAttribute('per-view') ?? '1')) || 1);
    const currentIndex = () => {
      const raw = Math.floor(Number(self.getAttribute('index') ?? '0')) || 0;
      return Math.min(Math.max(0, raw), maxIndex(slides().length, perView()));
    };

    const goTo = (index: number) => {
      const target = Math.min(
        Math.max(0, index),
        maxIndex(slides().length, perView())
      );
      if (target === currentIndex() && self.hasAttribute('index')) return;
      self.setAttribute('index', String(target));
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: { index: target },
          bubbles: true,
          composed: true,
        })
      );
    };
    const step = (delta: number) =>
      goTo(
        stepIndex(
          currentIndex(),
          delta,
          slides().length,
          perView(),
          self.hasAttribute('loop')
        )
      );

    // ── Slide semantics (written onto light-DOM children) ────────────────
    const syncSlides = () => {
      const all = slides();
      if (self.getState<number>('count') !== all.length) {
        self.setState('count', all.length);
      }
      const start = currentIndex();
      const end = start + perView();
      all.forEach((slide, i) => {
        local.written.add(slide);
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        if (!slide.hasAttribute('aria-labelledby')) {
          slide.setAttribute(
            'aria-label',
            t('carousel.slide', { index: i + 1, total: all.length })
          );
        }
        const visible = i >= start && i < end;
        if (visible) {
          slide.removeAttribute('inert');
          slide.removeAttribute('aria-hidden');
        } else {
          slide.setAttribute('inert', '');
          slide.setAttribute('aria-hidden', 'true');
        }
      });
    };
    local.syncSlides = syncSlides;

    scope.add(() => {
      for (const slide of slides()) {
        if (!local.written.has(slide)) continue;
        for (const name of SLIDE_ATTRIBUTES) slide.removeAttribute(name);
      }
      local.written = new WeakSet();
    });

    const observer = new MutationObserver(() => syncSlides());
    observer.observe(self, { childList: true });
    scope.add(() => observer.disconnect());
    // `slotchange` covers the same added/removed slides through the platform
    // signal, so slide bookkeeping does not depend on the observer alone.
    queueMicrotask(() => {
      if (!self.isConnected) return;
      scope.on(self.shadowRoot?.querySelector('.track slot'), 'slotchange', syncSlides);
      syncSlides();
    });

    // ── Autoplay ────────────────────────────────────────────────────────
    const prefersReducedMotion = () =>
      self.ownerDocument?.defaultView?.matchMedia?.(
        '(prefers-reduced-motion: reduce)'
      )?.matches === true;

    const schedule = () => {
      local.pending?.();
      local.pending = null;
      const interval = Number(self.getAttribute('autoplay') ?? '0') || 0;
      if (interval <= 0 || !self.isConnected) return;
      if (self.getState<boolean>('stopped') || self.getState<boolean>('hovered')) return;
      if (prefersReducedMotion()) return;
      if (slides().length <= perView()) return;
      local.pending = scope.timeout(() => {
        local.pending = null;
        // Autoplay always wraps; stopping dead on the last slide would look broken.
        goTo(stepIndex(currentIndex(), 1, slides().length, perView(), true));
      }, Math.max(1000, interval));
    };
    local.schedule = schedule;
    scope.add(() => {
      local.pending = null;
    });

    const setHovered = (value: boolean) => {
      if (self.getState<boolean>('hovered') !== value) {
        self.setState('hovered', value);
      }
    };
    scope.on(self, 'mouseenter', () => setHovered(true));
    scope.on(self, 'mouseleave', () => {
      if (!self.matches(':focus-within')) setHovered(false);
    });
    scope.on(self, 'focusin', () => setHovered(true));
    scope.on(self, 'focusout', (event) => {
      const next = (event as FocusEvent).relatedTarget as Node | null;
      if (next && (self.contains(next) || self.shadowRoot?.contains(next))) return;
      setHovered(false);
    });

    // ── Controls ────────────────────────────────────────────────────────
    scope.on(self.shadowRoot, 'click', (event) => {
      const target = event.target as Element;
      if (target.closest('.prev')) return step(-1);
      if (target.closest('.next')) return step(1);
      const dot = target.closest('.dot');
      if (dot) return goTo(Number(dot.getAttribute('data-index') ?? '0'));
      if (target.closest('.play-toggle')) {
        self.setState('stopped', !self.getState<boolean>('stopped'));
      }
    });

    scope.on(self.shadowRoot, 'keydown', (event) => {
      const ke = event as KeyboardEvent;
      const target = ke.target as Element;
      if (!target.closest('.nav, .dot')) return;
      const rtl =
        self.ownerDocument?.defaultView?.getComputedStyle?.(self)?.direction ===
        'rtl';
      if (ke.key === 'ArrowRight' || ke.key === 'ArrowLeft') {
        ke.preventDefault();
        const forward = (ke.key === 'ArrowRight') !== rtl;
        step(forward ? 1 : -1);
        if (target.closest('.dot')) {
          // Keep focus on the indicator for the newly shown slide.
          scope.frame(() =>
            (
              self.shadowRoot?.querySelector(
                '.dot[aria-current="true"]'
              ) as HTMLElement | null
            )?.focus()
          );
        }
      }
    });

    // ── Swipe ───────────────────────────────────────────────────────────
    let startX: number | null = null;
    scope.on(self, 'pointerdown', (event) => {
      const pe = event as PointerEvent;
      if (pe.pointerType === 'mouse') return;
      startX = pe.clientX;
    });
    scope.on(document, 'pointerup', (event) => {
      if (startX === null) return;
      const dx = (event as PointerEvent).clientX - startX;
      startX = null;
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      const rtl =
        self.ownerDocument?.defaultView?.getComputedStyle?.(self)?.direction ===
        'rtl';
      step((dx < 0) !== rtl ? 1 : -1);
    });
    scope.on(document, 'pointercancel', () => {
      startX = null;
    });

    syncSlides();
  },
  disconnected() {
    release(this);
  },
  updated() {
    const local = carouselStore(this);
    local.syncSlides?.();
    local.schedule?.();
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-carousel';
    const trackId = `${uid}-track`;
    const count = state.count ?? 0;
    const perView = Math.max(1, Math.floor(Number(props['per-view'])) || 1);
    const last = maxIndex(count, perView);
    const index = Math.min(Math.max(0, Math.floor(Number(props.index)) || 0), last);
    const autoplay = Number(props.autoplay) > 0;
    const rotating = autoplay && !state.stopped && !state.hovered;
    const label = props.label || t('carousel.label');

    const pages = last + 1;
    const dots =
      !props['hide-indicators'] && count > perView
        ? Array.from({ length: pages }, (_, i) => {
            const current = i === index;
            return `<button
              type="button"
              class="dot"
              part="indicator"
              data-index="${i}"
              aria-controls="${escapeHtml(trackId)}"
              aria-label="${escapeHtml(t('carousel.goTo', { index: i + 1 }))}"
              ${current ? 'aria-current="true"' : ''}
              tabindex="${current ? '0' : '-1'}"
            ></button>`;
          }).join('')
        : '';

    const playToggle = autoplay
      ? `<button type="button" class="play-toggle" part="play-toggle" aria-controls="${escapeHtml(trackId)}" aria-label="${escapeHtml(state.stopped ? t('carousel.play') : t('carousel.pause'))}"><span class="icon" data-icon="${state.stopped ? 'play' : 'pause'}" aria-hidden="true"></span></button>`
      : '';

    const controls = !props['hide-controls']
      ? {
          prev: `<button type="button" class="nav prev" part="prev" aria-controls="${escapeHtml(trackId)}" aria-label="${escapeHtml(t('carousel.prev'))}" ${!props.loop && index <= 0 ? 'disabled' : ''}><span class="icon" data-icon="chevron-left" aria-hidden="true"></span></button>`,
          next: `<button type="button" class="nav next" part="next" aria-controls="${escapeHtml(trackId)}" aria-label="${escapeHtml(t('carousel.next'))}" ${!props.loop && index >= last ? 'disabled' : ''}><span class="icon" data-icon="chevron-right" aria-hidden="true"></span></button>`,
        }
      : { prev: '', next: '' };

    return html`
      <section
        class="carousel"
        part="base"
        aria-roledescription="carousel"
        aria-label="${escapeHtml(label)}"
      >
        ${controls.prev}
        <div class="viewport" part="viewport">
          <div
            class="track"
            part="track"
            id="${escapeHtml(trackId)}"
            aria-live="${rotating ? 'off' : 'polite'}"
            style="--bq-carousel-index: ${index}; --bq-carousel-per-view: ${perView}"
          ><slot></slot></div>
        </div>
        ${controls.next}
        ${
          dots || playToggle
            ? `<div class="indicators" part="indicators" role="group" aria-label="${escapeHtml(t('carousel.picker'))}">${playToggle}${dots}</div>`
            : ''
        }
      </section>
    `;
  },
};

component<BqCarouselProps, BqCarouselState>('bq-carousel', definition);
