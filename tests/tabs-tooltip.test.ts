import { beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqTabs', () => {
  beforeAll(async () => {
    await import('../src/components/tabs/index.js');
  });

  it('should define bq-tabs as a custom element', () => {
    expect(win.customElements.get('bq-tabs')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-tabs');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render tablist role', () => {
    const el = doc.createElement('bq-tabs');
    doc.body.appendChild(el);
    const tablist = el.shadowRoot?.querySelector('[role="tablist"]');
    expect(tablist).not.toBeNull();
  });

  it('should render tab buttons from child data-tab-item elements', () => {
    const el = doc.createElement('bq-tabs');
    el.innerHTML = `
      <div data-tab-item id="one" label="First"></div>
      <div data-tab-item id="two" label="Second"></div>
    `;
    doc.body.appendChild(el);
    // Allow MutationObserver to fire
    const tabs = el.shadowRoot?.querySelectorAll('[role="tab"]');
    expect(tabs?.length).toBe(2);
  });

  it('should mark active tab with aria-selected=true', () => {
    const el = doc.createElement('bq-tabs');
    el.setAttribute('active-tab', 'two');
    el.innerHTML = `
      <div data-tab-item id="one" label="First"></div>
      <div data-tab-item id="two" label="Second"></div>
    `;
    doc.body.appendChild(el);
    const active = el.shadowRoot?.querySelector('[aria-selected="true"]');
    expect(active?.getAttribute('data-tab-id')).toBe('two');
  });

  it('should apply variant to tab buttons', () => {
    const el = doc.createElement('bq-tabs');
    el.setAttribute('variant', 'pills');
    el.innerHTML = `
      <div data-tab-item id="a" label="A"></div>
    `;
    doc.body.appendChild(el);
    const tab = el.shadowRoot?.querySelector('.tab');
    expect(tab?.getAttribute('data-variant')).toBe('pills');
  });

  it('should fire bq-tab-change event on tab click', () => {
    const el = doc.createElement('bq-tabs');
    el.innerHTML = `
      <div data-tab-item id="t1" label="Tab One"></div>
      <div data-tab-item id="t2" label="Tab Two"></div>
    `;
    doc.body.appendChild(el);
    let firedTabId = '';
    el.addEventListener('bq-tab-change', ((e: CustomEvent) => {
      firedTabId = e.detail.tabId;
    }) as EventListener);
    const tab2 = el.shadowRoot?.querySelector(
      '[data-tab-id="t2"]'
    ) as HTMLElement;
    tab2?.click();
    expect(firedTabId).toBe('t2');
  });

  it('should set non-active tabs to tabindex=-1', () => {
    const el = doc.createElement('bq-tabs');
    el.setAttribute('active-tab', 'x');
    el.innerHTML = `
      <div data-tab-item id="x" label="X"></div>
      <div data-tab-item id="y" label="Y"></div>
    `;
    doc.body.appendChild(el);
    const inactive = el.shadowRoot?.querySelector('[data-tab-id="y"]');
    expect(inactive?.getAttribute('tabindex')).toBe('-1');
  });
});

describe('BqTooltip', () => {
  beforeAll(async () => {
    await import('../src/components/tooltip/index.js');
  });

  it('should define bq-tooltip as a custom element', () => {
    expect(win.customElements.get('bq-tooltip')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-tooltip');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render role=tooltip', () => {
    const el = doc.createElement('bq-tooltip');
    el.setAttribute('content', 'Hint');
    doc.body.appendChild(el);
    const tip = el.shadowRoot?.querySelector('[role="tooltip"]');
    expect(tip).not.toBeNull();
  });

  it('should render content text', () => {
    const el = doc.createElement('bq-tooltip');
    el.setAttribute('content', 'Hello tip');
    doc.body.appendChild(el);
    const tip = el.shadowRoot?.querySelector('.tip');
    expect(tip?.textContent?.trim()).toBe('Hello tip');
  });

  it('should default to placement=top', () => {
    const el = doc.createElement('bq-tooltip');
    el.setAttribute('content', 'Test');
    doc.body.appendChild(el);
    const tip = el.shadowRoot?.querySelector('.tip');
    expect(tip?.getAttribute('data-placement')).toBe('top');
  });

  it('should respect placement prop', () => {
    const el = doc.createElement('bq-tooltip');
    el.setAttribute('content', 'Test');
    el.setAttribute('placement', 'bottom');
    doc.body.appendChild(el);
    const tip = el.shadowRoot?.querySelector('.tip');
    expect(tip?.getAttribute('data-placement')).toBe('bottom');
  });

  it('should be hidden by default', () => {
    const el = doc.createElement('bq-tooltip');
    el.setAttribute('content', 'Hidden');
    doc.body.appendChild(el);
    const tip = el.shadowRoot?.querySelector('.tip');
    expect(tip?.getAttribute('data-visible')).toBe('false');
  });
});
