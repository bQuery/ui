// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import {
  formatDate,
  formatNumber,
  formatRelativeTime,
  parseDate,
  refreshDelay,
  resolveLocale,
  selectUnit,
} from '../src/utils/format.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatNumber', () => {
  it('formats plain decimals with grouping', () => {
    expect(formatNumber(1234567.891, { locale: 'en-US' })).toBe('1,234,567.891');
    expect(formatNumber(1234567, { locale: 'de-DE' })).toBe('1.234.567');
  });

  it('can disable grouping', () => {
    expect(formatNumber(1234567, { locale: 'en-US', grouping: false })).toBe('1234567');
  });

  it('formats currency, defaulting to USD', () => {
    expect(formatNumber(12.5, { type: 'currency', locale: 'en-US' })).toBe('$12.50');
    expect(
      formatNumber(12.5, { type: 'currency', currency: 'eur', locale: 'de-DE' }).replace(/\s/g, ' ')
    ).toBe('12,50 €');
  });

  it('formats percentages from fractions', () => {
    expect(formatNumber(0.256, { type: 'percent', locale: 'en-US' })).toBe('26%');
    expect(
      formatNumber(0.256, {
        type: 'percent',
        locale: 'en-US',
        minimumFractionDigits: 1,
      })
    ).toBe('25.6%');
  });

  it('formats compact notation', () => {
    expect(formatNumber(12_300, { notation: 'compact', locale: 'en-US' })).toBe('12K');
  });

  it('picks a byte unit automatically', () => {
    expect(formatNumber(512, { type: 'bytes', locale: 'en-US' })).toBe('512 byte');
    expect(formatNumber(1_500, { type: 'bytes', locale: 'en-US' })).toBe('1.5 kB');
    expect(formatNumber(3_200_000, { type: 'bytes', locale: 'en-US' })).toBe('3.2 MB');
    expect(formatNumber(2048, { type: 'bytes', binary: true, locale: 'en-US' })).toBe('2 kB');
  });

  it('formats arbitrary units', () => {
    expect(
      formatNumber(80, { type: 'unit', unit: 'kilometer-per-hour', locale: 'en-US' })
    ).toBe('80 km/h');
  });

  it('returns an empty string for non-finite input', () => {
    expect(formatNumber(Number.NaN)).toBe('');
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe('');
  });

  it('falls back instead of throwing on an invalid option', () => {
    expect(
      formatNumber(5, { type: 'currency', currency: 'not-a-currency', locale: 'en-US' })
    ).toBe('5');
    expect(
      formatNumber(5, { type: 'unit', unit: 'bananas', locale: 'en-US' })
    ).toBe('5');
  });

  it('keeps max fraction digits at or above the minimum', () => {
    expect(
      formatNumber(1.5, {
        locale: 'en-US',
        minimumFractionDigits: 3,
        maximumFractionDigits: 1,
      })
    ).toBe('1.500');
  });
});

describe('resolveLocale', () => {
  afterEach(() => doc.documentElement.removeAttribute('lang'));

  it('prefers the explicit locale, then the document language', () => {
    doc.documentElement.setAttribute('lang', 'fr-FR');
    expect(resolveLocale('de-DE')).toBe('de-DE');
    expect(resolveLocale('')).toBe('fr-FR');
    doc.documentElement.removeAttribute('lang');
    expect(resolveLocale('')).toBeUndefined();
  });
});

