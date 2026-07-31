/**
 * Anchored-positioning engine for the overlay components.
 *
 * Tooltip, Popover and Dropdown-Menu used to place their panels with static
 * CSS (`top: 100%`, `left: 0`, …). That is fine in the middle of a page and
 * wrong everywhere else: a menu opened near the bottom of the viewport renders
 * past the fold, a tooltip on a right-aligned toolbar button is clipped by the
 * window edge, and neither can react to the page scrolling underneath them.
 *
 * This module computes a placement that actually fits:
 *
 * - **flip** — when the preferred side overflows, try the opposite side and
 *   keep whichever has more room.
 * - **shift** — slide the panel along its cross axis to stay inside the
 *   viewport, without detaching it from the anchor.
 * - **arrow** — report where a pointer arrow has to sit so it still points at
 *   the anchor after flipping and shifting.
 *
 * The geometry lives in {@link resolvePosition}, a pure function over plain
 * rectangles. The DOM-reading wrappers ({@link computePosition},
 * {@link positionElement}, {@link autoPosition}) only gather rects and write
 * styles, so the interesting behaviour stays unit-testable in an environment
 * whose layout engine reports everything as zero.
 */
import type { Disposer } from './component.js';

/** The edge of the anchor a floating element is placed against. */
export type Side = 'top' | 'bottom' | 'left' | 'right';

/** How the floating element lines up along the anchor's cross axis. */
export type Align = 'start' | 'center' | 'end';

/** A side, optionally qualified by a cross-axis alignment. */
export type Placement = Side | `${Side}-${Align}`;

/**
 * A placement as it arrives from an attribute: any string is accepted (and
 * normalised by {@link parsePlacement}), while the known values still surface
 * in editor completion.
 */
export type PlacementInput = Placement | (string & {});

/** Minimal rectangle shape — a structural subset of `DOMRect`. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Geometry inputs for {@link resolvePosition}. */
export interface ResolvePositionInput {
  /** Rect of the element being pointed at, in viewport coordinates. */
  anchor: Rect;
  /** Rect of the element being placed. Only `width`/`height` are read. */
  floating: Rect;
  /** Available space, in viewport coordinates. */
  viewport: Rect;
  /** Preferred placement. @default 'bottom' */
  placement?: PlacementInput;
  /** Gap between anchor and floating element, in pixels. @default 8 */
  offset?: number;
  /** Minimum distance to keep from the viewport edges. @default 8 */
  padding?: number;
  /** Allow falling back to the opposite side. @default true */
  flip?: boolean;
  /** Allow sliding along the cross axis to stay in view. @default true */
  shift?: boolean;
  /** Size of the arrow along the cross axis, used to clamp it. @default 0 */
  arrowSize?: number;
  /** Corner radius the arrow must stay clear of. @default 4 */
  arrowPadding?: number;
}

/** Result of {@link resolvePosition}, in viewport coordinates. */
export interface PositionResult {
  /** Left edge of the floating element. */
  x: number;
  /** Top edge of the floating element. */
  y: number;
  /** The placement actually used, after flipping. */
  placement: Placement;
  /** Side component of {@link PositionResult.placement}. */
  side: Side;
  /** Align component of {@link PositionResult.placement}. */
  align: Align;
  /** True when the preferred side was abandoned. */
  flipped: boolean;
  /** Pixels the element was slid along its cross axis. */
  shifted: number;
  /**
   * Offset of the arrow from the floating element's leading edge along its
   * cross axis, or `null` when no arrow size was supplied.
   */
  arrow: number | null;
  /**
   * False when the anchor reported no extent, meaning the coordinates are not
   * trustworthy and callers should leave the CSS fallback in place.
   */
  measured: boolean;
}

const OPPOSITE: Record<Side, Side> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const SIDES: readonly Side[] = ['top', 'bottom', 'left', 'right'];
const ALIGNS: readonly Align[] = ['start', 'center', 'end'];

/**
 * Splits a placement string into its parts, falling back to `bottom-center`
 * for anything unrecognised so a typo in an attribute cannot throw.
 */
export function parsePlacement(placement: string | undefined | null): {
  side: Side;
  align: Align;
} {
  const raw = (placement ?? '').trim().toLowerCase();
  const [sidePart, alignPart] = raw.split('-') as [string, string | undefined];
  const side = (SIDES as readonly string[]).includes(sidePart)
    ? (sidePart as Side)
    : 'bottom';
  const align =
    alignPart && (ALIGNS as readonly string[]).includes(alignPart)
      ? (alignPart as Align)
      : 'center';
  return { side, align };
}

