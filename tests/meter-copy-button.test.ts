// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { meterLevel } from '../src/components/meter/BqMeter.js';
import { writeClipboard } from '../src/components/copy-button/BqCopyButton.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('meterLevel', () => {
  // Disk usage: low is good.
  it('treats the low band as optimum when the optimum sits below it', () => {
    expect(meterLevel(10, 0, 100, 40, 80, 0)).toBe('optimum');
    expect(meterLevel(60, 0, 100, 40, 80, 0)).toBe('suboptimum');
    expect(meterLevel(95, 0, 100, 40, 80, 0)).toBe('poor');
  });

  // Battery charge: high is good.
  it('treats the high band as optimum when the optimum sits above it', () => {
    expect(meterLevel(95, 0, 100, 20, 80, 100)).toBe('optimum');
    expect(meterLevel(50, 0, 100, 20, 80, 100)).toBe('suboptimum');
    expect(meterLevel(10, 0, 100, 20, 80, 100)).toBe('poor');
  });

  // A reading that should stay in the middle, like a pH or a temperature.
  it('treats the middle band as optimum when the optimum sits inside it', () => {
    expect(meterLevel(50, 0, 100, 30, 70, 50)).toBe('optimum');
    expect(meterLevel(10, 0, 100, 30, 70, 50)).toBe('suboptimum');
    expect(meterLevel(90, 0, 100, 30, 70, 50)).toBe('suboptimum');
  });
});

describe('bq-meter', () => {
  beforeAll(async () => {
    await import('../src/components/meter/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (attrs: Record<string, string> = {}): HTMLElement => {
    const el = doc.createElement('bq-meter');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    doc.body.appendChild(el);
    return el;
  };

  it('registers as a custom element', () => {
    expect(win.customElements.get('bq-meter')).toBeDefined();
  });

  it('exposes the meter role and its bounds', async () => {
    const el = create({ value: '40', min: '0', max: '200', label: 'Disk' });
    await waitForFrame();
    const meter = el.shadowRoot?.querySelector('[role="meter"]');
    expect(meter?.getAttribute('aria-valuenow')).toBe('40');
    expect(meter?.getAttribute('aria-valuemin')).toBe('0');
    expect(meter?.getAttribute('aria-valuemax')).toBe('200');
    expect(meter?.getAttribute('aria-label')).toBe('Disk');
  });

  // The width is an inline style, which the sanitizer drops unless the
  // component opts in — so this asserts the opt-in as much as the maths.
  it('fills the bar to the right proportion', async () => {
    const el = create({ value: '25', max: '200' });
    await waitForFrame();
    expect(
      el.shadowRoot?.querySelector('.bar')?.getAttribute('style')
    ).toContain('12.5%');
  });

  it('clamps a value outside the range', async () => {
    const el = create({ value: '500', max: '100' });
    await waitForFrame();
    expect(
      el.shadowRoot?.querySelector('[role="meter"]')?.getAttribute('aria-valuenow')
    ).toBe('100');
  });

  it('stays uncoloured until bands are given', async () => {
    const el = create({ value: '90' });
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('.bar')?.hasAttribute('data-level')).toBe(
      false
    );
  });

  it('grades the bar once bands are given', async () => {
    const el = create({ value: '90', low: '40', high: '80', optimum: '0' });
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('.bar')?.getAttribute('data-level')).toBe(
      'poor'
    );
  });

  it('shows the reading only when asked', async () => {
    const el = create({ value: '40', label: 'Disk' });
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('.value')).toBeNull();

    el.setAttribute('show-value', '');
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('.value')?.textContent?.trim()).toBe(
      '40 / 100'
    );
  });

  it('prefers an explicit value-text', async () => {
    const el = create({ value: '40', 'value-text': '40 GB of 100 GB', 'show-value': '' });
    await waitForFrame();
    expect(
      el.shadowRoot?.querySelector('[role="meter"]')?.getAttribute('aria-valuetext')
    ).toBe('40 GB of 100 GB');
  });
});

