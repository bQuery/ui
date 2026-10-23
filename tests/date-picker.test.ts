// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import {
  addDays,
  addMonths,
  buildMonthGrid,
  clampDate,
  formatISODate,
  isSameDay,
  parseISODate,
  weekdayNames,
} from '../src/components/date-picker/BqDatePicker.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('parseISODate', () => {
  it('reads a well-formed date as UTC', () => {
    const date = parseISODate('2026-03-15');
    expect(date?.getUTCFullYear()).toBe(2026);
    expect(date?.getUTCMonth()).toBe(2);
    expect(date?.getUTCDate()).toBe(15);
  });

  it('rejects anything that is not exactly YYYY-MM-DD', () => {
    expect(parseISODate('2026-3-15')).toBeNull();
    expect(parseISODate('15/03/2026')).toBeNull();
    expect(parseISODate('')).toBeNull();
  });

  // Date.UTC happily rolls 31 February into March; a date picker must not.
  it('rejects a day that does not exist in that month', () => {
    expect(parseISODate('2026-02-31')).toBeNull();
    expect(parseISODate('2025-02-29')).toBeNull();
    expect(parseISODate('2024-02-29')).not.toBeNull();
  });

  it('rejects out-of-range components', () => {
    expect(parseISODate('2026-13-01')).toBeNull();
    expect(parseISODate('2026-00-10')).toBeNull();
  });
});

describe('formatISODate', () => {
  it('round-trips with parseISODate', () => {
    const iso = '2026-12-31';
    expect(formatISODate(parseISODate(iso) as Date)).toBe(iso);
  });

  it('pads single-digit months and days', () => {
    expect(formatISODate(new Date(Date.UTC(2026, 0, 5)))).toBe('2026-01-05');
  });
});

describe('addDays', () => {
  it('crosses a month boundary', () => {
    const next = addDays(parseISODate('2026-01-31') as Date, 1);
    expect(formatISODate(next)).toBe('2026-02-01');
  });

  it('steps backwards across a year boundary', () => {
    const prev = addDays(parseISODate('2026-01-01') as Date, -1);
    expect(formatISODate(prev)).toBe('2025-12-31');
  });
});

describe('addMonths', () => {
  // Without clamping, 31 January + 1 month lands in March and paging through
  // a calendar skips February entirely.
  it('clamps the day to the length of the target month', () => {
    expect(formatISODate(addMonths(parseISODate('2026-01-31') as Date, 1))).toBe(
      '2026-02-28'
    );
    expect(formatISODate(addMonths(parseISODate('2024-01-31') as Date, 1))).toBe(
      '2024-02-29'
    );
  });

  it('rolls the year over in both directions', () => {
    expect(formatISODate(addMonths(parseISODate('2026-12-15') as Date, 1))).toBe(
      '2027-01-15'
    );
    expect(formatISODate(addMonths(parseISODate('2026-01-15') as Date, -1))).toBe(
      '2025-12-15'
    );
  });
});

describe('buildMonthGrid', () => {
  it('always fills six weeks', () => {
    expect(buildMonthGrid(2026, 2, 1)).toHaveLength(42);
    expect(buildMonthGrid(2026, 1, 1)).toHaveLength(42);
  });

  it('starts on the requested weekday', () => {
    const monday = buildMonthGrid(2026, 2, 1)[0] as Date;
    expect(monday.getUTCDay()).toBe(1);
    const sunday = buildMonthGrid(2026, 2, 0)[0] as Date;
    expect(sunday.getUTCDay()).toBe(0);
  });

  it('contains every day of the month it is built for', () => {
    const grid = buildMonthGrid(2026, 1, 1).map(formatISODate);
    expect(grid).toContain('2026-02-01');
    expect(grid).toContain('2026-02-28');
  });
});

describe('clampDate', () => {
  const min = parseISODate('2026-03-01') as Date;
  const max = parseISODate('2026-03-31') as Date;

  it('pulls a date into range', () => {
    expect(formatISODate(clampDate(parseISODate('2026-02-01') as Date, min, max))).toBe(
      '2026-03-01'
    );
    expect(formatISODate(clampDate(parseISODate('2026-04-30') as Date, min, max))).toBe(
      '2026-03-31'
    );
  });

  it('leaves an in-range date alone, bounds or not', () => {
    const date = parseISODate('2026-03-10') as Date;
    expect(clampDate(date, min, max)).toBe(date);
    expect(clampDate(date, null, null)).toBe(date);
  });
});

describe('isSameDay', () => {
  it('compares by calendar day', () => {
    expect(isSameDay(parseISODate('2026-03-15'), parseISODate('2026-03-15'))).toBe(
      true
    );
    expect(isSameDay(parseISODate('2026-03-15'), parseISODate('2026-03-16'))).toBe(
      false
    );
  });

  it('is false when either side is missing', () => {
    expect(isSameDay(null, parseISODate('2026-03-15'))).toBe(false);
  });
});

describe('weekdayNames', () => {
  it('returns seven names rotated to the first day of the week', () => {
    const monday = weekdayNames('en-US', 1);
    const sunday = weekdayNames('en-US', 0);
    expect(monday).toHaveLength(7);
    expect(sunday[0]).toBe(monday[6] as string);
  });

  it('falls back to the default locale for an invalid tag', () => {
    expect(weekdayNames('not a locale', 1)).toHaveLength(7);
  });
});

