/**
 * Locale-aware date and time display built on `Intl.DateTimeFormat`.
 *
 * Renders a semantic `<time datetime="…">` element so the machine-readable
 * instant travels with the human-readable text.
 *
 * Either use the `date-style` / `time-style` presets, or set individual fields
 * (`weekday`, `year`, `month`, `day`, `hour`, `minute`, `second`). `Intl` does
 * not allow mixing the two; when any individual field is set, the presets are
 * ignored.
 *
 * @element bq-format-date
 * @prop {string} date        - Anything `new Date()` accepts; defaults to now
 * @prop {string} locale      - BCP-47 tag; defaults to the document language
 * @prop {string} date-style  - full | long | medium | short
 * @prop {string} time-style  - full | long | medium | short
 * @prop {string} time-zone   - IANA zone such as `Europe/Berlin`, or `UTC`
 * @prop {string} hour-format - auto | 12 | 24
 * @prop {string} weekday     - narrow | short | long
 * @prop {string} year        - numeric | 2-digit
 * @prop {string} month       - numeric | 2-digit | narrow | short | long
 * @prop {string} day         - numeric | 2-digit
 * @prop {string} hour        - numeric | 2-digit
 * @prop {string} minute      - numeric | 2-digit
 * @prop {string} second      - numeric | 2-digit
 * @slot - Fallback shown when `date` cannot be parsed
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { formatDate, isDateOnly, parseDate } from '../../utils/format.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqFormatDateProps = {
  date: string;
  locale: string;
  'date-style': string;
  'time-style': string;
  'time-zone': string;
  'hour-format': string;
  weekday: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
};

const definition: ComponentDefinition<BqFormatDateProps> = {
  props: {
    date: { type: String, default: '' },
    locale: { type: String, default: '' },
    'date-style': { type: String, default: '' },
    'time-style': { type: String, default: '' },
    'time-zone': { type: String, default: '' },
    'hour-format': { type: String, default: 'auto' },
    weekday: { type: String, default: '' },
    year: { type: String, default: '' },
    month: { type: String, default: '' },
    day: { type: String, default: '' },
    hour: { type: String, default: '' },
    minute: { type: String, default: '' },
    second: { type: String, default: '' },
  },
  sanitize: { allowAttributes: ['datetime'] },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: inline; }
  `,
  render({ props }) {
    const date = parseDate(props.date);
    if (!date) return html`<span part="base"><slot></slot></span>`;
    const text = formatDate(date, {
      locale: props.locale,
      dateStyle: props['date-style'],
      timeStyle: props['time-style'],
      timeZone: props['time-zone'] || (isDateOnly(props.date) ? 'UTC' : ''),
      hourFormat: props['hour-format'],
      weekday: props.weekday,
      year: props.year,
      month: props.month,
      day: props.day,
      hour: props.hour,
      minute: props.minute,
      second: props.second,
    });
    return html`<time part="base" datetime="${escapeHtml(date.toISOString())}">${escapeHtml(text)}</time>`;
  },
};

component<BqFormatDateProps>('bq-format-date', definition);
