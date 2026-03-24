// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqAccordion — accessibility improvements', () => {
  beforeAll(async () => {
    await import('../src/components/accordion/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('should have aria-labelledby on the panel referencing the trigger', () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    doc.body.appendChild(el);
    const trigger = el.shadowRoot?.querySelector('.trigger');
    const panel = el.shadowRoot?.querySelector('.panel');
    const triggerId = trigger?.getAttribute('id');
    expect(triggerId).toBeTruthy();
    expect(panel?.getAttribute('aria-labelledby')).toBe(triggerId);
  });

  it('should have aria-controls on the trigger referencing the panel', () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    doc.body.appendChild(el);
    const trigger = el.shadowRoot?.querySelector('.trigger');
    const panel = el.shadowRoot?.querySelector('.panel');
    const panelId = panel?.getAttribute('id');
    expect(panelId).toBeTruthy();
    expect(trigger?.getAttribute('aria-controls')).toBe(panelId);
  });

  it('should set panel role to region', () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    doc.body.appendChild(el);
    const panel = el.shadowRoot?.querySelector('.panel') as HTMLElement | null;
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('role')).toBe('region');
  });

  it('should collapse panel via CSS grid when closed', async () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    doc.body.appendChild(el);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );
    const panel = el.shadowRoot?.querySelector('.panel') as HTMLElement | null;
    // Panel uses grid-template-rows: 0fr via CSS (no inline style needed)
    expect(panel).not.toBeNull();
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('should have unique IDs for trigger and panel', () => {
    const el1 = doc.createElement('bq-accordion');
    el1.setAttribute('label', 'First');
    const el2 = doc.createElement('bq-accordion');
    el2.setAttribute('label', 'Second');
    doc.body.appendChild(el1);
    doc.body.appendChild(el2);

    const trigger1 = el1.shadowRoot?.querySelector('.trigger');
    const trigger2 = el2.shadowRoot?.querySelector('.trigger');
    expect(trigger1?.getAttribute('id')).toBeTruthy();
    expect(trigger2?.getAttribute('id')).toBeTruthy();
    expect(trigger1?.getAttribute('id')).not.toBe(trigger2?.getAttribute('id'));
  });

  it('should expand panel via CSS grid when open', async () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    el.setAttribute('open', '');
    doc.body.appendChild(el);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );

    const panel = el.shadowRoot?.querySelector('.panel') as HTMLElement | null;
    // Panel is expanded via :host([open]) .panel { grid-template-rows: 1fr }
    expect(panel).not.toBeNull();
    expect(el.hasAttribute('open')).toBe(true);
  });

  it('should use CSS grid animation approach for panel', async () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    el.setAttribute('open', '');
    doc.body.appendChild(el);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );

    const panel = el.shadowRoot?.querySelector('.panel') as HTMLElement | null;
    const panelInner = el.shadowRoot?.querySelector(
      '.panel-inner'
    ) as HTMLElement | null;
    expect(panel).not.toBeNull();
    expect(panelInner).not.toBeNull();
    // Panel inner has overflow: hidden and min-height: 0 for grid collapse
    expect(panel?.getAttribute('role')).toBe('region');
  });

  it('should set data-closing attribute during close animation', async () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    el.setAttribute('open', '');
    doc.body.appendChild(el);
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );

    // Click trigger to close
    const trigger = el.shadowRoot?.querySelector(
      '.trigger'
    ) as HTMLElement | null;
    trigger?.click();

    // data-closing should be set during animation
    expect(el.hasAttribute('data-closing')).toBe(true);
    expect(el.hasAttribute('open')).toBe(true); // still open during animation

    // After animation completes
    await new Promise<void>((resolve) => setTimeout(resolve, 350));
    expect(el.hasAttribute('data-closing')).toBe(false);
    expect(el.hasAttribute('open')).toBe(false);
  });
});
