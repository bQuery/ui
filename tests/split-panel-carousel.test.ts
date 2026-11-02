// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { resetLocale, setLocale } from '../src/i18n/index.js';
import {
  applySnap,
  clampPosition,
  parseSnapPoints,
} from '../src/components/split-panel/BqSplitPanel.js';
import { maxIndex, stepIndex } from '../src/components/carousel/BqCarousel.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

const key = (target: Element, k: string) =>
  target.dispatchEvent(
    new win.KeyboardEvent('keydown', {
      key: k,
      bubbles: true,
      composed: true,
      cancelable: true,
    })
  );

describe('split-panel helpers', () => {
  it('clamps into bounds and tolerates bad input', () => {
    expect(clampPosition(120, 0, 100)).toBe(100);
    expect(clampPosition(-5, 10, 90)).toBe(10);
    expect(clampPosition(50, 60, 40)).toBe(60);
    expect(clampPosition(Number.NaN, 20, 80)).toBe(20);
  });

  it('parses and applies snap points', () => {
    expect(parseSnapPoints('75 25, 50')).toEqual([25, 50, 75]);
    expect(applySnap(49, [25, 50, 75])).toBe(50);
    expect(applySnap(45, [25, 50, 75])).toBe(45);
  });
});

describe('bq-split-panel', () => {
  beforeAll(async () => {
    await import('../src/components/split-panel/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
    resetLocale();
  });

  const create = (attrs: Record<string, string> = {}) => {
    const el = doc.createElement('bq-split-panel');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.innerHTML = '<div slot="start">A</div><div slot="end">B</div>';
    doc.body.appendChild(el);
    return el;
  };
  const divider = (el: HTMLElement) =>
    el.shadowRoot?.querySelector('[role="separator"]') as HTMLElement;

  it('exposes a focusable window-splitter separator', async () => {
    const el = create({ position: '30' });
    await waitForFrame();
    const sep = divider(el);
    expect(sep.getAttribute('tabindex')).toBe('0');
    expect(sep.getAttribute('aria-valuenow')).toBe('30');
    expect(sep.getAttribute('aria-valuemin')).toBe('0');
    expect(sep.getAttribute('aria-valuemax')).toBe('100');
    expect(sep.getAttribute('aria-orientation')).toBe('vertical');
    expect(sep.getAttribute('aria-label')).toBe('Resize panels');
    const start = el.shadowRoot?.querySelector('[part="start"]');
    expect(sep.getAttribute('aria-controls')).toBe(start?.id ?? '');
    expect(
      el.shadowRoot?.querySelector('[part="base"]')?.getAttribute('style')
    ).toContain('--bq-split-pos: 30%');
  });

  it('resizes with the arrow keys and emits bq-resize', async () => {
    const el = create({ position: '50', step: '10' });
    await waitForFrame();
    const positions: number[] = [];
    el.addEventListener('bq-resize', (e) =>
      positions.push((e as CustomEvent<{ position: number }>).detail.position)
    );
    key(divider(el), 'ArrowRight');
    await waitForFrame();
    key(divider(el), 'ArrowLeft');
    key(divider(el), 'ArrowLeft');
    await waitForFrame();
    expect(positions).toEqual([60, 50, 40]);
    expect(divider(el).getAttribute('aria-valuenow')).toBe('40');
  });

  it('jumps to the limits with Home/End and respects min/max', async () => {
    const el = create({ position: '50', min: '20', max: '70' });
    await waitForFrame();
    key(divider(el), 'Home');
    expect(el.getAttribute('position')).toBe('20');
    key(divider(el), 'End');
    expect(el.getAttribute('position')).toBe('70');
    key(divider(el), 'ArrowRight');
    expect(el.getAttribute('position')).toBe('70');
  });

  it('collapses and restores with Enter', async () => {
    const el = create({ position: '35', min: '10' });
    await waitForFrame();
    key(divider(el), 'Enter');
    expect(el.getAttribute('position')).toBe('10');
    key(divider(el), 'Enter');
    expect(el.getAttribute('position')).toBe('35');
  });

  it('uses the vertical arrow keys when stacked', async () => {
    const el = create({ position: '50', orientation: 'vertical' });
    await waitForFrame();
    expect(divider(el).getAttribute('aria-orientation')).toBe('horizontal');
    key(divider(el), 'ArrowRight');
    expect(el.getAttribute('position')).toBe('50');
    key(divider(el), 'ArrowDown');
    expect(el.getAttribute('position')).toBe('55');
  });

  it('ignores input while disabled', async () => {
    const el = create({ position: '50', disabled: '' });
    await waitForFrame();
    expect(divider(el).getAttribute('tabindex')).toBe('-1');
    key(divider(el), 'Home');
    expect(el.getAttribute('position')).toBe('50');
  });

  it('localizes the divider label', async () => {
    setLocale({ splitPanel: { label: 'Bereiche anpassen' } });
    const el = create();
    await waitForFrame();
    expect(divider(el).getAttribute('aria-label')).toBe('Bereiche anpassen');
  });

  it('starts a drag from a slotted custom handle', async () => {
    const el = doc.createElement('bq-split-panel');
    el.innerHTML =
      '<div slot="start">A</div><span slot="divider" class="grip">::</span><div slot="end">B</div>';
    doc.body.appendChild(el);
    await waitForFrame();
    el.querySelector('.grip')?.dispatchEvent(
      new win.Event('pointerdown', { bubbles: true, composed: true, cancelable: true })
    );
    expect(el.hasAttribute('data-dragging')).toBe(true);
    doc.dispatchEvent(new win.Event('pointerup'));
    expect(el.hasAttribute('data-dragging')).toBe(false);
  });

  it('ignores presses on pane content that happens to use a divider class', async () => {
    const el = doc.createElement('bq-split-panel');
    el.innerHTML = '<div slot="start"><hr class="divider" /></div><div slot="end">B</div>';
    doc.body.appendChild(el);
    await waitForFrame();
    el.querySelector('hr')?.dispatchEvent(
      new win.Event('pointerdown', { bubbles: true, composed: true, cancelable: true })
    );
    expect(el.hasAttribute('data-dragging')).toBe(false);
  });

  it('rewrites an out-of-range position to the displayed value', async () => {
    const el = create({ position: '50', min: '60' });
    await waitForFrame();
    const positions: number[] = [];
    el.addEventListener('bq-resize', (e) =>
      positions.push((e as CustomEvent<{ position: number }>).detail.position)
    );
    key(divider(el), 'Home');
    expect(el.getAttribute('position')).toBe('60');
    expect(positions).toEqual([60]);
  });

  it('follows only the pointer that started the drag', async () => {
    const el = create({ position: '50' });
    await waitForFrame();
    const pointer = (type: string, pointerId: number, target: EventTarget) => {
      const event = new win.Event(type, { bubbles: true, composed: true, cancelable: true });
      Object.defineProperty(event, 'pointerId', { value: pointerId });
      target.dispatchEvent(event);
    };
    pointer('pointerdown', 1, divider(el));
    expect(el.hasAttribute('data-dragging')).toBe(true);
    // A second finger neither restarts nor ends the drag.
    pointer('pointerdown', 2, divider(el));
    pointer('pointerup', 2, doc);
    expect(el.hasAttribute('data-dragging')).toBe(true);
    pointer('pointerup', 1, doc);
    expect(el.hasAttribute('data-dragging')).toBe(false);
  });

  it('removes drag listeners from document on disconnect', async () => {
    const el = create();
    await waitForFrame();
    const added: string[] = [];
    const removed: string[] = [];
    const origAdd = doc.addEventListener.bind(doc);
    const origRemove = doc.removeEventListener.bind(doc);
    doc.addEventListener = ((type: string, ...rest: unknown[]) => {
      added.push(type);
      return (origAdd as (...args: unknown[]) => void)(type, ...rest);
    }) as Document['addEventListener'];
    doc.removeEventListener = ((type: string, ...rest: unknown[]) => {
      removed.push(type);
      return (origRemove as (...args: unknown[]) => void)(type, ...rest);
    }) as Document['removeEventListener'];
    try {
      divider(el).dispatchEvent(
        new win.Event('pointerdown', { bubbles: true, composed: true, cancelable: true })
      );
      expect(el.hasAttribute('data-dragging')).toBe(true);
      expect(added).toContain('pointermove');
      el.remove();
      expect(removed).toContain('pointermove');
      expect(removed).toContain('pointerup');
      expect(el.hasAttribute('data-dragging')).toBe(false);
    } finally {
      doc.addEventListener = origAdd;
      doc.removeEventListener = origRemove;
    }
  });
});

describe('carousel helpers', () => {
  it('computes the last start index', () => {
    expect(maxIndex(5, 1)).toBe(4);
    expect(maxIndex(5, 2)).toBe(3);
    expect(maxIndex(2, 3)).toBe(0);
  });

  it('steps with and without looping', () => {
    expect(stepIndex(4, 1, 5, 1, false)).toBe(4);
    expect(stepIndex(4, 1, 5, 1, true)).toBe(0);
    expect(stepIndex(0, -1, 5, 1, true)).toBe(4);
    expect(stepIndex(0, -1, 5, 1, false)).toBe(0);
    expect(stepIndex(2, 1, 5, 2, true)).toBe(3);
    expect(stepIndex(3, 1, 5, 2, true)).toBe(0);
  });
});

describe('bq-carousel', () => {
  beforeAll(async () => {
    await import('../src/components/carousel/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (attrs: Record<string, string> = {}, slides = 4) => {
    const el = doc.createElement('bq-carousel');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    for (let i = 0; i < slides; i += 1) {
      const slide = doc.createElement('div');
      slide.textContent = `Slide ${i + 1}`;
      el.appendChild(slide);
    }
    doc.body.appendChild(el);
    return el;
  };
  const q = (el: HTMLElement, sel: string) =>
    el.shadowRoot?.querySelector(sel) as HTMLElement | null;

  it('labels the region and every slide', async () => {
    const el = create({ label: 'Featured' });
    await waitForFrame();
    const base = q(el, '[part="base"]');
    expect(base?.getAttribute('aria-roledescription')).toBe('carousel');
    expect(base?.getAttribute('aria-label')).toBe('Featured');
    const slides = Array.from(el.children);
    expect(slides[0]?.getAttribute('role')).toBe('group');
    expect(slides[0]?.getAttribute('aria-roledescription')).toBe('slide');
    expect(slides[1]?.getAttribute('aria-label')).toBe('2 of 4');
  });

  it('makes slides outside the view inert', async () => {
    const el = create({ index: '1' });
    await waitForFrame();
    const slides = Array.from(el.children);
    expect(slides[1]?.hasAttribute('inert')).toBe(false);
    expect(slides[0]?.hasAttribute('inert')).toBe(true);
    expect(slides[2]?.getAttribute('aria-hidden')).toBe('true');
  });

  it('navigates with the buttons and emits bq-change', async () => {
    const el = create();
    await waitForFrame();
    const indices: number[] = [];
    el.addEventListener('bq-change', (e) =>
      indices.push((e as CustomEvent<{ index: number }>).detail.index)
    );
    expect((q(el, '.prev') as HTMLButtonElement).disabled).toBe(true);
    q(el, '.next')?.click();
    await waitForFrame();
    q(el, '.next')?.click();
    await waitForFrame();
    q(el, '.prev')?.click();
    await waitForFrame();
    expect(indices).toEqual([1, 2, 1]);
    expect(Array.from(el.children)[1]?.hasAttribute('inert')).toBe(false);
  });

  it('disables next at the end unless looping', async () => {
    const el = create({ index: '3' });
    await waitForFrame();
    expect((q(el, '.next') as HTMLButtonElement).disabled).toBe(true);
    el.setAttribute('loop', '');
    await waitForFrame();
    expect((q(el, '.next') as HTMLButtonElement).disabled).toBe(false);
    q(el, '.next')?.click();
    expect(el.getAttribute('index')).toBe('0');
  });

  it('renders one indicator per reachable position and marks the current one', async () => {
    const el = create({ 'per-view': '2' });
    await waitForFrame();
    const dots = el.shadowRoot?.querySelectorAll('.dot') ?? [];
    expect(dots.length).toBe(3);
    expect(dots[0]?.getAttribute('aria-current')).toBe('true');
    (dots[2] as HTMLElement).click();
    await waitForFrame();
    expect(el.getAttribute('index')).toBe('2');
    const slides = Array.from(el.children);
    expect(slides[2]?.hasAttribute('inert')).toBe(false);
    expect(slides[3]?.hasAttribute('inert')).toBe(false);
    expect(slides[1]?.hasAttribute('inert')).toBe(true);
  });

  it('moves with arrow keys on the controls', async () => {
    const el = create();
    await waitForFrame();
    key(q(el, '.next')!, 'ArrowRight');
    expect(el.getAttribute('index')).toBe('1');
    key(q(el, '.next')!, 'ArrowLeft');
    expect(el.getAttribute('index')).toBe('0');
  });

  it('picks up added slides', async () => {
    const el = create({}, 2);
    await waitForFrame();
    const extra = doc.createElement('div');
    el.appendChild(extra);
    await waitForFrame();
    await waitForFrame();
    expect(extra.getAttribute('aria-label')).toBe('3 of 3');
    expect(el.shadowRoot?.querySelectorAll('.dot').length).toBe(3);
  });

  it('autoplays with a pause button, and the button stops rotation', async () => {
    const el = create({ autoplay: '1000', loop: '' }, 3);
    await waitForFrame();
    const toggle = q(el, '.play-toggle');
    expect(toggle?.getAttribute('aria-label')).toBe('Pause automatic slide show');
    expect(q(el, '.track')?.getAttribute('aria-live')).toBe('off');

    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(el.getAttribute('index')).toBe('1');

    q(el, '.play-toggle')?.click();
    await waitForFrame();
    expect(q(el, '.play-toggle')?.getAttribute('aria-label')).toBe(
      'Start automatic slide show'
    );
    expect(q(el, '.track')?.getAttribute('aria-live')).toBe('polite');
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(el.getAttribute('index')).toBe('1');
  });

  it('pauses autoplay while hovered', async () => {
    const el = create({ autoplay: '1000' }, 3);
    await waitForFrame();
    el.dispatchEvent(new win.Event('mouseenter'));
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(el.getAttribute('index') ?? '0').toBe('0');
  });

  it('removes the slide attributes it wrote when disconnected', async () => {
    const el = create();
    await waitForFrame();
    const slide = el.children[1] as HTMLElement;
    expect(slide.hasAttribute('inert')).toBe(true);
    el.remove();
    expect(slide.hasAttribute('role')).toBe(false);
    expect(slide.hasAttribute('inert')).toBe(false);
    expect(slide.hasAttribute('aria-label')).toBe(false);
  });

  it('keeps author-supplied slide semantics and restores them on disconnect', async () => {
    const el = doc.createElement('bq-carousel');
    el.innerHTML =
      '<div role="tabpanel" aria-label="Intro">A</div><div aria-roledescription="card">B</div><div>C</div>';
    doc.body.appendChild(el);
    await waitForFrame();
    const [a, b, c] = Array.from(el.children) as HTMLElement[];
    expect(a?.getAttribute('role')).toBe('tabpanel');
    expect(a?.getAttribute('aria-label')).toBe('Intro');
    expect(b?.getAttribute('aria-roledescription')).toBe('card');
    expect(b?.getAttribute('role')).toBe('group');
    expect(c?.getAttribute('aria-label')).toBe('3 of 3');
    el.remove();
    expect(a?.getAttribute('role')).toBe('tabpanel');
    expect(a?.getAttribute('aria-label')).toBe('Intro');
    expect(b?.getAttribute('aria-roledescription')).toBe('card');
    expect(b?.hasAttribute('role')).toBe(false);
    expect(c?.hasAttribute('aria-label')).toBe(false);
  });
});
