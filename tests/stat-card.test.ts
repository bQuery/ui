import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqStatCard', () => {
  beforeAll(async () => {
    await import('../src/components/stat-card/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('should define bq-stat-card as a custom element', () => {
    expect(win.customElements.get('bq-stat-card')).toBeDefined();
  });

  it('should expose only the stat card wrapper export from the entrypoint', async () => {
    const componentModuleUrl = new URL('../src/components/stat-card/BqStatCard.ts', import.meta.url);
    const entrypointModule = await import('../src/components/stat-card/index.js');

    expect(existsSync(componentModuleUrl)).toBe(true);
    expect(Object.keys(entrypointModule)).toEqual(['__bqComponentEntry']);
  });

  it('should render label, value, change, and hint content', () => {
    const el = doc.createElement('bq-stat-card');
    el.setAttribute('label', 'Monthly revenue');
    el.setAttribute('value', '$128k');
    el.setAttribute('change', '+12.4%');
    el.setAttribute('hint', 'Compared with the previous 30 days.');
    el.setAttribute('trend', 'up');
    doc.body.appendChild(el);

    const label = el.shadowRoot?.querySelector('[part="label"]');
    const value = el.shadowRoot?.querySelector('[part="value"]');
    const change = el.shadowRoot?.querySelector('[part="change"]');
    const hint = el.shadowRoot?.querySelector('[part="hint"]');

    expect(label?.textContent).toBe('Monthly revenue');
    expect(value?.textContent).toBe('$128k');
    expect(change?.textContent).toBe('+12.4%');
    expect(change?.getAttribute('data-trend')).toBe('up');
    expect(hint?.textContent).toBe('Compared with the previous 30 days.');
  });

  it('should generate unique accessible ids per instance', () => {
    const first = doc.createElement('bq-stat-card');
    first.setAttribute('label', 'Monthly revenue');
    first.setAttribute('hint', 'Compared with the previous 30 days.');
    const second = doc.createElement('bq-stat-card');
    second.setAttribute('label', 'Incident resolution');
    second.setAttribute('hint', 'SLA within the current quarter.');

    doc.body.append(first, second);

    const firstCard = first.shadowRoot?.querySelector('[part="card"]');
    const secondCard = second.shadowRoot?.querySelector('[part="card"]');
    const firstLabel = first.shadowRoot?.querySelector('[part="label"]');
    const secondLabel = second.shadowRoot?.querySelector('[part="label"]');
    const firstHint = first.shadowRoot?.querySelector('[part="hint"]');
    const secondHint = second.shadowRoot?.querySelector('[part="hint"]');

    expect(firstLabel?.id).not.toBe(secondLabel?.id);
    expect(firstHint?.id).not.toBe(secondHint?.id);
    expect(firstCard?.getAttribute('aria-labelledby')).toBe(firstLabel?.id);
    expect(secondCard?.getAttribute('aria-labelledby')).toBe(secondLabel?.id);
    expect(firstCard?.getAttribute('aria-describedby')).toBe(firstHint?.id);
    expect(secondCard?.getAttribute('aria-describedby')).toBe(secondHint?.id);
  });

  it('should normalize invalid size and trend values', () => {
    const el = doc.createElement('bq-stat-card');
    el.setAttribute('size', 'xl');
    el.setAttribute('trend', 'warning');
    doc.body.appendChild(el);

    const card = el.shadowRoot?.querySelector('[part="card"]');
    const changeEl = doc.createElement('bq-stat-card');
    changeEl.setAttribute('change', '-4.2%');
    changeEl.setAttribute('trend', 'warning');
    doc.body.appendChild(changeEl);

    expect(card?.getAttribute('data-size')).toBe('md');
    expect(changeEl.shadowRoot?.querySelector('[part="change"]')?.getAttribute('data-trend')).toBe('neutral');
  });

  it('should support compact sizing', () => {
    const el = doc.createElement('bq-stat-card');
    el.setAttribute('size', 'sm');
    doc.body.appendChild(el);

    const card = el.shadowRoot?.querySelector('[part="card"]');
    expect(card?.getAttribute('data-size')).toBe('sm');
  });

  it('should expose a loading state for assistive technology', () => {
    const el = doc.createElement('bq-stat-card');
    el.setAttribute('label', 'Active users');
    el.setAttribute('hint', 'This hint should not be referenced while loading.');
    el.setAttribute('loading', '');
    doc.body.appendChild(el);

    const card = el.shadowRoot?.querySelector('[part="card"]');
    const loading = el.shadowRoot?.querySelector('[part="loading"]');
    const status = el.shadowRoot?.querySelector('[role="status"]');
    const hint = el.shadowRoot?.querySelector('[part="hint"]');

    expect(card?.getAttribute('aria-busy')).toBe('true');
    expect(loading).not.toBeNull();
    expect(status?.textContent).toBe('Loading');
    expect(status?.getAttribute('aria-live')).toBe('polite');
    expect(card?.getAttribute('aria-describedby')).toBe(status?.id);
    expect(hint).toBeNull();
  });
});