/** Rebuilds a placement string from its parts. */
export function formatPlacement(side: Side, align: Align): Placement {
  return align === 'center' ? side : (`${side}-${align}` as Placement);
}

/** True when the side runs along the vertical axis. */
function isVertical(side: Side): boolean {
  return side === 'top' || side === 'bottom';
}

const rectRight = (r: Rect) => r.x + r.width;
const rectBottom = (r: Rect) => r.y + r.height;

/** Main-axis coordinate for a side, before any shifting. */
function mainAxis(
  side: Side,
  anchor: Rect,
  floating: Rect,
  offset: number
): number {
  switch (side) {
    case 'top':
      return anchor.y - floating.height - offset;
    case 'bottom':
      return rectBottom(anchor) + offset;
    case 'left':
      return anchor.x - floating.width - offset;
    case 'right':
      return rectRight(anchor) + offset;
  }
}

/** Cross-axis coordinate for an alignment, before any shifting. */
function crossAxis(
  side: Side,
  align: Align,
  anchor: Rect,
  floating: Rect
): number {
  const vertical = isVertical(side);
  const anchorStart = vertical ? anchor.x : anchor.y;
  const anchorSize = vertical ? anchor.width : anchor.height;
  const floatingSize = vertical ? floating.width : floating.height;
  switch (align) {
    case 'start':
      return anchorStart;
    case 'end':
      return anchorStart + anchorSize - floatingSize;
    case 'center':
      return anchorStart + (anchorSize - floatingSize) / 2;
  }
}

/**
 * Free space between the anchor and the viewport edge on a given side.
 * Used to decide whether flipping actually buys anything.
 */
function spaceOn(
  side: Side,
  anchor: Rect,
  viewport: Rect,
  padding: number
): number {
  switch (side) {
    case 'top':
      return anchor.y - viewport.y - padding;
    case 'bottom':
      return rectBottom(viewport) - rectBottom(anchor) - padding;
    case 'left':
      return anchor.x - viewport.x - padding;
    case 'right':
      return rectRight(viewport) - rectRight(anchor) - padding;
  }
}

/** Size the floating element consumes along a side's main axis. */
function mainSize(side: Side, floating: Rect, offset: number): number {
  return (isVertical(side) ? floating.height : floating.width) + offset;
}

/**
 * Computes a viewport-relative position for a floating element.
 *
 * Pure geometry: no DOM access, no side effects. Every input is a plain
 * rectangle, which is what makes the flip/shift behaviour testable without a
 * real layout engine.
 *
 * Degenerate input is handled rather than rejected — a zero-sized viewport
 * (which is what a headless DOM reports) disables collision handling and the
 * preferred placement is returned untouched, so components behave predictably
 * under test and in browsers alike.
 */
