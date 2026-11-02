/**
 * Locale-aware formatting helpers built on the `Intl` APIs.
 *
 * These back `bq-format-number`, `bq-format-date` and `bq-relative-time`, and
 * are exported so an application can produce the same strings outside a
 * component (in a chart label or a document title, for instance). Every
 * function falls back to a safer format instead of throwing when `Intl`
 * rejects an option, because they run inside `render()`.
 */
export interface FormatNumberOptions {
  type?: string;
  locale?: string;
  currency?: string;
  currencyDisplay?: string;
  unit?: string;
  unitDisplay?: string;
  notation?: string;
  compactDisplay?: string;
  signDisplay?: string;
  minimumFractionDigits?: number | undefined;
  maximumFractionDigits?: number | undefined;
  grouping?: boolean;
  binary?: boolean;
}

const BYTE_UNITS = [
  'byte',
  'kilobyte',
  'megabyte',
  'gigabyte',
  'terabyte',
  'petabyte',
] as const;

/** Resolves the locale a formatter should use: explicit tag, then the document language. */
export function resolveLocale(locale?: string): string | undefined {
  if (locale) return locale;
  const lang =
    typeof document !== 'undefined'
      ? document.documentElement?.getAttribute('lang')
      : null;
  return lang || undefined;
}

/**
 * Formats a number. Returns `''` for a value that is not a finite number, and
 * falls back to a plain decimal when the requested options are rejected by
 * `Intl` (an unknown currency or unit, say) instead of throwing during render.
 */
export function formatNumber(
  value: number,
  options: FormatNumberOptions = {}
): string {
  if (!Number.isFinite(value)) return '';
  const locale = resolveLocale(options.locale);
  const type = options.type || 'decimal';

  const intl: Intl.NumberFormatOptions = {};
  if (options.notation) {
    intl.notation = options.notation as Intl.NumberFormatOptions['notation'];
  }
  if (options.compactDisplay) {
    intl.compactDisplay =
      options.compactDisplay as Intl.NumberFormatOptions['compactDisplay'];
  }
  if (options.signDisplay) {
    intl.signDisplay =
      options.signDisplay as Intl.NumberFormatOptions['signDisplay'];
  }
  if (options.grouping === false) intl.useGrouping = false;

  let amount = value;

  if (type === 'currency') {
    intl.style = 'currency';
    intl.currency = (options.currency || 'USD').toUpperCase();
    if (options.currencyDisplay) {
      intl.currencyDisplay =
        options.currencyDisplay as Intl.NumberFormatOptions['currencyDisplay'];
    }
  } else if (type === 'percent') {
    intl.style = 'percent';
  } else if (type === 'unit' || type === 'bytes') {
    intl.style = 'unit';
    intl.unitDisplay = (options.unitDisplay ||
      'short') as Intl.NumberFormatOptions['unitDisplay'];
    if (type === 'bytes') {
      const step = options.binary ? 1024 : 1000;
      let index = 0;
      while (Math.abs(amount) >= step && index < BYTE_UNITS.length - 1) {
        amount /= step;
        index += 1;
      }
      intl.unit = BYTE_UNITS[index];
      // Whole bytes never need decimals; larger units get one by default.
      if (options.maximumFractionDigits === undefined) {
        intl.maximumFractionDigits = index === 0 ? 0 : 1;
      }
    } else {
      intl.unit = options.unit || 'meter';
    }
  }

  const min = options.minimumFractionDigits;
  const max = options.maximumFractionDigits;
  if (min !== undefined) intl.minimumFractionDigits = min;
  if (max !== undefined) {
    intl.maximumFractionDigits = Math.max(max, min ?? 0);
  }

  try {
    return new Intl.NumberFormat(locale, intl).format(amount);
  } catch {
    try {
      return new Intl.NumberFormat(locale).format(amount);
    } catch {
      return String(amount);
    }
  }
}

export interface FormatDateOptions {
  locale?: string;
  dateStyle?: string;
  timeStyle?: string;
  timeZone?: string;
  hourFormat?: string;
  weekday?: string;
  year?: string;
  month?: string;
  day?: string;
  hour?: string;
  minute?: string;
  second?: string;
}

