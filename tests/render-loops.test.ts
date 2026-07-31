/**
 * Guards against components that fight their own MutationObserver.
 *
 * Several components write to their light-DOM children from `updated()` while
 * observing that same subtree. `setAttribute` produces a mutation record even
 * when the value is unchanged, so an unconditional write re-enters the
 * observer, re-renders, writes again — and pins the main thread. `bq-tabs`
 * shipped exactly that: any page using the documented panel markup froze on
 * load, and no unit test noticed because the runtime's observer timing differs
 * from a browser's.
 *
 * These tests assert the invariant that makes the loop impossible: a second
 * pass over already-correct DOM must write nothing at all.
 */
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

/** Counts attribute writes that actually change something, and those that do not. */
function countWrites(el: Element): {
  redundant: number;
  restore: () => void;
} {
  const original = el.setAttribute.bind(el);
  let redundant = 0;
  (el as unknown as { setAttribute: Element['setAttribute'] }).setAttribute = (
    name: string,
    value: string
  ) => {
    if (el.getAttribute(name) === value) redundant += 1;
    original(name, value);
  };
  return {
    get redundant() {
      return redundant;
    },
    restore() {
      delete (el as unknown as Record<string, unknown>)['setAttribute'];
    },
  } as { redundant: number; restore: () => void };
}

describe('bq-tabs light-DOM sync', () => {
  beforeAll(async () => {
    await import('../src/components/tabs/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (): HTMLElement => {
    const el = doc.createElement('bq-tabs');
    el.setAttribute('active-tab', 'one');
    el.innerHTML = `
      <div data-tab-item id="one" label="One"></div>
      <div data-tab-item id="two" label="Two"></div>
      <div data-tab="one">First panel</div>
      <div data-tab="two">Second panel</div>`;
    doc.body.appendChild(el);
    return el;
  };

  it('wires the panels up', async () => {
    const el = create();
    await waitForFrame();

    const panel = el.querySelector('[data-tab="one"]') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-hidden')).toBe('false');
    expect(panel.id).toBeTruthy();

    const hidden = el.querySelector('[data-tab="two"]') as HTMLElement;
    expect(hidden.getAttribute('aria-hidden')).toBe('true');
    expect(hidden.hidden).toBe(true);
  });

  // The loop's fuel: writing an attribute that already holds that value.
  it('writes nothing to a panel that is already correct', async () => {
    const el = create();
    await waitForFrame();

    const panel = el.querySelector('[data-tab="one"]') as HTMLElement;
    const spy = countWrites(panel);
    try {
      // Force another render over already-wired DOM.
      el.setAttribute('variant', 'pills');
      await waitForFrame();
      expect(spy.redundant).toBe(0);
    } finally {
      spy.restore();
    }
  });

  it('still updates the panels when the active tab changes', async () => {
    const el = create();
    await waitForFrame();

    el.setAttribute('active-tab', 'two');
    await waitForFrame();

    expect(
      (el.querySelector('[data-tab="two"]') as HTMLElement).getAttribute(
        'aria-hidden'
      )
    ).toBe('false');
    expect(
      (el.querySelector('[data-tab="one"]') as HTMLElement).getAttribute(
        'aria-hidden'
      )
    ).toBe('true');
  });
});

describe('bq-card slot bands', () => {
  beforeAll(async () => {
    await import('../src/components/card/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  // `:empty` cannot see this: the band always contains a <slot> element, so a
  // card with no footer used to draw a bordered grey strip anyway.
  it('hides the footer band when nothing is slotted into it', async () => {
    const el = doc.createElement('bq-card');
    el.textContent = 'Body only';
    doc.body.appendChild(el);
    await waitForFrame();

    expect(
      el.shadowRoot?.querySelector('.card-footer')?.hasAttribute('data-empty')
    ).toBe(true);
  });

  it('shows the footer band once something is slotted', async () => {
    const el = doc.createElement('bq-card');
    el.innerHTML = 'Body<div slot="footer">Actions</div>';
    doc.body.appendChild(el);
    await waitForFrame();

    expect(
      el.shadowRoot?.querySelector('.card-footer')?.hasAttribute('data-empty')
    ).toBe(false);
  });

  it('shows the header band for a title as well as for a slot', async () => {
    const titled = doc.createElement('bq-card');
    titled.setAttribute('title', 'Report');
    doc.body.appendChild(titled);

    const slotted = doc.createElement('bq-card');
    slotted.innerHTML = '<div slot="header">Custom</div>Body';
    doc.body.appendChild(slotted);

    const bare = doc.createElement('bq-card');
    bare.textContent = 'Body';
    doc.body.appendChild(bare);
    await waitForFrame();

    expect(
      titled.shadowRoot?.querySelector('.card-header')?.hasAttribute('data-empty')
    ).toBe(false);
    expect(
      slotted.shadowRoot
        ?.querySelector('.card-header')
        ?.hasAttribute('data-empty')
    ).toBe(false);
    expect(
      bare.shadowRoot?.querySelector('.card-header')?.hasAttribute('data-empty')
    ).toBe(true);
  });
});

describe('bq-switch structure', () => {
  beforeAll(async () => {
    await import('../src/components/switch/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  // The checked styling hangs entirely off `input:checked ~ .track`. Nesting
  // the track inside the input's parent instead of beside it made every
  // checked state silently do nothing — the switch rendered permanently off.
  it('keeps the track a following sibling of the input', async () => {
    const el = doc.createElement('bq-switch');
    el.setAttribute('checked', '');
    doc.body.appendChild(el);
    await waitForFrame();

    const input = el.shadowRoot?.querySelector('input');
    expect(input).not.toBeNull();
    const track = input?.nextElementSibling;
    expect(track?.classList.contains('track')).toBe(true);
    expect(track?.querySelector('.thumb')).not.toBeNull();
  });

  it('reflects checked onto the input the selector keys off', async () => {
    const el = doc.createElement('bq-switch');
    doc.body.appendChild(el);
    await waitForFrame();
    expect(
      (el.shadowRoot?.querySelector('input') as HTMLInputElement).checked
    ).toBe(false);

    el.setAttribute('checked', '');
    await waitForFrame();
    expect(
      (el.shadowRoot?.querySelector('input') as HTMLInputElement).checked
    ).toBe(true);
  });
});
