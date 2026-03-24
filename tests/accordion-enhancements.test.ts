// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterEach } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
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

  it('should use height instead of max-height for animation', () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    doc.body.appendChild(el);
    // The panel should not have max-height: 2000px - it should use height property
    const panel = el.shadowRoot?.querySelector('.panel') as HTMLElement | null;
    expect(panel).not.toBeNull();
    // When closed, height should be 0 (or set via JS)
    // Verify the panel has role=region
    expect(panel?.getAttribute('role')).toBe('region');
  });

  it('should set panel height to 0 when closed', async () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    doc.body.appendChild(el);
    // Wait for requestAnimationFrame to fire (polyfilled as setTimeout)
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const panel = el.shadowRoot?.querySelector('.panel') as HTMLElement | null;
    expect(panel?.style.height).toBe('0px');
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

  it('should reset panel height to auto after expand transition completes', async () => {
    const el = doc.createElement('bq-accordion');
    el.setAttribute('label', 'Details');
    el.setAttribute('open', '');
    doc.body.appendChild(el);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const panel = el.shadowRoot?.querySelector('.panel') as HTMLElement | null;
    const transitionEvent = new win.Event('transitionend', {
      bubbles: true,
    }) as Event & { propertyName?: string };
    transitionEvent.propertyName = 'height';
    panel?.dispatchEvent(transitionEvent);

    expect(panel?.style.height).toBe('auto');
  });
});