const FIELDS = [
  'weekday',
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
] as const;

/**
 * Parses a date attribute. A bare number is treated as a Unix timestamp in
 * milliseconds; an empty string means "now". Returns `null` when unparseable.
 */
export function parseDate(raw: string | number | Date | null | undefined): Date | null {
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw;
  if (typeof raw === 'number') {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const text = (raw ?? '').trim();
  if (text === '') return new Date();
  const date = /^-?\d+$/.test(text) ? new Date(Number(text)) : new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Formats a date, falling back to the medium date preset when options are rejected. */
export function formatDate(date: Date, options: FormatDateOptions = {}): string {
  const locale = resolveLocale(options.locale);
  const intl: Intl.DateTimeFormatOptions = {};
  const fieldsSet = FIELDS.filter((field) => Boolean(options[field]));

  if (fieldsSet.length > 0) {
    for (const field of fieldsSet) {
      (intl as Record<string, string>)[field] = options[field] as string;
    }
  } else {
    if (options.dateStyle) {
      intl.dateStyle = options.dateStyle as Intl.DateTimeFormatOptions['dateStyle'];
    }
    if (options.timeStyle) {
      intl.timeStyle = options.timeStyle as Intl.DateTimeFormatOptions['timeStyle'];
    }
    if (!intl.dateStyle && !intl.timeStyle) intl.dateStyle = 'medium';
  }

  if (options.timeZone) intl.timeZone = options.timeZone;
  if (options.hourFormat === '12') intl.hour12 = true;
  else if (options.hourFormat === '24') intl.hourCycle = 'h23';

  try {
    return new Intl.DateTimeFormat(locale, intl).format(date);
  } catch {
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
    } catch {
      return date.toISOString();
    }
  }
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const UNITS: ReadonlyArray<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', YEAR],
  ['month', MONTH],
  ['week', WEEK],
  ['day', DAY],
  ['hour', HOUR],
  ['minute', MINUTE],
  ['second', SECOND],
];

/** Picks the largest unit that fits the distance, or honours a forced unit. */
export function selectUnit(
  diffMs: number,
  forced?: string
): { value: number; unit: Intl.RelativeTimeFormatUnit } {
  const forcedEntry = UNITS.find(([unit]) => unit === forced);
  if (forcedEntry) {
    return { value: Math.round(diffMs / forcedEntry[1]), unit: forcedEntry[0] };
  }
  const abs = Math.abs(diffMs);
  for (const [unit, size] of UNITS) {
    if (abs >= size || unit === 'second') {
      return { value: Math.round(diffMs / size), unit };
    }
  }
  return { value: 0, unit: 'second' };
}

export interface RelativeTimeOptions {
  locale?: string;
  format?: string;
  numeric?: string;
  unit?: string;
}

/** Formats `date` relative to `now` ("5 minutes ago", "tomorrow"). */
export function formatRelativeTime(
  date: Date,
  now: Date | number = Date.now(),
  options: RelativeTimeOptions = {}
): string {
  const nowMs = typeof now === 'number' ? now : now.getTime();
  const { value, unit } = selectUnit(date.getTime() - nowMs, options.unit);
  const locale = resolveLocale(options.locale);
  const intl: Intl.RelativeTimeFormatOptions = {
    numeric: options.numeric === 'always' ? 'always' : 'auto',
    style: (['long', 'short', 'narrow'].includes(options.format ?? '')
      ? options.format
      : 'long') as Intl.RelativeTimeFormatStyle,
  };
  try {
    return new Intl.RelativeTimeFormat(locale, intl).format(value, unit);
  } catch {
    return new Intl.RelativeTimeFormat(undefined, intl).format(value, unit);
  }
}

/** How long until the displayed text can next change, in ms. */
export function refreshDelay(diffMs: number): number {
  const abs = Math.abs(diffMs);
  if (abs < MINUTE) return SECOND;
  if (abs < HOUR) return MINUTE / 2;
  if (abs < DAY) return HOUR / 4;
  return HOUR;
}

