/**
 * Locale-aware number display built on `Intl.NumberFormat`.
 *
 * Renders plain inline text, so it can sit inside a sentence, a table cell or
 * a `bq-stat-card` value without adding layout of its own. The `bytes` type
 * picks a sensible unit (kB, MB, GB…) so file sizes read naturally.
 *
 * @element bq-format-number
 * @prop {string} value            - Number to format
 * @prop {string} type             - decimal | currency | percent | unit | bytes
 * @prop {string} locale           - BCP-47 tag; defaults to the document language
 * @prop {string} currency         - ISO 4217 code for `type="currency"` @default 'USD'
 * @prop {string} currency-display - symbol | narrowSymbol | code | name
 * @prop {string} unit             - Unit for `type="unit"`, e.g. `kilometer-per-hour`
 * @prop {string} unit-display     - short | long | narrow
 * @prop {string} notation         - standard | compact | scientific | engineering
 * @prop {string} compact-display  - short | long
 * @prop {string} sign-display     - auto | always | exceptZero | never
 * @prop {string} minimum-fraction-digits
 * @prop {string} maximum-fraction-digits
 * @prop {boolean} no-grouping     - Disable thousands separators
 * @prop {boolean} binary          - For `bytes`: use 1024 instead of 1000 per step
 * @slot - Fallback shown when `value` is not a number
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { formatNumber } from '../../utils/format.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqFormatNumberProps = {
  value: string;
  type: string;
  locale: string;
  currency: string;
  'currency-display': string;
  unit: string;
  'unit-display': string;
  notation: string;
  'compact-display': string;
  'sign-display': string;
  'minimum-fraction-digits': string;
  'maximum-fraction-digits': string;
  'no-grouping': boolean;
  binary: boolean;
};

/** Parses an optional digit-count attribute; empty or invalid means "unset". */
function digits(raw: string): number | undefined {
  if (raw === '' || raw == null) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(20, Math.max(0, Math.trunc(n)));
}

const definition: ComponentDefinition<BqFormatNumberProps> = {
  props: {
    value: { type: String, default: '' },
    type: { type: String, default: 'decimal' },
    locale: { type: String, default: '' },
    currency: { type: String, default: 'USD' },
    'currency-display': { type: String, default: '' },
    unit: { type: String, default: '' },
    'unit-display': { type: String, default: '' },
    notation: { type: String, default: '' },
    'compact-display': { type: String, default: '' },
    'sign-display': { type: String, default: '' },
    'minimum-fraction-digits': { type: String, default: '' },
    'maximum-fraction-digits': { type: String, default: '' },
    'no-grouping': { type: Boolean, default: false },
    binary: { type: Boolean, default: false },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: inline; font-variant-numeric: var(--bq-format-number-variant, tabular-nums); }
  `,
  render({ props }) {
    const raw = String(props.value ?? '').trim();
    const value = raw === '' ? Number.NaN : Number(raw);
    const text = formatNumber(value, {
      type: props.type,
      locale: props.locale,
      currency: props.currency,
      currencyDisplay: props['currency-display'],
      unit: props.unit,
      unitDisplay: props['unit-display'],
      notation: props.notation,
      compactDisplay: props['compact-display'],
      signDisplay: props['sign-display'],
      minimumFractionDigits: digits(props['minimum-fraction-digits']),
      maximumFractionDigits: digits(props['maximum-fraction-digits']),
      grouping: !props['no-grouping'],
      binary: props.binary,
    });
    return html`<span part="base">${text ? escapeHtml(text) : '<slot></slot>'}</span>`;
  },
};

component<BqFormatNumberProps>('bq-format-number', definition);
