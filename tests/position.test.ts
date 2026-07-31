// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, describe, expect, it } from 'bun:test';
import {
  autoPosition,
  formatPlacement,
  parsePlacement,
  positionElement,
  resolvePosition,
  type Rect,
} from '../src/utils/position.js';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

const viewport: Rect = { x: 0, y: 0, width: 1000, height: 800 };
const panel: Rect = { x: 0, y: 0, width: 200, height: 100 };

/** Anchor centred in the viewport — collides with nothing. */
const centered: Rect = { x: 400, y: 350, width: 100, height: 40 };

describe('parsePlacement', () => {
  it('splits a side-align placement', () => {
    expect(parsePlacement('bottom-start')).toEqual({
      side: 'bottom',
      align: 'start',
    });
  });

  it('defaults a bare side to center alignment', () => {
    expect(parsePlacement('left')).toEqual({ side: 'left', align: 'center' });
  });

  it('falls back to bottom-center for unusable input', () => {
    expect(parsePlacement('sideways')).toEqual({
      side: 'bottom',
      align: 'center',
    });
    expect(parsePlacement(undefined)).toEqual({
      side: 'bottom',
      align: 'center',
    });
    expect(parsePlacement('top-diagonal')).toEqual({
      side: 'top',
      align: 'center',
    });
  });

  it('round-trips through formatPlacement', () => {
    expect(formatPlacement('top', 'center')).toBe('top');
    expect(formatPlacement('top', 'end')).toBe('top-end');
  });
});

describe('resolvePosition — placement geometry', () => {
  it('places a bottom-centered panel below and centered on the anchor', () => {
    const r = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport,
      placement: 'bottom',
      offset: 8,
    });
    expect(r.side).toBe('bottom');
    expect(r.y).toBe(centered.y + centered.height + 8);
    // Anchor centre is 450; panel is 200 wide, so its left edge sits at 350.
    expect(r.x).toBe(350);
    expect(r.flipped).toBe(false);
    expect(r.shifted).toBe(0);
  });

  it('places a top panel above the anchor', () => {
    const r = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport,
      placement: 'top',
      offset: 8,
    });
    expect(r.y).toBe(centered.y - panel.height - 8);
  });

  it('honours start and end alignment on the cross axis', () => {
    const start = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport,
      placement: 'bottom-start',
    });
    expect(start.x).toBe(centered.x);

    const end = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport,
      placement: 'bottom-end',
    });
    expect(end.x).toBe(centered.x + centered.width - panel.width);
  });

  it('places left and right panels on the horizontal axis', () => {
    const left = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport,
      placement: 'left',
      offset: 8,
    });
    expect(left.x).toBe(centered.x - panel.width - 8);

    const right = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport,
      placement: 'right',
      offset: 8,
    });
    expect(right.x).toBe(centered.x + centered.width + 8);
  });
});

describe('resolvePosition — flip', () => {
  it('flips a bottom panel to top when it would run past the bottom edge', () => {
    const nearBottom: Rect = { x: 400, y: 760, width: 100, height: 30 };
    const r = resolvePosition({
      anchor: nearBottom,
      floating: panel,
      viewport,
      placement: 'bottom',
    });
    expect(r.side).toBe('top');
    expect(r.flipped).toBe(true);
    expect(r.y).toBe(nearBottom.y - panel.height - 8);
  });

  it('flips a top panel to bottom when it would run past the top edge', () => {
    const nearTop: Rect = { x: 400, y: 10, width: 100, height: 30 };
    const r = resolvePosition({
      anchor: nearTop,
      floating: panel,
      viewport,
      placement: 'top',
    });
    expect(r.side).toBe('bottom');
    expect(r.flipped).toBe(true);
  });

  it('stays put when the opposite side is no roomier', () => {
    // An anchor spanning almost the whole viewport leaves equally little room
    // above and below. The panel fits on neither side, so flipping would only
    // make the placement jitter without buying any space.
    const tallAnchor: Rect = { x: 400, y: 5, width: 100, height: 790 };
    const r = resolvePosition({
      anchor: tallAnchor,
      floating: panel,
      viewport,
      placement: 'bottom',
    });
    expect(r.side).toBe('bottom');
    expect(r.flipped).toBe(false);
  });

  it('picks the roomier side when neither side fits outright', () => {
    // Panel taller than either gap: bottom has 352px, top has 392px, so the
    // engine still takes the better of two bad options.
    const tall: Rect = { x: 0, y: 0, width: 200, height: 900 };
    const middle: Rect = { x: 400, y: 400, width: 100, height: 40 };
    const r = resolvePosition({
      anchor: middle,
      floating: tall,
      viewport,
      placement: 'bottom',
    });
    expect(r.side).toBe('top');
    expect(r.flipped).toBe(true);
  });

  it('does not flip when flip is disabled', () => {
    const nearBottom: Rect = { x: 400, y: 760, width: 100, height: 30 };
    const r = resolvePosition({
      anchor: nearBottom,
      floating: panel,
      viewport,
      placement: 'bottom',
      flip: false,
    });
    expect(r.side).toBe('bottom');
    expect(r.flipped).toBe(false);
  });

  it('flips alignment when a -start panel overflows the trailing edge', () => {
    const nearRight: Rect = { x: 900, y: 300, width: 80, height: 30 };
    const r = resolvePosition({
      anchor: nearRight,
      floating: panel,
      viewport,
      placement: 'bottom-start',
    });
    expect(r.align).toBe('end');
    expect(r.placement).toBe('bottom-end');
  });
});

