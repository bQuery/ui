/**
 * Rating component — star rating input.
 * @element bq-rating
 * @prop {number}  value     - Current rating
 * @prop {number}  max       - Number of stars
 * @prop {boolean} readonly  - Display only, not interactive
 * @prop {boolean} disabled
 * @prop {boolean} clearable - Re-selecting the current value clears it
 * @prop {string}  size      - sm | md | lg
 * @prop {string}  label     - Accessible label
 * @prop {string}  name      - Form field name
 * @fires bq-change - { value: number }
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release, store } from '../../utils/component.js';
import { createFormProxy, type FormProxy } from '../../utils/form.js';
import { iconCss } from '../../utils/icons.js';
import { baseStyles, reset, srOnly } from '../../utils/styles.js';

type BqRatingProps = {
  value: number;
  max: number;
  readonly: boolean;
  disabled: boolean;
  clearable: boolean;
  size: string;
  label: string;
  name: string;
};

const ratingStore = (owner: object) =>
  store<{ proxy?: FormProxy }>(owner, () => ({}));

/** Clamps a rating to `0..max`, treating anything unparseable as 0. */
export function clampRating(value: number, max: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), Math.max(max, 0));
}

const definition: ComponentDefinition<BqRatingProps> = {
  props: {
    value: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
    label: { type: String, default: '' },
    name: { type: String, default: '' },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    ${iconCss('star', 'star-filled')}
    :host { display: inline-flex; }
    .rating {
      display: inline-flex; align-items: center; gap: 0.125rem;
      font-family: var(--bq-font-family-sans);
    }
    .star {
      display: inline-flex; align-items: center; justify-content: center;
      background: none; border: none; padding: 0.125rem; margin: 0;
      color: var(--bq-border-emphasis,#cbd5e1);
      cursor: pointer; line-height: 1;
      transition: color var(--bq-duration-fast) var(--bq-easing-standard),
                  transform var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .star[data-filled="true"] { color: var(--bq-color-warning-500,#f59e0b); }
    .rating[data-size="sm"] .star { --bq-icon-size: 1rem; }
    .rating[data-size="md"] .star { --bq-icon-size: 1.375rem; }
    .rating[data-size="lg"] .star { --bq-icon-size: 1.75rem; }
    .star:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); border-radius: var(--bq-radius-sm,0.25rem); }
    :host(:not([readonly]):not([disabled])) .star:hover { transform: scale(1.12); }
    :host([readonly]) .star, :host([disabled]) .star { cursor: default; }
    :host([disabled]) .rating { opacity: 0.55; }
    @media (prefers-reduced-motion: reduce) {
      .star { transition: none; }
      :host(:not([readonly]):not([disabled])) .star:hover { transform: none; }
    }
  `,
  connected() {
    const self = host(this);
    const scope = bind(self);
    const local = ratingStore(self);

    const readValue = () => clampRating(
      Number(self.getAttribute('value') ?? '0'),
      Number(self.getAttribute('max') ?? '5')
    );

    const name = self.getAttribute('name') ?? '';
    if (name) {
      local.proxy = createFormProxy(
        self,
        name,
        String(readValue()),
        self.hasAttribute('disabled'),
        { getLiveValue: () => String(readValue()) }
      );
      scope.add(() => {
        local.proxy?.cleanup();
        delete local.proxy;
      });
    }

    const commit = (next: number) => {
      if (self.hasAttribute('readonly') || self.hasAttribute('disabled')) return;
      const max = Number(self.getAttribute('max') ?? '5');
      const value = clampRating(next, max);
      const final =
        self.hasAttribute('clearable') && value === readValue() ? 0 : value;
      self.setAttribute('value', String(final));
      local.proxy?.setValue(String(final));
      self.dispatchEvent(
        new CustomEvent('bq-change', {
          detail: { value: final },
          bubbles: true,
          composed: true,
        })
      );
    };

    scope.on(self.shadowRoot, 'click', (e) => {
      const star = (e.target as Element).closest(
        '.star'
      ) as HTMLElement | null;
      if (!star) return;
      commit(Number(star.getAttribute('data-value') ?? '0'));
    });

    // Arrow keys adjust by one, Home/End jump to the ends — the radiogroup
    // keyboard contract screen-reader users expect.
    scope.on(self.shadowRoot, 'keydown', (e) => {
      if (self.hasAttribute('readonly') || self.hasAttribute('disabled')) return;
      const ke = e as KeyboardEvent;
      const max = Number(self.getAttribute('max') ?? '5');
      const current = readValue();
      let next: number | null = null;
      if (ke.key === 'ArrowRight' || ke.key === 'ArrowUp') next = current + 1;
      else if (ke.key === 'ArrowLeft' || ke.key === 'ArrowDown') next = current - 1;
      else if (ke.key === 'Home') next = 0;
      else if (ke.key === 'End') next = max;
      if (next === null) return;
      ke.preventDefault();
      commit(next);
      const focusIndex = Math.max(1, Math.min(clampRating(next, max), max));
      (
        self.shadowRoot?.querySelector(
          `.star[data-value="${focusIndex}"]`
        ) as HTMLElement | null
      )?.focus();
    });
  },
  disconnected() {
    release(this);
  },
  updated() {
    const self = host(this);
    const local = ratingStore(self);
    const value = clampRating(
      Number(self.getAttribute('value') ?? '0'),
      Number(self.getAttribute('max') ?? '5')
    );
    local.proxy?.setValue(String(value));
    local.proxy?.setDisabled(self.hasAttribute('disabled'));
  },
  render({ props }) {
    const max = Math.max(0, Math.trunc(props.max) || 0);
    const value = clampRating(props.value, max);
    const interactive = !props.readonly && !props.disabled;
    const label = props.label.trim() || t('rating.label');
    const valueText = t('rating.valueText', { value, max });

    const stars = Array.from({ length: max }, (_, i) => {
      const index = i + 1;
      const filled = index <= value;
      return `
        <button
          type="button"
          class="star"
          part="star"
          data-value="${index}"
          data-filled="${filled ? 'true' : 'false'}"
          role="radio"
          aria-checked="${filled && index === Math.ceil(value) ? 'true' : 'false'}"
          aria-label="${escapeHtml(t('rating.valueText', { value: index, max }))}"
          tabindex="${interactive && (index === Math.max(1, Math.ceil(value)) || (value === 0 && index === 1)) ? '0' : '-1'}"
          ${interactive ? '' : 'disabled'}
        ><span class="icon" data-icon="${filled ? 'star-filled' : 'star'}" aria-hidden="true"></span></button>
      `;
    }).join('');

    return html`
      <div
        part="rating"
        class="rating"
        data-size="${escapeHtml(props.size)}"
        role="radiogroup"
        aria-label="${escapeHtml(label)}"
        aria-readonly="${props.readonly ? 'true' : 'false'}"
        aria-disabled="${props.disabled ? 'true' : 'false'}"
      >
        ${stars}
      </div>
      <span class="sr-only" role="status" aria-live="polite"
        >${escapeHtml(valueText)}</span
      >
    `;
  },
};

component<BqRatingProps>('bq-rating', definition);