describe('parseDate / formatDate', () => {
  it('parses ISO strings, timestamps and Date objects', () => {
    expect(parseDate('2024-03-01T12:00:00Z')?.toISOString()).toBe('2024-03-01T12:00:00.000Z');
    expect(parseDate('0')?.getTime()).toBe(0);
    expect(parseDate(new Date(5))?.getTime()).toBe(5);
    expect(parseDate('not a date')).toBeNull();
  });

  it('treats an empty value as now', () => {
    const before = Date.now();
    const parsed = parseDate('');
    expect(parsed!.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('uses the medium date preset by default', () => {
    const date = new Date('2024-03-01T12:00:00Z');
    expect(formatDate(date, { locale: 'en-US', timeZone: 'UTC' })).toBe('Mar 1, 2024');
  });

  it('honours individual fields over presets', () => {
    const date = new Date('2024-03-01T12:00:00Z');
    expect(
      formatDate(date, {
        locale: 'en-US',
        timeZone: 'UTC',
        dateStyle: 'full',
        month: 'long',
        year: 'numeric',
      })
    ).toBe('March 2024');
  });

  it('supports a 24-hour clock', () => {
    const date = new Date('2024-03-01T15:05:00Z');
    expect(
      formatDate(date, {
        locale: 'en-US',
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hourFormat: '24',
      })
    ).toBe('15:05');
  });

  it('falls back on an invalid time zone', () => {
    const date = new Date('2024-03-01T12:00:00Z');
    expect(formatDate(date, { locale: 'en-US', timeZone: 'Mars/Olympus' })).toBe(
      'Mar 1, 2024'
    );
  });
});

describe('relative time helpers', () => {
  it('selects the largest fitting unit', () => {
    expect(selectUnit(-30_000)).toEqual({ value: -30, unit: 'second' });
    expect(selectUnit(-5 * MINUTE)).toEqual({ value: -5, unit: 'minute' });
    expect(selectUnit(3 * HOUR)).toEqual({ value: 3, unit: 'hour' });
    expect(selectUnit(-2 * DAY)).toEqual({ value: -2, unit: 'day' });
    expect(selectUnit(0)).toEqual({ value: 0, unit: 'second' });
  });

  it('honours a forced unit', () => {
    expect(selectUnit(-2 * DAY, 'hour')).toEqual({ value: -48, unit: 'hour' });
  });

  it('formats past and future instants', () => {
    const now = Date.UTC(2024, 0, 10);
    expect(formatRelativeTime(new Date(now - 5 * MINUTE), now, { locale: 'en' })).toBe(
      '5 minutes ago'
    );
    expect(formatRelativeTime(new Date(now + 2 * DAY), now, { locale: 'en' })).toBe(
      'in 2 days'
    );
    expect(formatRelativeTime(new Date(now - DAY), now, { locale: 'en' })).toBe('yesterday');
    expect(
      formatRelativeTime(new Date(now - DAY), now, { locale: 'en', numeric: 'always' })
    ).toBe('1 day ago');
    expect(
      formatRelativeTime(new Date(now - 3 * HOUR), now, { locale: 'de' })
    ).toBe('vor 3 Stunden');
  });

  it('refreshes more often the closer the instant is', () => {
    expect(refreshDelay(10_000)).toBe(1000);
    expect(refreshDelay(10 * MINUTE)).toBe(30_000);
    expect(refreshDelay(5 * HOUR)).toBe(15 * MINUTE);
    expect(refreshDelay(5 * DAY)).toBe(HOUR);
  });
});

describe('bq-format-number / bq-format-date / bq-relative-time', () => {
  beforeAll(async () => {
    await import('../src/components/format-number/index.js');
    await import('../src/components/format-date/index.js');
    await import('../src/components/relative-time/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (tag: string, attrs: Record<string, string>, text = '') => {
    const el = doc.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.textContent = text;
    doc.body.appendChild(el);
    return el;
  };

  it('registers all three elements', () => {
    expect(win.customElements.get('bq-format-number')).toBeDefined();
    expect(win.customElements.get('bq-format-date')).toBeDefined();
    expect(win.customElements.get('bq-relative-time')).toBeDefined();
  });

  it('renders a formatted number and re-renders on change', async () => {
    const el = create('bq-format-number', {
      value: '1234.5',
      type: 'currency',
      currency: 'EUR',
      locale: 'en-US',
    });
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('[part="base"]')?.textContent).toBe('€1,234.50');

    el.setAttribute('value', '99');
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('[part="base"]')?.textContent).toBe('€99.00');
  });

  it('shows the fallback slot for a non-numeric value', async () => {
    const el = create('bq-format-number', { value: 'abc' }, '—');
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('slot')).not.toBeNull();
  });

  it('renders a <time> element with a machine-readable datetime', async () => {
    const el = create('bq-format-date', {
      date: '2024-03-01T12:00:00Z',
      locale: 'en-US',
      'time-zone': 'UTC',
      'date-style': 'long',
    });
    await waitForFrame();
    const time = el.shadowRoot?.querySelector('time');
    expect(time?.getAttribute('datetime')).toBe('2024-03-01T12:00:00.000Z');
    expect(time?.textContent).toBe('March 1, 2024');
  });

  it('renders relative text with the absolute date as a title', async () => {
    const el = create('bq-relative-time', {
      date: new Date(Date.now() - 3 * HOUR).toISOString(),
      locale: 'en',
    });
    await waitForFrame();
    const time = el.shadowRoot?.querySelector('time');
    expect(time?.textContent).toBe('3 hours ago');
    expect(time?.getAttribute('title')).toBeTruthy();
    expect(time?.getAttribute('datetime')).toMatch(/Z$/);
  });

  it('refreshes itself with sync and stops once disconnected', async () => {
    const el = create('bq-relative-time', {
      date: new Date(Date.now() - 59_300).toISOString(),
      locale: 'en',
      sync: '',
      numeric: 'always',
    });
    await waitForFrame();
    const text = () => el.shadowRoot?.querySelector('time')?.textContent;
    expect(text()).toBe('59 seconds ago');

    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(text()).toBe('1 minute ago');

    el.remove();
    // No timer may keep re-rendering a detached element.
    const before = text();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    expect(text()).toBe(before);
  });
});
