/**
 * Stepper component — progress indicator for multi-step flows.
 * @element bq-stepper
 * @prop {number}  current     - Zero-based index of the active step
 * @prop {string}  orientation - horizontal | vertical
 * @prop {boolean} clickable   - Allow completed steps to be selected
 * @prop {string}  label       - Accessible label for the step list
 *
 * Steps are declared as light-DOM children carrying `[data-step]`, with an
 * optional `label` attribute and `description` attribute:
 * `<div data-step label="Account" description="Your details"></div>`
 *
 * @fires bq-step-change - { index: number, label: string }
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release } from '../../utils/component.js';
import { baseStyles, reset, srOnly } from '../../utils/styles.js';

type BqStepperProps = {
  current: number;
  orientation: string;
  clickable: boolean;
  label: string;
};
type BqStepperState = { steps: StepItem[] };

type StepItem = { label: string; description: string; disabled: boolean };

/** Reads the declarative `[data-step]` children into render-ready data. */
export function readSteps(el: Element): StepItem[] {
  return Array.from(el.querySelectorAll('[data-step]')).map((step) => ({
    label:
      step.getAttribute('label') ??
      step.getAttribute('data-step') ??
      step.textContent?.trim() ??
      '',
    description: step.getAttribute('description') ?? '',
    disabled: step.hasAttribute('disabled'),
  }));
}

/** Where a step sits relative to the active one. */
export function stepStatus(
  index: number,
  current: number
): 'complete' | 'current' | 'upcoming' {
  if (index < current) return 'complete';
  if (index === current) return 'current';
  return 'upcoming';
}

