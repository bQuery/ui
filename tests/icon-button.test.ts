// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqIconButton', () => {
  beforeAll(async () => {
    await import('../src/components/icon-button/index.js');
  });

  it('should render a button element inside shadow root', () => {
    const el = doc.createElement('bq-icon-button');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn).not.toBeNull();
  });

  it('should apply the label attribute as the accessible name', () => {
    const el = doc.createElement('bq-icon-button');
    el.setAttribute('label', 'Open menu');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn?.getAttribute('aria-label')).toBe('Open menu');
  });

  it('should fall back to title for the accessible name when label is missing', () => {
    const el = doc.createElement('bq-icon-button');
    el.setAttribute('title', 'Refresh data');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn?.getAttribute('title')).toBe('Refresh data');
    expect(btn?.getAttribute('aria-label')).toBe('Refresh data');
  });

  it('should trim title before reflecting it as a tooltip fallback', () => {
    const el = doc.createElement('bq-icon-button');
    el.setAttribute('title', '  Refresh data  ');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn?.getAttribute('title')).toBe('Refresh data');
    expect(btn?.getAttribute('aria-label')).toBe('Refresh data');
  });

  it('should fall back to a localized default accessible name when no label is provided', () => {
    const el = doc.createElement('bq-icon-button');
    doc.body.appendChild(el);
    const btn = el.shadowRoot?.querySelector('button');
    expect(btn?.getAttribute('aria-label')).toBe('Icon button');
  });

  it('should not emit button-only attributes on anchor rendering', () => {
    const el = doc.createElement('bq-icon-button');
    el.setAttribute('href', 'https://example.com');
    el.setAttribute('loading', '');
    doc.body.appendChild(el);
    const anchor = el.shadowRoot?.querySelector('a');
    const status = el.shadowRoot?.querySelector('[role="status"]');
    expect(anchor?.hasAttribute('type')).toBe(false);
    expect(anchor?.hasAttribute('disabled')).toBe(false);
    expect(anchor?.getAttribute('aria-disabled')).toBe('true');
    expect(anchor?.getAttribute('tabindex')).toBe('-1');
    expect(anchor?.getAttribute('aria-describedby')).toBe(status?.id);
  });

  it('should prevent hover selectors from matching aria-disabled links', () => {
    const el = doc.createElement('bq-icon-button');
    doc.body.appendChild(el);
    const styles = el.shadowRoot?.querySelector('style')?.textContent ?? '';
    expect(styles).toContain(':hover:not(:disabled):not([aria-disabled="true"])');
  });

  afterAll(() => {
    doc.body.innerHTML = '';
  });
});
