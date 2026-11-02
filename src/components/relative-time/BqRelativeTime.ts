/**
 * Relative time display ("3 minutes ago", "in 2 days") built on
 * `Intl.RelativeTimeFormat`.
 *
 * The rendered `<time>` carries the ISO instant in `datetime` and the full
 * absolute date in `title`, so the exact moment is one hover away. With
 * `sync`, the text refreshes itself — every second while the instant is less
 * than a minute away, every minute below an hour, and so on — and the timer is
 * released when the element leaves the page.
 *
 * @element bq-relative-time
 * @prop {string}  date    - Anything `new Date()` accepts, or a ms timestamp
 * @prop {string}  locale  - BCP-47 tag; defaults to the document language
 * @prop {string}  format  - long | short | narrow
 * @prop {string}  numeric - auto ("yesterday") | always ("1 day ago")
 * @prop {string}  unit    - Force a unit: second | minute | hour | day | week | month | year
 * @prop {boolean} sync    - Keep the text up to date while connected
 * @slot - Fallback shown when `date` cannot be parsed
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { bind, host, release, store } from '../../utils/component.js';
import type { Disposer } from '../../utils/component.js';
import {
  formatDate,
  formatRelativeTime,
  parseDate,
  refreshDelay,
} from '../../utils/format.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqRelativeTimeProps = {
  date: string;
  locale: string;
  format: string;
  numeric: string;
  unit: string;
  sync: boolean;
};

type BqRelativeTimeState = { now: number };

const relativeStore = (owner: object) =>
  store<{ schedule?: () => void; pending?: Disposer | null }>(owner, () => ({}));

const definition: ComponentDefinition<BqRelativeTimeProps, BqRelativeTimeState> = {
  props: {
    date: { type: String, default: '' },
    locale: { type: String, default: '' },
    format: { type: String, default: 'long' },
    numeric: { type: String, default: 'auto' },
    unit: { type: String, default: '' },
    sync: { type: Boolean, default: false },
  },
  state: { now: 0 },
  sanitize: { allowAttributes: ['datetime'] },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: inline; }
  `,
  connected() {
    const self = host<BqRelativeTimeState>(this);
    const scope = bind(self);
    const local = relativeStore(self);

    // One pending timer at a time; re-armed after each tick and whenever the
    // `date` or `sync` attributes change (see `updated()`).
    const schedule = () => {
      local.pending?.();
      local.pending = null;
      if (!self.hasAttribute('sync') || !self.isConnected) return;
      const date = parseDate(self.getAttribute('date'));
      if (!date) return;
      const delay = refreshDelay(date.getTime() - Date.now());
      local.pending = scope.timeout(() => {
        local.pending = null;
        self.setState('now', Date.now());
      }, delay);
    };
    local.schedule = schedule;
    scope.add(() => {
      local.pending = null;
    });
    self.setState('now', Date.now());
  },
  disconnected() {
    release(this);
  },
  updated() {
    relativeStore(this).schedule?.();
  },
  render({ props, state }) {
    const date = parseDate(props.date);
    if (!date) return html`<span part="base"><slot></slot></span>`;
    // `state.now` only triggers the re-render; the text is always computed
    // against the real clock, so a changed `date` or `locale` is never
    // measured from a stale moment.
    void state.now;
    const now = Date.now();
    const text = formatRelativeTime(date, now, {
      locale: props.locale,
      format: props.format,
      numeric: props.numeric,
      unit: props.unit,
    });
    const absolute = formatDate(date, {
      locale: props.locale,
      dateStyle: 'full',
      timeStyle: 'short',
    });
    return html`<time part="base" datetime="${escapeHtml(date.toISOString())}" title="${escapeHtml(absolute)}">${escapeHtml(text)}</time>`;
  },
};

component<BqRelativeTimeProps, BqRelativeTimeState>('bq-relative-time', definition);
