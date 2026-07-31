/**
 * Avatar group component — overlapping avatars with an overflow counter.
 * @element bq-avatar-group
 * @prop {number} max     - Maximum avatars to show before collapsing into "+N" (0 = show all)
 * @prop {string} size    - xs | sm | md | lg | xl — forwarded to slotted avatars
 * @prop {string} spacing - tight | normal | loose
 * @prop {string} label   - Accessible label for the group
 * @slot - `bq-avatar` elements
 * @fires bq-overflow-click - { hidden: number }
 */
import { component, css, html } from '@bquery/bquery/component';
import type { ComponentDefinition } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { t } from '../../i18n/index.js';
import { bind, host, release } from '../../utils/component.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqAvatarGroupProps = {
  max: number;
  size: string;
  spacing: string;
  label: string;
};

/**
 * Reconciles the slotted avatars with the `max`/`size` props.
 *
 * The avatars live in the light DOM and belong to the host page, so overflow
 * is applied by hiding them in place rather than by moving nodes. The counter
 * lives in the shadow root but depends on that light-DOM count, which `render`
 * cannot see — so it is written here.
 */
function syncGroup(el: HTMLElement): void {
  const max = Number(el.getAttribute('max') ?? '0');
  const size = el.getAttribute('size')?.trim();
  const children = Array.from(el.children);

  children.forEach((child, index) => {
    if (size) child.setAttribute('size', size);
    const hidden = max > 0 && index >= max;
    if (hidden) child.setAttribute('data-bq-overflow-hidden', '');
    else child.removeAttribute('data-bq-overflow-hidden');
    (child as HTMLElement).style.display = hidden ? 'none' : '';
  });

  const hiddenCount = max > 0 ? Math.max(0, children.length - max) : 0;
  const overflow = el.shadowRoot?.querySelector('.overflow');
  if (!overflow) return;
  if (hiddenCount > 0) {
    overflow.removeAttribute('hidden');
    overflow.textContent = `+${hiddenCount}`;
    overflow.setAttribute(
      'aria-label',
      t('avatarGroup.overflow', { count: hiddenCount })
    );
  } else {
    overflow.setAttribute('hidden', '');
    overflow.textContent = '';
    overflow.removeAttribute('aria-label');
  }
}

const definition: ComponentDefinition<BqAvatarGroupProps> = {
  props: {
    max: { type: Number, default: 0 },
    size: { type: String, default: '' },
    spacing: { type: String, default: 'normal' },
    label: { type: String, default: '' },
  },
  styles: css`
    ${baseStyles}
    ${reset}
    :host { display: inline-flex; }
    .group { display: inline-flex; align-items: center; }
    .group[data-spacing="tight"]  ::slotted(*:not(:first-child)) { margin-left: -0.75rem; }
    .group[data-spacing="normal"] ::slotted(*:not(:first-child)) { margin-left: -0.5rem; }
    .group[data-spacing="loose"]  ::slotted(*:not(:first-child)) { margin-left: -0.25rem; }
    ::slotted(*) {
      border-radius: var(--bq-radius-full,9999px);
      box-shadow: 0 0 0 2px var(--bq-bg-base,#fff);
    }
    /* Lift the hovered avatar above the ones stacked on top of it. */
    ::slotted(*:hover) { z-index: 1; }
    .overflow {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: var(--bq-radius-full,9999px);
      background: var(--bq-bg-emphasis,#e2e8f0);
      color: var(--bq-text-muted,#475569);
      font-family: var(--bq-font-family-sans);
      font-weight: var(--bq-font-weight-semibold,600);
      box-shadow: 0 0 0 2px var(--bq-bg-base,#fff);
    }
    .overflow[hidden] { display: none; }
    .group[data-spacing="tight"]  .overflow { margin-left: -0.75rem; }
    .group[data-spacing="normal"] .overflow { margin-left: -0.5rem; }
    .group[data-spacing="loose"]  .overflow { margin-left: -0.25rem; }
    .overflow[data-size="xs"] { width: 1.5rem;  height: 1.5rem;  font-size: 0.625rem; }
    .overflow[data-size="sm"] { width: 2rem;    height: 2rem;    font-size: 0.6875rem; }
    .overflow[data-size="md"] { width: 2.5rem;  height: 2.5rem;  font-size: 0.75rem; }
    .overflow[data-size="lg"] { width: 3rem;    height: 3rem;    font-size: 0.875rem; }
    .overflow[data-size="xl"] { width: 4rem;    height: 4rem;    font-size: 1rem; }
  `,
  connected() {
    const self = host(this);
    const scope = bind(self);

    const observer = new MutationObserver(() => syncGroup(self));
    observer.observe(self, { childList: true });
    scope.add(() => observer.disconnect());
    scope.frame(() => syncGroup(self));

    scope.on(self.shadowRoot, 'click', (e) => {
      if (!(e.target as Element).closest('.overflow')) return;
      const max = Number(self.getAttribute('max') ?? '0');
      const hidden = max > 0 ? Math.max(0, self.children.length - max) : 0;
      self.dispatchEvent(
        new CustomEvent('bq-overflow-click', {
          detail: { hidden },
          bubbles: true,
          composed: true,
        })
      );
    });
  },
  disconnected() {
    release(this);
  },
  updated() {
    syncGroup(this);
  },
  render({ props }) {
    const label = props.label.trim() || t('avatarGroup.label');
    const size = props.size || 'md';
    return html`
      <div
        part="group"
        class="group"
        role="group"
        aria-label="${escapeHtml(label)}"
        data-spacing="${escapeHtml(props.spacing)}"
      >
        <slot></slot>
        <span
          class="overflow"
          part="overflow"
          data-size="${escapeHtml(size)}"
          hidden
        ></span>
      </div>
    `;
  },
};

component<BqAvatarGroupProps>('bq-avatar-group', definition);