const definition: ComponentDefinition<BqStepperProps, BqStepperState> = {
  props: {
    current: { type: Number, default: 0 },
    orientation: { type: String, default: 'horizontal' },
    clickable: { type: Boolean, default: false },
    label: { type: String, default: '' },
  },
  state: {
    steps: [],
  },
  styles: css`
    ${baseStyles}
    ${reset}
    ${srOnly}
    :host { display: block; }
    .stepper { display: flex; font-family: var(--bq-font-family-sans); }
    .stepper[data-orientation="horizontal"] { flex-direction: row; align-items: flex-start; }
    .stepper[data-orientation="vertical"] { flex-direction: column; }

    .step { display: flex; flex: 1 1 0; min-width: 0; gap: 0.625rem; }
    .stepper[data-orientation="horizontal"] .step { flex-direction: column; align-items: center; text-align: center; position: relative; }
    .stepper[data-orientation="vertical"] .step { flex-direction: row; align-items: flex-start; flex: 0 0 auto; padding-bottom: 1.5rem; position: relative; }

    .marker {
      display: inline-flex; align-items: center; justify-content: center;
      width: 2rem; height: 2rem; flex: 0 0 auto;
      border-radius: var(--bq-radius-full,9999px);
      border: 2px solid var(--bq-border-emphasis,#cbd5e1);
      background: var(--bq-bg-base,#fff);
      color: var(--bq-text-muted,#475569);
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-semibold,600);
      line-height: 1;
      transition: background-color var(--bq-duration-fast) var(--bq-easing-standard),
                  border-color var(--bq-duration-fast) var(--bq-easing-standard),
                  color var(--bq-duration-fast) var(--bq-easing-standard);
    }
    .step[data-status="complete"] .marker {
      background: var(--bq-color-primary-600,#2563eb);
      border-color: var(--bq-color-primary-600,#2563eb);
      color: #fff;
    }
    .step[data-status="current"] .marker {
      border-color: var(--bq-color-primary-600,#2563eb);
      color: var(--bq-color-primary-600,#2563eb);
      box-shadow: var(--bq-focus-ring);
    }

    .body { min-width: 0; }
    .label {
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-medium,500);
      color: var(--bq-text-muted,#475569);
    }
    .step[data-status="current"] .label { color: var(--bq-text-base,#0f172a); font-weight: var(--bq-font-weight-semibold,600); }
    .step[data-status="complete"] .label { color: var(--bq-text-base,#0f172a); }
    .description { font-size: var(--bq-font-size-xs,0.75rem); color: var(--bq-text-subtle,#94a3b8); margin-top: 0.125rem; }

    /* Connector between markers. */
    .step:not(:last-child)::after {
      content: ""; background: var(--bq-border-base,#e2e8f0); position: absolute;
    }
    .stepper[data-orientation="horizontal"] .step:not(:last-child)::after {
      top: 1rem; left: calc(50% + 1.25rem); right: calc(-50% + 1.25rem); height: 2px;
    }
    .stepper[data-orientation="vertical"] .step:not(:last-child)::after {
      left: 1rem; top: 2.25rem; bottom: 0.25rem; width: 2px; transform: translateX(-1px);
    }
    .step[data-status="complete"]:not(:last-child)::after { background: var(--bq-color-primary-600,#2563eb); }

    button.step {
      background: none; border: none; padding: 0; font: inherit; color: inherit;
      cursor: pointer; text-align: inherit;
    }
    button.step:disabled { cursor: not-allowed; opacity: 0.55; }
    button.step:focus-visible { outline: 2px solid transparent; box-shadow: var(--bq-focus-ring); border-radius: var(--bq-radius-md,0.375rem); }
    @media (prefers-reduced-motion: reduce) {
      .marker { transition: none; }
    }
  `,
  connected() {
    const self = host<BqStepperState>(this);
    const scope = bind(self);

    const sync = () => {
      const steps = readSteps(self);
      const previous = self.getState<StepItem[]>('steps') ?? [];
      // setState always re-renders; skip when the declarative source is
      // unchanged so a MutationObserver burst cannot loop.
      if (JSON.stringify(previous) === JSON.stringify(steps)) return;
      self.setState('steps', steps);
    };
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(self, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['label', 'description', 'disabled', 'data-step'],
    });
    scope.add(() => observer.disconnect());

    const activate = (index: number) => {
      const steps = self.getState<StepItem[]>('steps') ?? [];
      const step = steps[index];
      if (!step || step.disabled) return;
      self.setAttribute('current', String(index));
      self.dispatchEvent(
        new CustomEvent('bq-step-change', {
          detail: { index, label: step.label },
          bubbles: true,
          composed: true,
        })
      );
    };

    scope.on(self.shadowRoot, 'click', (e) => {
      if (!self.hasAttribute('clickable')) return;
      const button = (e.target as Element).closest(
        'button.step'
      ) as HTMLButtonElement | null;
      if (!button || button.disabled) return;
      activate(Number(button.getAttribute('data-index') ?? '-1'));
    });
  },
  disconnected() {
    release(this);
  },
  render({ props, state }) {
    const steps = state.steps ?? [];
    const current = Number.isFinite(props.current) ? props.current : 0;
    const clickable = props.clickable;
    const listLabel = props.label.trim() || t('stepper.nav');

    const items = steps
      .map((step, index) => {
        const status = stepStatus(index, current);
        const tag = clickable ? 'button' : 'div';
        const statusLabel = t(
          status === 'complete'
            ? 'stepper.completed'
            : status === 'current'
              ? 'stepper.current'
              : 'stepper.upcoming'
        );
        const marker = status === 'complete' ? '✓' : String(index + 1);
        return `
          <${tag}
            class="step"
            part="step"
            data-index="${index}"
            data-status="${status}"
            ${clickable ? 'type="button"' : ''}
            ${clickable && step.disabled ? 'disabled' : ''}
            ${status === 'current' ? 'aria-current="step"' : ''}
          >
            <span class="marker" part="marker" aria-hidden="true">${escapeHtml(marker)}</span>
            <span class="body">
              <span class="label" part="label">${escapeHtml(step.label)}</span>
              <span class="sr-only">${escapeHtml(` (${statusLabel})`)}</span>
              ${step.description ? `<span class="description" part="description">${escapeHtml(step.description)}</span>` : ''}
            </span>
          </${tag}>
        `;
      })
      .join('');

    return html`
      <div
        part="stepper"
        class="stepper"
        role="group"
        aria-label="${escapeHtml(listLabel)}"
        data-orientation="${escapeHtml(props.orientation)}"
      >
        ${items}
      </div>
      <span class="sr-only" role="status" aria-live="polite"
        >${escapeHtml(
          steps.length > 0
            ? t('stepper.stepOf', {
                current: Math.min(current + 1, steps.length),
                total: steps.length,
              })
            : ''
        )}</span
      >
    `;
  },
};

component<BqStepperProps, BqStepperState>('bq-stepper', definition);
