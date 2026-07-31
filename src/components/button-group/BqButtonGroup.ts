/**
 * Button group component — joins related buttons into a single control.
 * @element bq-button-group
 * @prop {string}  orientation - horizontal | vertical
 * @prop {string}  size        - sm | md | lg — forwarded to slotted bq-button elements
 * @prop {boolean} attached    - Collapse the gap so buttons share borders
 * @prop {string}  label       - Accessible label for the group
 * @slot - Buttons (`bq-button`, `bq-icon-button` or native `button`)
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release } from '../../utils/component.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqButtonGroupProps = {
  orientation: string;
  size: string;
  attached: boolean;
  label: string;
};

const definition: ComponentDefinition<BqButtonGroupProps> = {
  props: {
    orientation: { type: String, default: 'horizontal' },
    size: { type: String, default: '' },
    attached: { type: Boolean, default: false },
    label: { type: String, default: '' },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: inline-flex; }
    .group { display: inline-flex; gap: 0.5rem; }
    .group[data-orientation="vertical"] { flex-direction: column; }
    :host([attached]) .group { gap: 0; }

    /* Attached groups share borders: only the outer edges stay rounded. */
    :host([attached]) ::slotted(*) { --bq-radius-lg: 0; --bq-radius-md: 0; }
    :host([attached]) .group[data-orientation="horizontal"] ::slotted(*:first-child) {
      --bq-radius-lg: 0.5rem 0 0 0.5rem; --bq-radius-md: 0.375rem 0 0 0.375rem;
    }
    :host([attached]) .group[data-orientation="horizontal"] ::slotted(*:last-child) {
      --bq-radius-lg: 0 0.5rem 0.5rem 0; --bq-radius-md: 0 0.375rem 0.375rem 0;
    }
    :host([attached]) .group[data-orientation="vertical"] ::slotted(*:first-child) {
      --bq-radius-lg: 0.5rem 0.5rem 0 0; --bq-radius-md: 0.375rem 0.375rem 0 0;
    }
    :host([attached]) .group[data-orientation="vertical"] ::slotted(*:last-child) {
      --bq-radius-lg: 0 0 0.5rem 0.5rem; --bq-radius-md: 0 0 0.375rem 0.375rem;
    }
    :host([attached]) .group[data-orientation="horizontal"] ::slotted(*:not(:first-child)) { margin-left: -1.5px; }
    :host([attached]) .group[data-orientation="vertical"] ::slotted(*:not(:first-child)) { margin-top: -1.5px; }
    /* Keep the focused button's ring above its neighbours' borders. */
    ::slotted(*:focus-within) { position: relative; z-index: 1; }
  `,
  connected() {
    const self = host(this);
    const scope = bind(self);

    // `size` is a convenience: set it once on the group instead of on every
    // child. An explicit size on a child always wins.
    const syncSize = () => {
      const size = self.getAttribute('size')?.trim();
      for (const child of Array.from(self.children)) {
        if (!size) {
          if (child.getAttribute('data-bq-group-size') === child.getAttribute('size'))
            child.removeAttribute('size');
          child.removeAttribute('data-bq-group-size');
          continue;
        }
        const own = child.getAttribute('size');
        if (own && child.getAttribute('data-bq-group-size') !== own) continue;
        child.setAttribute('size', size);
        child.setAttribute('data-bq-group-size', size);
      }
    };

    const observer = new MutationObserver(syncSize);
    observer.observe(self, { childList: true });
    scope.add(() => observer.disconnect());
    scope.frame(syncSize);
  },
  disconnected() {
    release(this);
  },
  updated() {
    const self = host(this);
    const size = self.getAttribute('size')?.trim();
    if (!size) return;
    for (const child of Array.from(self.children)) {
      const own = child.getAttribute('size');
      if (own && child.getAttribute('data-bq-group-size') !== own) continue;
      child.setAttribute('size', size);
      child.setAttribute('data-bq-group-size', size);
    }
  },
  render({ props }) {
    const label = props.label.trim() || t('buttonGroup.defaultLabel');
    return html`
      <div
        part="group"
        class="group"
        role="group"
        aria-label="${escapeHtml(label)}"
        data-orientation="${escapeHtml(props.orientation)}"
      >
        <slot></slot>
      </div>
    `;
  },
};

component<BqButtonGroupProps>('bq-button-group', definition);
