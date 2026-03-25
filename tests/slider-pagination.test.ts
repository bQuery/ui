import { beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqSlider', () => {
  beforeAll(async () => {
    await import('../src/components/slider/index.js');
  });

  it('should define bq-slider as a custom element', () => {
    expect(win.customElements.get('bq-slider')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-slider');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render a range input', () => {
    const el = doc.createElement('bq-slider');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input[type="range"]');
    expect(input).not.toBeNull();
  });

  it('should apply min/max/step/value attributes', () => {
    const el = doc.createElement('bq-slider');
    el.setAttribute('min', '0');
    el.setAttribute('max', '200');
    el.setAttribute('step', '5');
    el.setAttribute('value', '75');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input?.getAttribute('min')).toBe('0');
    expect(input?.getAttribute('max')).toBe('200');
    expect(input?.getAttribute('step')).toBe('5');
    expect(input?.getAttribute('value')).toBe('75');
  });

  it('should render label when set', () => {
    const el = doc.createElement('bq-slider');
    el.setAttribute('label', 'Volume');
    doc.body.appendChild(el);
    const label = el.shadowRoot?.querySelector('.label-text');
    expect(label?.textContent).toBe('Volume');
  });

  it('should show value display when show-value is set', () => {
    const el = doc.createElement('bq-slider');
    el.setAttribute('show-value', '');
    el.setAttribute('value', '42');
    doc.body.appendChild(el);
    const valueEl = el.shadowRoot?.querySelector('.value');
    expect(valueEl).not.toBeNull();
    expect(valueEl?.textContent).toBe('42');
  });

  it('should have proper ARIA attributes', () => {
    const el = doc.createElement('bq-slider');
    el.setAttribute('min', '10');
    el.setAttribute('max', '90');
    el.setAttribute('value', '50');
    doc.body.appendChild(el);
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input?.getAttribute('aria-valuemin')).toBe('10');
    expect(input?.getAttribute('aria-valuemax')).toBe('90');
    expect(input?.getAttribute('aria-valuenow')).toBe('50');
    expect(input?.getAttribute('aria-valuetext')).toBe('Value: 50');
  });

  it('should update live value and ARIA state during input without re-rendering', () => {
    const el = doc.createElement('bq-slider');
    el.setAttribute('show-value', '');
    el.setAttribute('value', '40');
    doc.body.appendChild(el);

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    const valueEl = el.shadowRoot?.querySelector('.value');

    input.value = '65';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    expect(el.getAttribute('value')).toBe('40');
    expect(valueEl?.textContent).toBe('65');
    expect(input.getAttribute('aria-valuenow')).toBe('65');
    expect(input.getAttribute('aria-valuetext')).toBe('Value: 65');
  });

  it('should create form proxy hidden input', () => {
    const el = doc.createElement('bq-slider');
    el.setAttribute('name', 'volume');
    el.setAttribute('value', '75');
    doc.body.appendChild(el);
    const proxy = el.nextElementSibling as HTMLInputElement | null;
    expect(proxy?.type).toBe('hidden');
    expect(proxy?.name).toBe('volume');
    expect(proxy?.value).toBe('75');
  });
});

describe('BqPagination', () => {
  beforeAll(async () => {
    await import('../src/components/pagination/index.js');
  });

  it('should define bq-pagination as a custom element', () => {
    expect(win.customElements.get('bq-pagination')).toBeDefined();
  });

  it('should create element with shadow root', () => {
    const el = doc.createElement('bq-pagination');
    doc.body.appendChild(el);
    expect(el.shadowRoot).not.toBeNull();
  });

  it('should render nav element with aria-label', () => {
    const el = doc.createElement('bq-pagination');
    doc.body.appendChild(el);
    const nav = el.shadowRoot?.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.getAttribute('aria-label')).toBeTruthy();
  });

  it('should render page buttons', () => {
    const el = doc.createElement('bq-pagination');
    el.setAttribute('total', '5');
    el.setAttribute('page', '1');
    doc.body.appendChild(el);
    const buttons = el.shadowRoot?.querySelectorAll('.page-btn');
    // 5 page buttons + 2 navigation (prev, next)
    expect(buttons?.length).toBeGreaterThanOrEqual(7);
  });

  it('should mark current page with aria-current', () => {
    const el = doc.createElement('bq-pagination');
    el.setAttribute('total', '5');
    el.setAttribute('page', '3');
    doc.body.appendChild(el);
    const current = el.shadowRoot?.querySelector('[aria-current="page"]');
    expect(current).not.toBeNull();
    expect(current?.textContent?.trim()).toBe('3');
  });

  it('should disable prev button on first page', () => {
    const el = doc.createElement('bq-pagination');
    el.setAttribute('total', '5');
    el.setAttribute('page', '1');
    doc.body.appendChild(el);
    const buttons = el.shadowRoot?.querySelectorAll('.page-btn');
    const prevBtn = buttons?.[0];
    expect(prevBtn?.hasAttribute('disabled')).toBe(true);
  });

  it('should disable next button on last page', () => {
    const el = doc.createElement('bq-pagination');
    el.setAttribute('total', '5');
    el.setAttribute('page', '5');
    doc.body.appendChild(el);
    const buttons = el.shadowRoot?.querySelectorAll('.page-btn');
    const nextBtn = buttons?.[buttons.length - 1];
    expect(nextBtn?.hasAttribute('disabled')).toBe(true);
  });

  it('should fire bq-page-change on page button click', () => {
    const el = doc.createElement('bq-pagination');
    el.setAttribute('total', '5');
    el.setAttribute('page', '1');
    doc.body.appendChild(el);
    let firedPage = 0;
    el.addEventListener('bq-page-change', ((e: CustomEvent) => {
      firedPage = e.detail.page;
    }) as EventListener);
    const page2 = el.shadowRoot?.querySelector(
      '[data-page="2"]'
    ) as HTMLElement;
    page2?.click();
    expect(firedPage).toBe(2);
  });

  it('should hide pagination ellipses from assistive technology', () => {
    const el = doc.createElement('bq-pagination');
    el.setAttribute('total', '12');
    el.setAttribute('page', '6');
    doc.body.appendChild(el);

    const ellipsis = el.shadowRoot?.querySelector('.ellipsis');
    expect(ellipsis?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should clamp out-of-range page values when rendering controls', () => {
    const el = doc.createElement('bq-pagination');
    el.setAttribute('total', '5');
    el.setAttribute('page', '99');
    doc.body.appendChild(el);

    const current = el.shadowRoot?.querySelector('[aria-current="page"]');
    const prevButton = el.shadowRoot?.querySelector(
      '.page-btn[data-page="4"]'
    ) as HTMLButtonElement | null;
    const nextButton = el.shadowRoot?.querySelector(
      '.page-btn[aria-label]'
    )?.parentElement?.querySelector('.page-btn:last-child') as
      | HTMLButtonElement
      | null;

    expect(current?.textContent?.trim()).toBe('5');
    expect(prevButton).toBeTruthy();
    expect(nextButton?.getAttribute('data-page')).toBe('6');
    expect(nextButton?.hasAttribute('disabled')).toBe(true);
  });
});