describe('resolvePosition — shift', () => {
  it('slides a panel back inside the left viewport edge', () => {
    const nearLeft: Rect = { x: 4, y: 300, width: 40, height: 30 };
    const r = resolvePosition({
      anchor: nearLeft,
      floating: panel,
      viewport,
      placement: 'bottom',
      padding: 8,
    });
    expect(r.x).toBe(8);
    expect(r.shifted).toBeGreaterThan(0);
  });

  it('slides a panel back inside the right viewport edge', () => {
    const nearRight: Rect = { x: 960, y: 300, width: 40, height: 30 };
    const r = resolvePosition({
      anchor: nearRight,
      floating: panel,
      viewport,
      placement: 'bottom',
      padding: 8,
    });
    expect(r.x).toBe(viewport.width - 8 - panel.width);
    expect(r.shifted).toBeLessThan(0);
  });

  it('pins the leading edge when the panel is wider than the viewport', () => {
    const huge: Rect = { x: 0, y: 0, width: 1200, height: 100 };
    const r = resolvePosition({
      anchor: centered,
      floating: huge,
      viewport,
      placement: 'bottom',
      padding: 8,
    });
    expect(r.x).toBe(8);
  });

  it('does not shift when shift is disabled', () => {
    const nearLeft: Rect = { x: 4, y: 300, width: 40, height: 30 };
    const r = resolvePosition({
      anchor: nearLeft,
      floating: panel,
      viewport,
      placement: 'bottom',
      shift: false,
    });
    expect(r.shifted).toBe(0);
    expect(r.x).toBeLessThan(0);
  });
});

describe('resolvePosition — arrow', () => {
  it('reports no arrow offset when no arrow size is given', () => {
    const r = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport,
      placement: 'bottom',
    });
    expect(r.arrow).toBeNull();
  });

  it('centres the arrow on the anchor', () => {
    const r = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport,
      placement: 'bottom',
      arrowSize: 10,
    });
    // Anchor centre 450, panel left edge 350, arrow half-width 5.
    expect(r.arrow).toBe(95);
  });

  it('keeps pointing at the anchor after the panel is shifted', () => {
    const nearLeft: Rect = { x: 4, y: 300, width: 40, height: 30 };
    const r = resolvePosition({
      anchor: nearLeft,
      floating: panel,
      viewport,
      placement: 'bottom',
      arrowSize: 10,
      padding: 8,
    });
    // Panel pinned to x=8; anchor centre is 24, so the arrow sits at 24-8-5.
    expect(r.arrow).toBe(11);
  });

  it('clamps the arrow inside the panel corners', () => {
    const farLeft: Rect = { x: 0, y: 300, width: 4, height: 30 };
    const r = resolvePosition({
      anchor: farLeft,
      floating: panel,
      viewport,
      placement: 'bottom',
      arrowSize: 10,
      arrowPadding: 6,
      padding: 8,
    });
    expect(r.arrow).toBe(6);
  });
});

describe('resolvePosition — degenerate input', () => {
  it('keeps the preferred placement when the anchor has no extent', () => {
    const r = resolvePosition({
      anchor: { x: 0, y: 0, width: 0, height: 0 },
      floating: panel,
      viewport,
      placement: 'top-start',
    });
    expect(r.placement).toBe('top-start');
    expect(r.flipped).toBe(false);
    expect(r.shifted).toBe(0);
    expect(r.measured).toBe(false);
  });

  it('keeps the preferred placement when the viewport has no extent', () => {
    const r = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport: { x: 0, y: 0, width: 0, height: 0 },
      placement: 'right-end',
    });
    expect(r.placement).toBe('right-end');
    expect(r.flipped).toBe(false);
  });

  it('marks a laid-out anchor as measured', () => {
    const r = resolvePosition({
      anchor: centered,
      floating: panel,
      viewport,
      placement: 'bottom',
    });
    expect(r.measured).toBe(true);
  });
});

describe('positionElement — DOM writes', () => {
  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('publishes the placement without touching styles for an unmeasured anchor', () => {
    // happy-dom reports zero-sized rects, which is exactly the "no layout"
    // case the engine must not act on.
    const anchor = doc.createElement('div');
    const panel = doc.createElement('div');
    anchor.appendChild(panel);
    doc.body.appendChild(anchor);

    const result = positionElement(anchor, panel, { placement: 'top-start' });

    expect(result.measured).toBe(false);
    expect(panel.getAttribute('data-placement')).toBe('top-start');
    expect(panel.getAttribute('data-side')).toBe('top');
    // The static CSS fallback must survive untouched.
    expect(panel.style.left).toBe('');
    expect(panel.style.top).toBe('');
  });
});

describe('autoPosition — teardown', () => {
  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('removes every listener it registered when disposed', () => {
    const anchor = doc.createElement('div');
    const panel = doc.createElement('div');
    anchor.appendChild(panel);
    doc.body.appendChild(anchor);

    const added: string[] = [];
    const removed: string[] = [];
    const originalAdd = win.addEventListener.bind(win);
    const originalRemove = win.removeEventListener.bind(win);
    win.addEventListener = ((type: string, ...rest: unknown[]) => {
      added.push(type);
      return (originalAdd as (...a: unknown[]) => unknown)(type, ...rest);
    }) as typeof win.addEventListener;
    win.removeEventListener = ((type: string, ...rest: unknown[]) => {
      removed.push(type);
      return (originalRemove as (...a: unknown[]) => unknown)(type, ...rest);
    }) as typeof win.removeEventListener;

    try {
      const stop = autoPosition(anchor, panel, { placement: 'bottom' });
      expect(added).toContain('resize');
      expect(added).toContain('scroll');
      stop();
      expect(removed).toContain('resize');
      expect(removed).toContain('scroll');
      // Disposing twice must stay harmless.
      expect(() => stop()).not.toThrow();
    } finally {
      win.addEventListener = originalAdd as typeof win.addEventListener;
      win.removeEventListener = originalRemove as typeof win.removeEventListener;
    }
  });
});