export function resolvePosition(input: ResolvePositionInput): PositionResult {
  const {
    anchor,
    floating,
    viewport,
    offset = 8,
    padding = 8,
    flip = true,
    shift = true,
    arrowSize = 0,
    arrowPadding = 4,
  } = input;

  const preferred = parsePlacement(input.placement);
  // Collision handling needs both a viewport to collide with and an anchor
  // that has actually been laid out. A zero-sized anchor — an element still
  // in `display: none`, or any element in a headless DOM — would otherwise
  // report itself as overflowing every edge and flip for no reason. Falling
  // through to the preferred placement is both correct and predictable.
  const anchored = anchor.width > 0 || anchor.height > 0;
  const measurable = anchored && viewport.width > 0 && viewport.height > 0;

  let side = preferred.side;
  let align = preferred.align;
  let flipped = false;

  if (measurable && flip) {
    const available = spaceOn(side, anchor, viewport, padding);
    const needed = mainSize(side, floating, offset);
    if (available < needed) {
      const opposite = OPPOSITE[side];
      const oppositeAvailable = spaceOn(opposite, anchor, viewport, padding);
      // Only flip when the far side is genuinely roomier; otherwise a panel
      // that fits nowhere would jump sides for no benefit.
      if (oppositeAvailable > available) {
        side = opposite;
        flipped = true;
      }
    }
  }

  const vertical = isVertical(side);
  const floatingCross = vertical ? floating.width : floating.height;
  const viewportCrossStart = vertical ? viewport.x : viewport.y;
  const viewportCrossEnd = vertical
    ? rectRight(viewport)
    : rectBottom(viewport);

  // Cross-axis flip: a `-start` panel hanging off the right edge is usually
  // better served by `-end`, which is cheaper than shifting it far off-anchor.
  if (measurable && flip && align !== 'center') {
    const current = crossAxis(side, align, anchor, floating);
    const overflows =
      current < viewportCrossStart + padding ||
      current + floatingCross > viewportCrossEnd - padding;
    if (overflows) {
      const swapped: Align = align === 'start' ? 'end' : 'start';
      const candidate = crossAxis(side, swapped, anchor, floating);
      const candidateFits =
        candidate >= viewportCrossStart + padding &&
        candidate + floatingCross <= viewportCrossEnd - padding;
      if (candidateFits) align = swapped;
    }
  }

  const main = mainAxis(side, anchor, floating, offset);
  const crossIdeal = crossAxis(side, align, anchor, floating);
  let cross = crossIdeal;

  if (measurable && shift) {
    const min = viewportCrossStart + padding;
    const max = viewportCrossEnd - padding - floatingCross;
    // When the element is wider than the viewport, `max` falls below `min`;
    // pinning to `min` keeps the leading edge visible instead of the trailing.
    cross = max < min ? min : Math.min(Math.max(cross, min), max);
  }

  const shifted = cross - crossIdeal;

  let arrow: number | null = null;
  if (arrowSize > 0) {
    const anchorCrossStart = vertical ? anchor.x : anchor.y;
    const anchorCrossSize = vertical ? anchor.width : anchor.height;
    // Point at the anchor's midpoint, expressed relative to the panel's own
    // leading edge, then keep it clear of the rounded corners.
    const target = anchorCrossStart + anchorCrossSize / 2 - cross - arrowSize / 2;
    const min = arrowPadding;
    const max = floatingCross - arrowSize - arrowPadding;
    arrow = max < min ? min : Math.min(Math.max(target, min), max);
  }

  return {
    x: vertical ? cross : main,
    y: vertical ? main : cross,
    placement: formatPlacement(side, align),
    side,
    align,
    flipped,
    shifted,
    arrow,
    measured: anchored,
  };
}

/** Options accepted by the DOM-facing positioning helpers. */
export interface PositionOptions
  extends Omit<ResolvePositionInput, 'anchor' | 'floating' | 'viewport'> {
  /**
   * Element the arrow is rendered as. Its cross-axis size is measured and the
   * resolved offset is written back onto it.
   */
  arrowElement?: HTMLElement | null | undefined;
  /**
   * Coordinate space the returned `x`/`y` are expressed in.
   *
   * - `'absolute'` (default) — relative to `offsetParent`, matching a panel
   *   absolutely positioned inside its `position: relative` host.
   * - `'fixed'` — raw viewport coordinates.
   */
  strategy?: 'absolute' | 'fixed';
}

function toRect(rect: DOMRect | Rect): Rect {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  };
}