describe('bq-date-picker', () => {
  beforeAll(async () => {
    await import('../src/components/date-picker/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (attrs: Record<string, string> = {}): HTMLElement => {
    const el = doc.createElement('bq-date-picker');
    el.setAttribute('locale', 'en-US');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    doc.body.appendChild(el);
    return el;
  };

  const field = (el: HTMLElement): HTMLInputElement =>
    el.shadowRoot?.querySelector('input') as HTMLInputElement;

  const days = (el: HTMLElement): HTMLElement[] =>
    Array.from(el.shadowRoot?.querySelectorAll('.day') ?? []);

  const click = (target: Element | null) =>
    target?.dispatchEvent(new win.Event('click', { bubbles: true, composed: true }));

  const press = (el: HTMLElement, key: string, init: Record<string, unknown> = {}) =>
    (el.shadowRoot?.querySelector('.day[tabindex="0"]') as HTMLElement)?.dispatchEvent(
      new win.KeyboardEvent('keydown', {
        key,
        bubbles: true,
        composed: true,
        cancelable: true,
        ...init,
      })
    );

  it('registers as a custom element', () => {
    expect(win.customElements.get('bq-date-picker')).toBeDefined();
  });

  it('shows the value formatted for the locale, not as ISO', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();
    expect(field(el).getAttribute('value')).toBe('Mar 15, 2026');
  });

  it('opens the calendar from the trigger', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();

    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();

    expect(el.hasAttribute('data-open')).toBe(true);
    expect(field(el).getAttribute('aria-expanded')).toBe('true');
    expect(days(el)).toHaveLength(42);
  });

  it('marks the selected day', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();
    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();

    const selected = el.shadowRoot?.querySelector('.day[aria-selected="true"]');
    expect(selected?.getAttribute('data-date')).toBe('2026-03-15');
  });

  it('selects a day on click and closes', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();
    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();

    let changed = '';
    el.addEventListener('bq-change', (e) => {
      changed = (e as CustomEvent<{ value: string }>).detail.value;
    });
    click(
      el.shadowRoot?.querySelector('.day[data-date="2026-03-20"]') ?? null
    );
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('2026-03-20');
    expect(changed).toBe('2026-03-20');
    expect(el.hasAttribute('data-open')).toBe(false);
  });

  it('pages between months', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();
    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();

    click(el.shadowRoot?.querySelector('[data-dir="next"]') ?? null);
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('.month-label')?.textContent?.trim()).toBe(
      'April 2026'
    );
  });

  it('moves the cursor a week at a time with the arrow keys', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();
    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();

    press(el, 'ArrowDown');
    await waitForFrame();
    expect(
      el.shadowRoot?.querySelector('.day[tabindex="0"]')?.getAttribute('data-date')
    ).toBe('2026-03-22');
  });

  it('moves focus along with the cursor', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();
    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();
    const focusedDate = () =>
      (el.shadowRoot?.activeElement as HTMLElement | null)?.getAttribute(
        'data-date'
      );

    (el.shadowRoot?.querySelector('.day[tabindex="0"]') as HTMLElement).focus();
    press(el, 'ArrowRight');
    await waitForFrame();
    expect(focusedDate()).toBe('2026-03-16');

    press(el, 'ArrowDown');
    await waitForFrame();
    expect(focusedDate()).toBe('2026-03-23');
  });

  it('closes on Escape without changing the value', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();
    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();

    press(el, 'Escape');
    await waitForFrame();
    expect(el.hasAttribute('data-open')).toBe(false);
    expect(el.getAttribute('value')).toBe('2026-03-15');
  });

  it('disables days outside the allowed range', async () => {
    const el = create({ value: '2026-03-15', min: '2026-03-10', max: '2026-03-20' });
    await waitForFrame();
    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();

    const early = el.shadowRoot?.querySelector('.day[data-date="2026-03-09"]');
    const inside = el.shadowRoot?.querySelector('.day[data-date="2026-03-12"]');
    expect(early?.hasAttribute('disabled')).toBe(true);
    expect(inside?.hasAttribute('disabled')).toBe(false);
  });

  it('rejects typed text that is not a valid date', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();

    const input = field(el);
    input.value = 'tomorrow-ish';
    input.dispatchEvent(new win.Event('change', { bubbles: true, composed: true }));
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('2026-03-15');
  });

  it('accepts a typed ISO date', async () => {
    const el = create({ value: '2026-03-15' });
    await waitForFrame();

    const input = field(el);
    input.value = '2026-04-01';
    input.dispatchEvent(new win.Event('change', { bubbles: true, composed: true }));
    await waitForFrame();

    expect(el.getAttribute('value')).toBe('2026-04-01');
  });

  it('submits the ISO value through a hidden input inside a form', async () => {
    const form = doc.createElement('form');
    doc.body.appendChild(form);
    const el = doc.createElement('bq-date-picker');
    el.setAttribute('name', 'due');
    el.setAttribute('value', '2026-03-15');
    form.appendChild(el);
    await waitForFrame();

    const proxy = form.querySelector('input[name="due"]') as HTMLInputElement | null;
    expect(proxy?.value).toBe('2026-03-15');
  });

  it('starts the week on the requested day', async () => {
    const el = create({ value: '2026-03-15', 'first-day-of-week': '0' });
    await waitForFrame();
    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();

    const headers = Array.from(
      el.shadowRoot?.querySelectorAll('th') ?? []
    ).map((th) => th.textContent?.trim());
    expect(headers[0]).toBe('Sun');
  });

  it('leaves no document listeners behind after removal', async () => {
    const el = create();
    await waitForFrame();
    click(el.shadowRoot?.querySelector('.calendar-btn') ?? null);
    await waitForFrame();
    el.remove();
    await waitForFrame();
    expect(el.isConnected).toBe(false);
  });
});
