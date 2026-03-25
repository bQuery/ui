import { afterEach, beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqProgress', () => {
  beforeAll(async () => {
    await import('../src/components/progress/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('should use a localized default aria-label for determinate progress', () => {
    const el = doc.createElement('bq-progress');
    doc.body.appendChild(el);

    const track = el.shadowRoot?.querySelector('.track');
    expect(track?.getAttribute('aria-label')).toBe('Progress');
    expect(track?.getAttribute('aria-valuetext')).toBe('0%');
  });

  it('should expose busy semantics for indeterminate progress', () => {
    const el = doc.createElement('bq-progress');
    el.setAttribute('indeterminate', '');
    doc.body.appendChild(el);

    const track = el.shadowRoot?.querySelector('.track');
    expect(track?.getAttribute('aria-busy')).toBe('true');
    expect(track?.hasAttribute('aria-valuenow')).toBe(false);
    expect(track?.getAttribute('aria-valuetext')).toBe('Loading');
  });

  it('should clamp invalid max values to a safe fallback', () => {
    const el = doc.createElement('bq-progress');
    el.setAttribute('value', '50');
    el.setAttribute('max', '0');
    doc.body.appendChild(el);

    const track = el.shadowRoot?.querySelector('.track');
    const bar = el.shadowRoot?.querySelector('.bar');
    expect(track?.getAttribute('aria-valuemax')).toBe('100');
    expect(track?.getAttribute('aria-valuenow')).toBe('50');
    expect(bar?.getAttribute('data-value')).toBe('50');
  });
});