/** Reads an element's viewport rect, tolerating environments without layout. */
function measure(el: Element): Rect {
  const fn = (el as Element & { getBoundingClientRect?: () => DOMRect })
    .getBoundingClientRect;
  if (typeof fn !== 'function') return { x: 0, y: 0, width: 0, height: 0 };
  try {
    return toRect(fn.call(el));
  } catch {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
}

/** The visible viewport rect, or a zero rect when there is no window. */
function viewportRect(el: Element): Rect {
  const view = el.ownerDocument?.defaultView;
  if (!view) return { x: 0, y: 0, width: 0, height: 0 };
  return {
    x: 0,
    y: 0,
    width: view.innerWidth || 0,
    height: view.innerHeight || 0,
  };
}

/**
 * Measures anchor and floating element, then resolves a placement for them.
 * Coordinates follow {@link PositionOptions.strategy}.
 */
export function computePosition(
  anchor: Element,
  floating: HTMLElement,
  options: PositionOptions = {}
): PositionResult {
  const { arrowElement, strategy = 'absolute', ...rest } = options;
  const anchorRect = measure(anchor);
  const floatingRect = measure(floating);
  const arrowRect = arrowElement ? measure(arrowElement) : null;
  const { side } = parsePlacement(rest.placement);

  const resolved = resolvePosition({
    ...rest,
    anchor: anchorRect,
    floating: floatingRect,
    viewport: viewportRect(floating),
    ...(arrowRect
      ? {
          arrowSize: isVertical(side) ? arrowRect.width : arrowRect.height,
        }
      : {}),
  });

  if (strategy === 'fixed') return resolved;

  // Absolute coordinates are relative to the offset parent's padding box; the
  // panel's own rect already accounts for borders, so the parent rect is the
  // only correction needed.
  const parent = floating.offsetParent ?? floating.parentElement;
  if (!parent) return resolved;
  const parentRect = measure(parent);
  return {
    ...resolved,
    x: resolved.x - parentRect.x,
    y: resolved.y - parentRect.y,
  };
}

/**
 * Resolves a placement and writes it to the floating element's inline styles,
 * mirroring the outcome onto `data-placement` (and `data-side`) so CSS can key
 * transitions and arrow rotation off the *effective* placement rather than the
 * requested one.
 */
export function positionElement(
  anchor: Element,
  floating: HTMLElement,
  options: PositionOptions = {}
): PositionResult {
  const result = computePosition(anchor, floating, options);

  // Without a laid-out anchor the coordinates are meaningless. Publishing the
  // requested placement and leaving the stylesheet's static rules untouched
  // degrades to the pre-engine behaviour instead of pinning the panel to 0,0.
  if (!result.measured) {
    floating.setAttribute('data-placement', result.placement);
    floating.setAttribute('data-side', result.side);
    return result;
  }

  floating.style.position = options.strategy === 'fixed' ? 'fixed' : 'absolute';
  floating.style.left = `${Math.round(result.x)}px`;
  floating.style.top = `${Math.round(result.y)}px`;
  // The static-CSS placement rules used `right`/`bottom` for some sides; clear
  // them so a stale value cannot fight the computed offsets.
  floating.style.right = 'auto';
  floating.style.bottom = 'auto';
  floating.style.transform = 'none';
  floating.setAttribute('data-placement', result.placement);
  floating.setAttribute('data-side', result.side);

  const arrowEl = options.arrowElement;
  if (arrowEl && result.arrow !== null) {
    const vertical = result.side === 'top' || result.side === 'bottom';
    if (vertical) {
      arrowEl.style.left = `${Math.round(result.arrow)}px`;
      arrowEl.style.top = '';
    } else {
      arrowEl.style.top = `${Math.round(result.arrow)}px`;
      arrowEl.style.left = '';
    }
  }

  return result;
}

/** Collects scrollable ancestors so the panel can follow them. */
function scrollAncestors(el: Element): EventTarget[] {
  const targets: EventTarget[] = [];
  let node: Node | null = el.parentNode;
  while (node) {
    if (node instanceof ShadowRoot) {
      node = node.host;
      continue;
    }
    if (node instanceof Element) {
      targets.push(node);
      node = node.parentNode;
      continue;
    }
    break;
  }
  const view = el.ownerDocument?.defaultView;
  if (view) targets.push(view);
  return targets;
}

/**
 * Keeps a floating element positioned while it is visible.
 *
 * Repositions immediately, then again on scroll of any ancestor, on window
 * resize, and — where supported — whenever the anchor or the panel changes
 * size. Returns a disposer; register it on the component scope so an element
 * disconnected while open cannot strand listeners on `window`.
 */
export function autoPosition(
  anchor: Element,
  floating: HTMLElement,
  options: PositionOptions = {}
): Disposer {
  let frame: number | null = null;
  let disposed = false;

  const apply = () => {
    if (disposed || !floating.isConnected) return;
    positionElement(anchor, floating, options);
  };

  // Scroll fires far more often than layout needs updating; coalescing to one
  // frame keeps a long scroll from thrashing measurement and style writes.
  const schedule = () => {
    if (disposed || frame !== null) return;
    const view = floating.ownerDocument?.defaultView;
    if (!view?.requestAnimationFrame) {
      apply();
      return;
    }
    frame = view.requestAnimationFrame(() => {
      frame = null;
      apply();
    });
  };

  apply();

  const targets = scrollAncestors(anchor);
  for (const target of targets) {
    target.addEventListener('scroll', schedule, { passive: true });
  }
  const view = floating.ownerDocument?.defaultView;
  view?.addEventListener('resize', schedule, { passive: true });

  let observer: ResizeObserver | null = null;
  const ResizeObserverCtor = (
    view as unknown as { ResizeObserver?: typeof ResizeObserver } | undefined
  )?.ResizeObserver;
  if (ResizeObserverCtor) {
    observer = new ResizeObserverCtor(schedule);
    observer.observe(anchor);
    observer.observe(floating);
  }

  return () => {
    if (disposed) return;
    disposed = true;
    if (frame !== null) view?.cancelAnimationFrame?.(frame);
    frame = null;
    for (const target of targets) {
      target.removeEventListener('scroll', schedule);
    }
    view?.removeEventListener('resize', schedule);
    observer?.disconnect();
    observer = null;
  };
}
