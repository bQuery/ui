/**
 * Segmented control for single-choice view and filter toggles.
 * @element bq-segmented-control
 * @prop {string} label
 * @prop {string} hint
 * @prop {string} name
 * @prop {string} value
 * @prop {string} size       - sm | md | lg
 * @prop {boolean} full-width
 * @prop {boolean} disabled
 * @prop {string} aria-label - Accessible label when no visible label is rendered
 * @slot - Segment buttons (use <button value="...">Label</button>)
 * @fires bq-change - { value: string }
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { uniqueId } from '../../utils/dom.js';
import { createFormProxy, type FormProxy } from '../../utils/form.js';
import { getBaseStyles } from '../../utils/styles.js';

type BqSegmentedControlProps = {
  label: string;
  hint: string;
  name: string;
  value: string;
  size: string;
  'full-width': boolean;
  disabled: boolean;
  'aria-label': string;
};

type BqSegmentedControlState = {
  uid: string;
};

const definition: ComponentDefinition<
  BqSegmentedControlProps,
  BqSegmentedControlState
> = {
  props: {
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    name: { type: String, default: '' },
    value: { type: String, default: '' },
    size: { type: String, default: 'md' },
    'full-width': { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    'aria-label': { type: String, default: '' },
  },
  state: {
    uid: '',
  },
  styles: `
    ${getBaseStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :host { display: block; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; }
    .label {
      font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-medium,500);
      color: var(--bq-text-base,#0f172a);
      line-height: 1.5;
    }
    .control {
      display: inline-flex;
      align-items: stretch;
      gap: 0.25rem;
      width: fit-content;
      min-width: 0;
      padding: 0.25rem;
      border: 1px solid var(--bq-border-base,#e2e8f0);
      border-radius: var(--bq-radius-xl,0.75rem);
      background: var(--bq-bg-subtle,#f8fafc);
      min-height: 2.75rem;
    }
    :host([full-width]) .control {
      display: flex;
      width: 100%;
    }
    :host([disabled]) .control {
      opacity: 0.7;
    }
    .hint {
      font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-sm,0.875rem);
      color: var(--bq-text-muted,#475569);
      line-height: 1.5;
    }
    ::slotted(button) {
      appearance: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      min-height: 2.25rem;
      min-width: 2.75rem;
      padding: 0.5rem 0.875rem;
      border: none;
      border-radius: var(--bq-radius-lg,0.5rem);
      background: transparent;
      color: var(--bq-text-muted,#475569);
      font-family: var(--bq-font-family-sans);
      font-size: var(--bq-font-size-sm,0.875rem);
      font-weight: var(--bq-font-weight-medium,500);
      line-height: 1.25;
      text-align: center;
      white-space: nowrap;
      cursor: pointer;
      transition:
        background var(--bq-duration-fast,150ms) var(--bq-easing-standard),
        color var(--bq-duration-fast,150ms) var(--bq-easing-standard),
        box-shadow var(--bq-duration-fast,150ms) var(--bq-easing-standard);
    }
    :host([size="sm"]) ::slotted(button) {
      min-height: 2rem;
      padding: 0.375rem 0.75rem;
      font-size: var(--bq-font-size-xs,0.75rem);
    }
    :host([size="lg"]) ::slotted(button) {
      min-height: 2.75rem;
      padding: 0.625rem 1rem;
      font-size: var(--bq-font-size-md,1rem);
    }
    :host([full-width]) ::slotted(button) {
      flex: 1 1 0;
      min-width: 0;
    }
    ::slotted(button:hover:not(:disabled):not([aria-disabled="true"]):not([data-selected="true"])) {
      color: var(--bq-text-base,#0f172a);
      background: var(--bq-bg-muted,#f1f5f9);
    }
    ::slotted(button[data-selected="true"]) {
      background: var(--bq-bg-base,#ffffff);
      color: var(--bq-color-primary-600,#2563eb);
      box-shadow: var(--bq-shadow-sm);
    }
    ::slotted(button:focus-visible) {
      outline: 2px solid transparent;
      box-shadow: var(--bq-focus-ring);
    }
    ::slotted(button:disabled),
    ::slotted(button[aria-disabled="true"]) {
      opacity: 0.5;
      cursor: not-allowed;
    }
    @media (prefers-reduced-motion: reduce) {
      ::slotted(button) { transition: none; }
    }
  `,
  connected() {
    type BQEl = HTMLElement & {
      setState(key: 'uid', value: string): void;
      getState<T>(key: string): T;
    };

    const self = this as unknown as BQEl & Record<string, unknown>;

    if (!self.getState<string>('uid')) {
      self.setState('uid', uniqueId('bq-segmented'));
    }

    const proxy = createFormProxy(
      self,
      self.getAttribute('name') ?? '',
      self.getAttribute('value') ?? '',
      self.hasAttribute('disabled')
    );
    self['_formProxy'] = proxy;

    const getButtons = (): HTMLButtonElement[] => {
      const slot = self.shadowRoot?.querySelector(
        'slot:not([name])'
      ) as HTMLSlotElement | null;
      if (!slot) return [];
      return slot
        .assignedElements({ flatten: true })
        .filter(
          (element): element is HTMLButtonElement =>
            element instanceof HTMLElement && element.tagName === 'BUTTON'
        );
    };

    const getButtonValue = (button: HTMLButtonElement): string =>
      button.getAttribute('value') ||
      button.getAttribute('data-value') ||
      button.textContent?.trim() ||
      '';

    const isButtonDisabled = (button: HTMLButtonElement): boolean =>
      self.hasAttribute('disabled') ||
      button.disabled ||
      button.getAttribute('aria-disabled') === 'true';

    const ensureSelectedValue = (): string => {
      const buttons = getButtons();
      const currentValue = self.getAttribute('value') ?? '';
      const selectedButton = buttons.find(
        (button) =>
          !isButtonDisabled(button) && getButtonValue(button) === currentValue
      );
      if (selectedButton) return currentValue;

      const fallbackButton = buttons.find((button) => !isButtonDisabled(button));
      const fallbackValue = fallbackButton ? getButtonValue(fallbackButton) : '';

      if (fallbackValue && fallbackValue !== currentValue) {
        self.setAttribute('value', fallbackValue);
      } else if (!fallbackValue && currentValue) {
        self.removeAttribute('value');
      }

      return fallbackValue;
    };

    const syncButtons = () => {
      const buttons = getButtons();
      const selectedValue = ensureSelectedValue();
      const enabledButtons = buttons.filter((button) => !isButtonDisabled(button));
      const focusValue =
        selectedValue || (enabledButtons[0] ? getButtonValue(enabledButtons[0]) : '');

      buttons.forEach((button) => {
        const value = getButtonValue(button);
        const disabled = isButtonDisabled(button);
        const selected = value !== '' && value === selectedValue;

        if (!button.hasAttribute('type')) {
          button.setAttribute('type', 'button');
        }

        button.setAttribute('role', 'radio');
        button.setAttribute('aria-checked', selected ? 'true' : 'false');
        button.setAttribute('aria-disabled', disabled ? 'true' : 'false');

        if (selected) {
          button.setAttribute('data-selected', 'true');
        } else {
          button.removeAttribute('data-selected');
        }

        button.setAttribute(
          'tabindex',
          !disabled && value === focusValue ? '0' : '-1'
        );

        button.removeEventListener('keydown', keyHandler);
        button.addEventListener('keydown', keyHandler);
      });

      proxy.setName(self.getAttribute('name') ?? '');
      proxy.setValue(selectedValue);
      proxy.setDisabled(self.hasAttribute('disabled'));
    };

    const selectButton = (
      button: HTMLButtonElement,
      options: { focus?: boolean; emit?: boolean } = {}
    ) => {
      if (isButtonDisabled(button)) return;

      const nextValue = getButtonValue(button);
      if (!nextValue) return;

      const previousValue = self.getAttribute('value') ?? '';
      if (nextValue !== previousValue) {
        self.setAttribute('value', nextValue);
        syncButtons();

        if (options.emit !== false) {
          self.dispatchEvent(
            new CustomEvent('bq-change', {
              detail: { value: nextValue },
              bubbles: true,
              composed: true,
            })
          );
        }
      } else {
        syncButtons();
      }

      if (options.focus) {
        button.focus();
      }
    };

    const moveSelection = (
      currentButton: HTMLButtonElement,
      direction: 'next' | 'prev' | 'first' | 'last'
    ) => {
      const enabledButtons = getButtons().filter(
        (button) => !isButtonDisabled(button)
      );
      if (enabledButtons.length === 0) return;

      let nextButton: HTMLButtonElement | null;

      if (direction === 'first') {
        nextButton = enabledButtons[0] ?? null;
      } else if (direction === 'last') {
        nextButton = enabledButtons[enabledButtons.length - 1] ?? null;
      } else {
        const currentIndex = enabledButtons.indexOf(currentButton);
        if (currentIndex === -1) {
          nextButton = enabledButtons[0] ?? null;
        } else if (direction === 'next') {
          nextButton =
            enabledButtons[(currentIndex + 1) % enabledButtons.length] ?? null;
        } else {
          nextButton =
            enabledButtons[
              (currentIndex - 1 + enabledButtons.length) % enabledButtons.length
            ] ?? null;
        }
      }

      if (!nextButton) return;
      selectButton(nextButton, { focus: true });
    };

    const clickHandler = (event: Event) => {
      const target = event.target as Element | null;
      const button = target?.closest('button') as HTMLButtonElement | null;
      if (!button || !getButtons().includes(button)) return;

      selectButton(button);
    };

    const keyHandler = (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      const target = event.target as Element | null;
      const button = target?.closest('button') as HTMLButtonElement | null;
      if (!button || !getButtons().includes(button)) return;

      const isRtl = getComputedStyle(self).direction === 'rtl';

      switch (keyboardEvent.key) {
        case 'ArrowRight':
          keyboardEvent.preventDefault();
          moveSelection(button, isRtl ? 'prev' : 'next');
          break;
        case 'ArrowLeft':
          keyboardEvent.preventDefault();
          moveSelection(button, isRtl ? 'next' : 'prev');
          break;
        case 'ArrowDown':
          keyboardEvent.preventDefault();
          moveSelection(button, 'next');
          break;
        case 'ArrowUp':
          keyboardEvent.preventDefault();
          moveSelection(button, 'prev');
          break;
        case 'Home':
          keyboardEvent.preventDefault();
          moveSelection(button, 'first');
          break;
        case 'End':
          keyboardEvent.preventDefault();
          moveSelection(button, 'last');
          break;
        case 'Enter':
        case ' ':
          keyboardEvent.preventDefault();
          selectButton(button, { focus: true });
          break;
      }
    };

    const slotChangeHandler = () => {
      syncButtons();
    };

    const observer = new MutationObserver(() => {
      syncButtons();
    });
    observer.observe(self, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['disabled', 'value', 'data-value'],
    });

    self['_syncButtons'] = syncButtons;
    self['_clickHandler'] = clickHandler;
    self['_keyHandler'] = keyHandler;
    self['_slotChangeHandler'] = slotChangeHandler;
    self['_observer'] = observer;

    self.addEventListener('click', clickHandler);
    self.shadowRoot
      ?.querySelector('slot:not([name])')
      ?.addEventListener('slotchange', slotChangeHandler);

    requestAnimationFrame(syncButtons);
  },
  disconnected() {
    const self = this as unknown as Record<string, unknown>;

    const clickHandler = self['_clickHandler'] as EventListener | undefined;
    const keyHandler = self['_keyHandler'] as EventListener | undefined;
    const slotChangeHandler = self['_slotChangeHandler'] as
      | EventListener
      | undefined;
    const observer = self['_observer'] as MutationObserver | undefined;
    const proxy = self['_formProxy'] as FormProxy | undefined;

    if (clickHandler) this.removeEventListener('click', clickHandler);
    if (keyHandler) {
      const buttons = this.querySelectorAll('button');
      buttons.forEach((button) => button.removeEventListener('keydown', keyHandler));
    }
    if (slotChangeHandler) {
      this.shadowRoot
        ?.querySelector('slot:not([name])')
        ?.removeEventListener('slotchange', slotChangeHandler);
    }

    observer?.disconnect();
    proxy?.cleanup();
  },
  updated() {
    const syncButtons = (this as unknown as Record<string, unknown>)['_syncButtons'] as
      | (() => void)
      | undefined;
    syncButtons?.();
  },
  render({ props, state }) {
    const uid = state.uid || 'bq-segmented';
    const labelId = `${uid}-label`;
    const hintId = `${uid}-hint`;

    const labelAttribute = props.label
      ? `aria-labelledby="${labelId}"`
      : props['aria-label']
        ? `aria-label="${escapeHtml(props['aria-label'])}"`
        : '';

    const descriptionAttribute = props.hint
      ? `aria-describedby="${hintId}"`
      : '';

    return html`
      <div class="field" part="field">
        ${props.label
          ? `<div class="label" id="${labelId}" part="label">${escapeHtml(props.label)}</div>`
          : ''}
        <div
          class="control"
          part="control"
          role="radiogroup"
          ${labelAttribute}
          ${descriptionAttribute}
        >
          <slot></slot>
        </div>
        ${props.hint
          ? `<div class="hint" id="${hintId}" part="hint">${escapeHtml(props.hint)}</div>`
          : ''}
      </div>
    `;
  },
};

component<BqSegmentedControlProps, BqSegmentedControlState>(
  'bq-segmented-control',
  definition
);