describe('writeClipboard', () => {
  it('refuses to copy an empty string', async () => {
    expect(await writeClipboard('')).toBe(false);
  });

  it('uses the async clipboard API when it is available', async () => {
    const nav = globalThis.navigator as unknown as Record<string, unknown>;
    const original = nav['clipboard'];
    let written = '';
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: {
        writeText: (text: string) => {
          written = text;
          return Promise.resolve();
        },
      },
      configurable: true,
    });
    try {
      expect(await writeClipboard('hello')).toBe(true);
      expect(written).toBe('hello');
    } finally {
      if (original === undefined) {
        delete (globalThis.navigator as unknown as Record<string, unknown>)[
          'clipboard'
        ];
      } else {
        Object.defineProperty(globalThis.navigator, 'clipboard', {
          value: original,
          configurable: true,
        });
      }
    }
  });
});

describe('bq-copy-button', () => {
  beforeAll(async () => {
    await import('../src/components/copy-button/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('registers as a custom element', () => {
    expect(win.customElements.get('bq-copy-button')).toBeDefined();
  });

  it('starts in the idle state with the copy glyph', async () => {
    const el = doc.createElement('bq-copy-button');
    el.setAttribute('value', 'npm i @bquery/ui');
    doc.body.appendChild(el);
    await waitForFrame();

    const button = el.shadowRoot?.querySelector('.btn');
    expect(button?.getAttribute('data-copied')).toBe('false');
    expect(
      el.shadowRoot?.querySelector('.icon')?.getAttribute('data-icon')
    ).toBe('copy');
  });

  it('confirms after a successful copy and reports what was copied', async () => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: () => Promise.resolve() },
      configurable: true,
    });

    const el = doc.createElement('bq-copy-button');
    el.setAttribute('value', 'npm i @bquery/ui');
    doc.body.appendChild(el);
    await waitForFrame();

    let detail: { value: string; ok: boolean } | null = null;
    el.addEventListener('bq-copy', (e) => {
      detail = (e as CustomEvent<{ value: string; ok: boolean }>).detail;
    });

    el.shadowRoot
      ?.querySelector('.btn')
      ?.dispatchEvent(new win.Event('click', { bubbles: true, composed: true }));
    await waitForFrame(2);

    expect(detail).not.toBeNull();
    expect((detail as unknown as { value: string }).value).toBe(
      'npm i @bquery/ui'
    );
    expect(
      el.shadowRoot?.querySelector('.btn')?.getAttribute('data-copied')
    ).toBe('true');
    expect(
      el.shadowRoot?.querySelector('.icon')?.getAttribute('data-icon')
    ).toBe('check');
  });

  it('reads the text from another element when given a selector', async () => {
    const source = doc.createElement('pre');
    source.id = 'snippet';
    source.textContent = 'bun add @bquery/ui';
    doc.body.appendChild(source);

    let copied = '';
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: {
        writeText: (text: string) => {
          copied = text;
          return Promise.resolve();
        },
      },
      configurable: true,
    });

    const el = doc.createElement('bq-copy-button');
    el.setAttribute('from', '#snippet');
    doc.body.appendChild(el);
    await waitForFrame();

    el.shadowRoot
      ?.querySelector('.btn')
      ?.dispatchEvent(new win.Event('click', { bubbles: true, composed: true }));
    await waitForFrame(2);

    expect(copied).toBe('bun add @bquery/ui');
  });

  it('does nothing while disabled', async () => {
    let calls = 0;
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: {
        writeText: () => {
          calls += 1;
          return Promise.resolve();
        },
      },
      configurable: true,
    });

    const el = doc.createElement('bq-copy-button');
    el.setAttribute('value', 'x');
    el.setAttribute('disabled', '');
    doc.body.appendChild(el);
    await waitForFrame();

    el.shadowRoot
      ?.querySelector('.btn')
      ?.dispatchEvent(new win.Event('click', { bubbles: true, composed: true }));
    await waitForFrame(2);

    expect(calls).toBe(0);
  });
});
