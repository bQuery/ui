/**
 * Date picker — a text field with a calendar popup.
 *
 * Values are ISO `YYYY-MM-DD` on the way in and out, so the attribute means
 * the same thing everywhere; what the user sees is formatted with
 * `Intl.DateTimeFormat` for the requested locale, as are the month and weekday
 * names and the first day of the week.
 *
 * All the date arithmetic runs in UTC. A calendar built from local-time `Date`
 * objects lands on the wrong day twice a year — the hour that does not exist
 * on a spring-forward morning makes "add one day" produce the same date again —
 * and a date has no time zone to begin with.
 *
 * @element bq-date-picker
 * @prop {string}  label
 * @prop {string}  value       - Selected date as `YYYY-MM-DD`
 * @prop {string}  name        - Form field name
 * @prop {string}  min         - Earliest selectable date
 * @prop {string}  max         - Latest selectable date
 * @prop {string}  locale      - BCP-47 tag; defaults to the document language
 * @prop {number}  first-day-of-week - 0 (Sunday) … 6
 * @prop {string}  placeholder
 * @prop {boolean} clearable
 * @prop {boolean} disabled
 * @prop {boolean} readonly
 * @prop {boolean} required
 * @prop {string}  error
 * @prop {string}  hint
 * @prop {string}  size        - sm | md | lg
 * @fires bq-change - { value: string }
 * @fires bq-open
 * @fires bq-close
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import type { Disposer } from '../../utils/component.js';
import { uniqueId } from '../../utils/dom.js';
import { markFocus, restorePreservedFocus } from '../../utils/focus.js';
import { bindFormProxy, syncFormProxy } from '../../utils/form.js';
import { iconCss } from '../../utils/icons.js';
import { autoPosition } from '../../utils/position.js';
import {
  baseStyles,
  fieldStyles,
  focusRing,
  reset,
  srOnly,
} from '../../utils/styles.js';
import { bindValidation } from '../../utils/validation.js';

type BqDatePickerProps = {
  label: string;
  value: string;
  name: string;
  min: string;
  max: string;
  locale: string;
  'first-day-of-week': number;
  placeholder: string;
  clearable: boolean;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  error: string;
  hint: string;
  size: string;
};

type BqDatePickerState = {
  uid: string;
  open: boolean;
  /** The day the keyboard is on, as ISO. Drives the roving tab stop. */
  cursor: string;
};

const MS_PER_DAY = 86_400_000;

const pickerStore = (owner: object) =>
  store<{ syncPosition?: () => void; stopPosition?: Disposer | null }>(
    owner,
    () => ({})
  );

/** Parses `YYYY-MM-DD` into a UTC timestamp, or `null` if it is not a real date. */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  // Rejects 2024-02-31 and friends, which `Date.UTC` silently rolls over.
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

/** Formats a UTC date back to `YYYY-MM-DD`. */
export function formatISODate(date: Date): string {
  const y = String(date.getUTCFullYear()).padStart(4, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Adds whole days. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Adds whole months, clamping the day to the length of the target month.
 *
 * Without the clamp, stepping from 31 January lands in March, so paging
 * through a calendar would skip February entirely.
 */
export function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
}

/** Whether two dates fall on the same UTC day. */
export function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return formatISODate(a) === formatISODate(b);
}

/**
 * Builds the six-week grid a month is drawn on.
 *
 * Always six rows, always starting on `firstDayOfWeek`: a grid that changes
 * height between months makes the popup jump as the user pages through it,
 * and the leading and trailing days are what keep the columns aligned.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  firstDayOfWeek = 1
): Date[] {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() - firstDayOfWeek + 7) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** Clamps a date into the `[min, max]` window, ignoring absent bounds. */
export function clampDate(
  date: Date,
  min: Date | null,
  max: Date | null
): Date {
  if (min && date.getTime() < min.getTime()) return min;
  if (max && date.getTime() > max.getTime()) return max;
  return date;
}

function isOutOfRange(date: Date, min: Date | null, max: Date | null): boolean {
  if (min && date.getTime() < min.getTime()) return true;
  if (max && date.getTime() > max.getTime()) return true;
  return false;
}

/**
 * Weekday and month names for a locale.
 *
 * Cached because a `DateTimeFormat` is expensive to construct and a calendar
 * re-renders on every arrow key.
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>();
function formatter(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`;
  const cached = formatterCache.get(key);
  if (cached) return cached;
  let created: Intl.DateTimeFormat;
  try {
    created = new Intl.DateTimeFormat(locale || undefined, {
      timeZone: 'UTC',
      ...options,
    });
  } catch {
    created = new Intl.DateTimeFormat(undefined, {
      timeZone: 'UTC',
      ...options,
    });
  }
  formatterCache.set(key, created);
  return created;
}

/** Short weekday headers, rotated to start on `firstDayOfWeek`. */
export function weekdayNames(locale: string, firstDayOfWeek: number): string[] {
  const fmt = formatter(locale, { weekday: 'short' });
  // 1970-01-04 was a Sunday, which makes the index arithmetic trivial.
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(Date.UTC(1970, 0, 4 + ((firstDayOfWeek + i) % 7))))
  );
}

const definition: ComponentDefinition<BqDatePickerProps, BqDatePickerState> = {
  props: {
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    name: { type: String, default: '' },
    min: { type: String, default: '' },
    max: { type: String, default: '' },
    locale: { type: String, default: '' },
    'first-day-of-week': { type: Number, default: 1 },
    placeholder: { type: String, default: '' },
    clearable: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    error: { type: String, default: '' },
    hint: { type: String, default: '' },
    size: { type: String, default: 'md' },
  },
  state: { uid: '', open: false, cursor: '' },
  sanitize: { allowAttributes: ['scope'] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${fieldStyles}
    ${srOnly}
    ${focusRing}
    ${iconCss('calendar', 'chevron-left', 'chevron-right', 'x')}
    :host { display: block; position: relative; }

    .control {
      display: flex; align-items: center;
      border: var(--bq-border-width-control,1.5px) solid var(--bq-border-emphasis,#cbd5e1);
      border-radius: var(--bq-radius-lg,0.5rem);
      background: var(--bq-bg-base,#fff);
      overflow: hidden;
      transition: border-color var(--bq-duration-fast) var(--bq-easing-standard),
                  box-shadow var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .control:hover { border-color: var(--bq-border-strong,#94a3b8); }
    .control:focus-within { border-color: var(--bq-border-focus,#2563eb); box-shadow: var(--bq-focus-ring); }
    :host([error]:not([error=""])) .control { border-color: var(--bq-color-danger-500,#ef4444); }
    :host([error]:not([error=""])) .control:focus-within { box-shadow: var(--bq-focus-ring-danger); }
    :host([disabled]) .control { opacity: 0.55; background: var(--bq-bg-muted,#f1f5f9); }

    input {
      flex: 1; min-inline-size: 0;
      border: none; outline: none; background: transparent;
      color: var(--bq-text-base,#0f172a);
      font-family: var(--bq-font-family-sans);
    }
    :host([size="sm"]) input { font-size: var(--bq-font-size-sm,0.875rem); padding: 0.375rem var(--bq-control-padding-sm,0.75rem); min-block-size: var(--bq-control-height-sm,2rem); }
    :host([size="md"]) input, :host(:not([size])) input { font-size: var(--bq-font-size-md,1rem); padding: 0.5rem var(--bq-control-padding-md,0.875rem); min-block-size: var(--bq-control-height-md,2.5rem); }
    :host([size="lg"]) input { font-size: var(--bq-font-size-lg,1.125rem); padding: 0.625rem var(--bq-control-padding-lg,1rem); min-block-size: var(--bq-control-height-lg,3rem); }
    input::placeholder { color: var(--bq-text-subtle,#94a3b8); }

    .affix-btn {
      display: inline-flex; align-items: center; justify-content: center;
      align-self: stretch; padding-inline: 0.5rem;
      background: none; border: none; cursor: pointer;
      color: var(--bq-text-muted,#475569);
      --bq-icon-size: 1.125rem;
      transition: color var(--bq-duration-fast) var(--bq-easing-standard),
                  background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .affix-btn:hover { color: var(--bq-text-base,#0f172a); background: var(--bq-bg-hover,rgba(15,23,42,0.04)); }
    .affix-btn:disabled { cursor: not-allowed; opacity: 0.5; }

    .panel {
      position: absolute; z-index: var(--bq-z-dropdown,100);
      inset-inline-start: 0; margin-block-start: 0.25rem;
      background: var(--bq-surface-overlay,#fff);
      border: 1px solid var(--bq-border-base,#e2e8f0);
      border-radius: var(--bq-radius-xl,0.75rem);
      box-shadow: var(--bq-shadow-lg);
      padding: 0.75rem;
      font-family: var(--bq-font-family-sans);
      inline-size: max-content;
    }
    :host(:not([data-open])) .panel { display: none; }

    .panel-head {
      display: flex; align-items: center; justify-content: space-between;
      gap: 0.5rem; margin-block-end: 0.5rem;
    }
    .month-label {
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-semibold,600);
      color: var(--bq-text-base,#0f172a);
    }
    .nav-btn {
      display: inline-flex; align-items: center; justify-content: center;
      inline-size: 1.75rem; block-size: 1.75rem;
      border: none; border-radius: var(--bq-radius-md,0.375rem);
      background: none; cursor: pointer;
      color: var(--bq-text-muted,#475569);
      --bq-icon-size: 1rem;
      transition: background-color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .nav-btn:hover:not(:disabled) { background: var(--bq-bg-hover,rgba(15,23,42,0.06)); color: var(--bq-text-base,#0f172a); }
    .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .grid { border-collapse: collapse; }
    .grid th {
      inline-size: 2rem; padding-block-end: 0.25rem;
      font-size: var(--bq-font-size-xs,0.75rem);
      font-weight: var(--bq-font-weight-medium,500);
      color: var(--bq-text-subtle,#94a3b8);
      text-transform: uppercase;
      letter-spacing: var(--bq-letter-spacing-wide,0.04em);
    }
    .grid td { padding: 1px; }
    .day {
      inline-size: 2rem; block-size: 2rem;
      display: grid; place-items: center;
      border: none; border-radius: var(--bq-radius-md,0.375rem);
      background: none; cursor: pointer;
      font-family: inherit;
      font-size: var(--bq-font-size-sm,0.875rem);
      font-variant-numeric: tabular-nums;
      color: var(--bq-text-base,#0f172a);
      transition: background-color var(--bq-duration-fast) var(--bq-easing-standard),
                  color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .day:hover:not(:disabled) { background: var(--bq-bg-hover,rgba(15,23,42,0.06)); }
    /* Days spilling in from the neighbouring months stay visible but recede,
       so the six-row grid keeps its shape without pulling the eye. */
    .day[data-outside="true"] { color: var(--bq-text-subtle,#94a3b8); }
    .day[data-today="true"] { font-weight: var(--bq-font-weight-semibold,600); box-shadow: inset 0 0 0 1px var(--bq-border-strong,#94a3b8); }
    .day[aria-selected="true"] {
      background: var(--bq-color-primary-600,#2563eb);
      color: var(--bq-text-on-primary,#fff);
      box-shadow: none;
    }
    .day:disabled { opacity: 0.35; cursor: not-allowed; }

    .panel-foot { display: flex; justify-content: flex-end; margin-block-start: 0.5rem; }
    .today-btn {
      border: none; background: none; cursor: pointer;
      font-family: inherit; font-size: var(--bq-font-size-sm,0.875rem);
      color: var(--bq-color-primary-600,#2563eb);
      padding: 0.25rem 0.5rem; border-radius: var(--bq-radius-md,0.375rem);
    }
    .today-btn:hover { background: var(--bq-bg-hover,rgba(15,23,42,0.06)); }
  `,
  connected() {
    const self = host<BqDatePickerState>(this);
    const scope = bind(self);
    const local = pickerStore(self);
    if (!self.getState<string>('uid')) self.setState('uid', uniqueId('bq-dp'));

    const readValue = () => self.getAttribute('value') ?? '';
    const minDate = () => parseISODate(self.getAttribute('min') ?? '');
    const maxDate = () => parseISODate(self.getAttribute('max') ?? '');
    const isInteractive = () =>
      !self.hasAttribute('disabled') && !self.hasAttribute('readonly');

    bindFormProxy(self, scope, { value: readValue });
    bindValidation(self, scope, { value: readValue });

    /** The day the keyboard is on: the cursor, else the value, else today. */
    const cursorDate = (): Date => {
      const explicit = parseISODate(self.getState<string>('cursor') ?? '');
      if (explicit) return explicit;
      const selected = parseISODate(readValue());
      if (selected) return selected;
      const now = new Date();
      return new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
      );
    };

    const setCursor = (date: Date) => {
      markFocus(self);
      self.setState('cursor', formatISODate(clampDate(date, minDate(), maxDate())));
    };

    const open = () => {
      if (!isInteractive() || self.getState<boolean>('open')) return;
      markFocus(self);
      self.setState('cursor', formatISODate(cursorDate()));
      self.setState('open', true);
      self.setAttribute('data-open', '');
      self.dispatchEvent(
        new CustomEvent('bq-open', { bubbles: true, composed: true })
      );
    };

    const close = ({ restore = false } = {}) => {
      if (!self.getState<boolean>('open')) return;
      markFocus(self);
      self.setState('open', false);
      self.removeAttribute('data-open');
      self.dispatchEvent(
        new CustomEvent('bq-close', { bubbles: true, composed: true })
      );
      if (!restore) return;
      const field = self.shadowRoot?.querySelector(
        'input'
      ) as HTMLInputElement | null;
      field?.focus();
    };

    const commit = (iso: string) => {
      if (self.getAttribute('value') === iso) return;
      self.setAttribute('value', iso);
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: { value: iso },
          bubbles: true,
          composed: true,
        })
      );
    };

    const select = (date: Date) => {
      if (isOutOfRange(date, minDate(), maxDate())) return;
      commit(formatISODate(date));
      close({ restore: true });
    };

    // ── Positioning ──────────────────────────────────────────────────────
    const syncPosition = () => {
      local.stopPosition?.();
      local.stopPosition = null;
      if (!self.getState<boolean>('open')) return;
      const panel = self.shadowRoot?.querySelector(
        '.panel'
      ) as HTMLElement | null;
      if (!panel) return;
      local.stopPosition = scope.add(
        autoPosition(self, panel, { placement: 'bottom-start', offset: 4 })
      );
    };
    local.syncPosition = syncPosition;

    // ── Text entry ───────────────────────────────────────────────────────
    scope.on(self.shadowRoot, 'change', (event) => {
      const input = event.target as HTMLInputElement | null;
      if (input?.tagName !== 'INPUT') return;
      const typed = input.value.trim();
      if (!typed) {
        commit('');
        return;
      }
      const parsed = parseISODate(typed);
      // Anything the field cannot parse is rejected by repainting the last
      // good value, rather than by silently storing something else.
      if (!parsed || isOutOfRange(parsed, minDate(), maxDate())) {
        input.value = displayValue();
        return;
      }
      commit(formatISODate(parsed));
    });

    const displayValue = (): string => {
      const date = parseISODate(readValue());
      if (!date) return '';
      return formatter(self.getAttribute('locale') ?? '', {
        dateStyle: 'medium',
      }).format(date);
    };

    scope.on(self.shadowRoot, 'click', (event) => {
      const target = event.target as Element;
      if (target.closest('.calendar-btn')) {
        if (self.getState<boolean>('open')) close({ restore: true });
        else open();
        return;
      }
      if (target.closest('.clear-btn')) {
        commit('');
        return;
      }
      if (!isInteractive()) return;
      const nav = target.closest('.nav-btn') as HTMLElement | null;
      if (nav) {
        setCursor(
          addMonths(cursorDate(), nav.getAttribute('data-dir') === 'next' ? 1 : -1)
        );
        return;
      }
      if (target.closest('.today-btn')) {
        const now = new Date();
        select(
          new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
        );
        return;
      }
      const day = target.closest('.day') as HTMLElement | null;
      if (day && !day.hasAttribute('disabled')) {
        const parsed = parseISODate(day.getAttribute('data-date') ?? '');
        if (parsed) select(parsed);
      }
    });

    scope.on(self.shadowRoot, 'keydown', (event) => {
      const ke = event as KeyboardEvent;
      if (!isInteractive()) return;
      const isOpen = self.getState<boolean>('open') === true;
      const onField = (ke.target as Element)?.tagName === 'INPUT';

      if (!isOpen) {
        if (onField && (ke.key === 'ArrowDown' || ke.key === 'Enter') && ke.altKey) {
          ke.preventDefault();
          open();
        }
        return;
      }

      switch (ke.key) {
        case 'Escape':
          ke.preventDefault();
          close({ restore: true });
          return;
        case 'ArrowLeft':
          if (onField) return;
          ke.preventDefault();
          setCursor(addDays(cursorDate(), -1));
          return;
        case 'ArrowRight':
          if (onField) return;
          ke.preventDefault();
          setCursor(addDays(cursorDate(), 1));
          return;
        case 'ArrowUp':
          if (onField) return;
          ke.preventDefault();
          setCursor(addDays(cursorDate(), -7));
          return;
        case 'ArrowDown':
          if (onField) return;
          ke.preventDefault();
          setCursor(addDays(cursorDate(), 7));
          return;
        case 'PageUp':
          ke.preventDefault();
          setCursor(addMonths(cursorDate(), ke.shiftKey ? -12 : -1));
          return;
        case 'Home': {
          if (onField) return;
          ke.preventDefault();
          const first = Number(self.getAttribute('first-day-of-week') ?? 1);
          const current = cursorDate();
          const offset = (current.getUTCDay() - first + 7) % 7;
          setCursor(addDays(current, -offset));
          return;
        }
        case 'End': {
          if (onField) return;
          ke.preventDefault();
          const first = Number(self.getAttribute('first-day-of-week') ?? 1);
          const current = cursorDate();
          const offset = (current.getUTCDay() - first + 7) % 7;
          setCursor(addDays(current, 6 - offset));
          return;
        }
        case 'PageDown':
          ke.preventDefault();
          setCursor(addMonths(cursorDate(), ke.shiftKey ? 12 : 1));
          return;
        case 'Enter':
        case ' ':
          if (onField) return;
          ke.preventDefault();
          select(cursorDate());
          return;
      }
    });

    // Registered once and gated on `open`, so the listener count does not
    // depend on how often the calendar is toggled.
    scope.on(document, 'mousedown', (event) => {
      if (!self.getState<boolean>('open')) return;
      if (self.contains(event.target as Node)) return;
      close();
    });
    scope.on(self.shadowRoot, 'focusout', (event) => {
      if (!self.getState<boolean>('open')) return;
      const next = (event as FocusEvent).relatedTarget as Node | null;
      if (next && self.shadowRoot?.contains(next)) return;
      if (next && self.contains(next)) return;
      if (next) close();
    });
  },
  disconnected() {
    release(this);
  },
  beforeUpdate() {
    markFocus(this);
  },
  updated() {
    const local = pickerStore(this);
    restorePreservedFocus(this);
    local.syncPosition?.();
    syncFormProxy(this);

    // Arrow keys move a roving tab stop through the grid. bQuery >= 1.18
    // patches the grid in place, so the day that had focus keeps it (older
    // releases replaced it, and focus was restored onto a stand-in); move
    // focus to the cursor whenever it is on another day, or nowhere.
    const root = this.shadowRoot;
    const cursor = root?.querySelector(
      '.day[tabindex="0"]'
    ) as HTMLElement | null;
    const focused = root?.activeElement as HTMLElement | null | undefined;
    const focusOnOtherDay =
      !focused || (focused !== cursor && focused.classList.contains('day'));
    if (cursor && this.hasAttribute('data-open') && focusOnOtherDay) {
      cursor.focus();
    }
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-dp';
    const isOpen = state.open === true;
    const locale = props.locale;
    const min = parseISODate(props.min);
    const max = parseISODate(props.max);
    const selected = parseISODate(props.value);
    const cursor =
      parseISODate(state.cursor ?? '') ??
      selected ??
      (() => {
        const now = new Date();
        return new Date(
          Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
        );
      })();
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    );

    const firstDay = Number.isFinite(props['first-day-of-week'])
      ? ((props['first-day-of-week'] % 7) + 7) % 7
      : 1;
    const grid = buildMonthGrid(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth(),
      firstDay
    );
    const monthLabel = formatter(locale, {
      month: 'long',
      year: 'numeric',
    }).format(cursor);
    const dayFormatter = formatter(locale, { dateStyle: 'full' });

    const hasError = Boolean(props.error);
    const hasHint = Boolean(props.hint) && !hasError;
    const describedBy: string[] = [];
    if (hasError) describedBy.push(`${uid}-err`);
    if (hasHint) describedBy.push(`${uid}-hint`);

    const display = selected
      ? formatter(locale, { dateStyle: 'medium' }).format(selected)
      : '';

    const headers = weekdayNames(locale, firstDay)
      .map(
        (name) =>
          `<th scope="col">${escapeHtml(name)}</th>`
      )
      .join('');

    let cells = '';
    for (let week = 0; week < 6; week += 1) {
      const days = grid
        .slice(week * 7, week * 7 + 7)
        .map((date) => {
          const iso = formatISODate(date);
          const outside = date.getUTCMonth() !== cursor.getUTCMonth();
          const disabled = isOutOfRange(date, min, max);
          const isCursor = isSameDay(date, cursor);
          return `<td role="gridcell" aria-selected="${isSameDay(date, selected) ? 'true' : 'false'}">
            <button
              type="button"
              class="day"
              part="day"
              data-date="${escapeHtml(iso)}"
              data-outside="${outside ? 'true' : 'false'}"
              data-today="${isSameDay(date, today) ? 'true' : 'false'}"
              aria-selected="${isSameDay(date, selected) ? 'true' : 'false'}"
              aria-label="${escapeHtml(dayFormatter.format(date))}"
              tabindex="${isCursor ? '0' : '-1'}"
              ${disabled ? 'disabled' : ''}
            >${date.getUTCDate()}</button>
          </td>`;
        })
        .join('');
      cells += `<tr role="row">${days}</tr>`;
    }

    const prevDisabled = Boolean(
      min && addMonths(cursor, -1).getUTCFullYear() * 100 +
        addMonths(cursor, -1).getUTCMonth() <
        min.getUTCFullYear() * 100 + min.getUTCMonth()
    );
    const nextDisabled = Boolean(
      max && addMonths(cursor, 1).getUTCFullYear() * 100 +
        addMonths(cursor, 1).getUTCMonth() >
        max.getUTCFullYear() * 100 + max.getUTCMonth()
    );

    return html`
      <div class="field" part="field">
        ${
          props.label
            ? `<label class="label" part="label" for="${escapeHtml(`${uid}-input`)}">${escapeHtml(props.label)}${props.required ? '<span class="required-mark" aria-hidden="true"> *</span>' : ''}</label>`
            : ''
        }
        <div class="control" part="control">
          <input
            id="${escapeHtml(`${uid}-input`)}"
            part="input"
            type="text"
            autocomplete="off"
            value="${escapeHtml(display)}"
            placeholder="${escapeHtml(props.placeholder || t('datePicker.placeholder'))}"
            aria-haspopup="dialog"
            aria-expanded="${isOpen ? 'true' : 'false'}"
            aria-invalid="${hasError ? 'true' : 'false'}"
            ${props.required ? 'aria-required="true"' : ''}
            ${describedBy.length > 0 ? `aria-describedby="${escapeHtml(describedBy.join(' '))}"` : ''}
            ${props.disabled ? 'disabled' : ''}
            ${props.readonly ? 'readonly' : ''}
          />
          ${
            props.clearable && display && !props.disabled && !props.readonly
              ? `<button type="button" class="affix-btn clear-btn" part="clear" tabindex="-1" aria-label="${escapeHtml(t('datePicker.clear'))}"><span class="icon" data-icon="x" aria-hidden="true"></span></button>`
              : ''
          }
          <button
            type="button"
            class="affix-btn calendar-btn"
            part="trigger"
            aria-label="${escapeHtml(t('datePicker.open'))}"
            aria-expanded="${isOpen ? 'true' : 'false'}"
            ${props.disabled || props.readonly ? 'disabled' : ''}
          ><span class="icon" data-icon="calendar" aria-hidden="true"></span></button>
        </div>

        <div class="panel" part="panel" role="dialog" aria-modal="false" aria-label="${escapeHtml(monthLabel)}">
          <div class="panel-head">
            <button type="button" class="nav-btn" part="prev" data-dir="prev" aria-label="${escapeHtml(t('datePicker.prevMonth'))}" ${prevDisabled ? 'disabled' : ''}>
              <span class="icon" data-icon="chevron-left" aria-hidden="true"></span>
            </button>
            <span class="month-label" part="month" aria-live="polite">${escapeHtml(monthLabel)}</span>
            <button type="button" class="nav-btn" part="next" data-dir="next" aria-label="${escapeHtml(t('datePicker.nextMonth'))}" ${nextDisabled ? 'disabled' : ''}>
              <span class="icon" data-icon="chevron-right" aria-hidden="true"></span>
            </button>
          </div>
          <table class="grid" part="grid" role="grid" aria-label="${escapeHtml(monthLabel)}">
            <thead><tr role="row">${headers}</tr></thead>
            <tbody>${cells}</tbody>
          </table>
          <div class="panel-foot">
            <button type="button" class="today-btn" part="today">${escapeHtml(t('datePicker.today'))}</button>
          </div>
        </div>

        ${hasHint ? `<span class="hint" id="${uid}-hint" part="hint">${escapeHtml(props.hint)}</span>` : ''}
        ${hasError ? `<span class="error-msg" id="${uid}-err" role="alert" part="error">${escapeHtml(props.error)}</span>` : ''}
      </div>
    `;
  },
};

component<BqDatePickerProps, BqDatePickerState>('bq-date-picker', definition);
