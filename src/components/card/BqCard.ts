import { getBaseStyles } from '../../utils/styles.js';

/**
 * Card component.
 * @element bq-card
 *
 * @prop {string} shadow  - none | sm | md | lg
 * @prop {string} radius  - none | sm | md | lg | xl
 * @prop {boolean} bordered
 * @prop {boolean} interactive - adds hover styles
 *
 * @slot - Card body content
 * @slot header - Card header
 * @slot footer - Card footer
 */
export class BqCard extends HTMLElement {
  static get observedAttributes() {
    return ['shadow', 'radius', 'bordered', 'interactive'];
  }

  private _shadow: ShadowRoot;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  private _render() {
    const shadow = this.getAttribute('shadow') ?? 'md';
    const radius = this.getAttribute('radius') ?? 'xl';
    const bordered = this.hasAttribute('bordered');
    const interactive = this.hasAttribute('interactive');

    const shadowMap: Record<string, string> = {
      none: 'none',
      sm: 'var(--bq-shadow-sm)',
      md: 'var(--bq-shadow-md)',
      lg: 'var(--bq-shadow-lg)',
    };
    const radiusMap: Record<string, string> = {
      none: '0',
      sm: 'var(--bq-radius-sm)',
      md: 'var(--bq-radius-md)',
      lg: 'var(--bq-radius-lg)',
      xl: 'var(--bq-radius-xl)',
    };

    const styles = `
      ${getBaseStyles()}
      *, *::before, *::after { box-sizing: border-box; }
      :host { display: block; }

      .card {
        background-color: var(--bq-bg-base, #fff);
        border-radius: ${radiusMap[radius] ?? radiusMap['xl']};
        box-shadow: ${shadowMap[shadow] ?? shadowMap['md']};
        border: ${bordered ? '1.5px solid var(--bq-border-base, #e2e8f0)' : 'none'};
        overflow: hidden;
        transition: box-shadow var(--bq-duration-fast) var(--bq-easing-standard),
                    transform var(--bq-duration-fast) var(--bq-easing-standard);
      }

      ${interactive ? `
      .card:hover {
        box-shadow: var(--bq-shadow-lg);
        transform: translateY(-1px);
        cursor: pointer;
      }
      ` : ''}

      .card__header {
        padding: var(--bq-space-4, 1rem) var(--bq-space-6, 1.5rem);
        border-bottom: 1px solid var(--bq-border-base, #e2e8f0);
      }
      .card__header:empty { display: none; }

      .card__body {
        padding: var(--bq-space-6, 1.5rem);
      }

      .card__footer {
        padding: var(--bq-space-4, 1rem) var(--bq-space-6, 1.5rem);
        border-top: 1px solid var(--bq-border-base, #e2e8f0);
        background-color: var(--bq-bg-subtle, #f8fafc);
      }
      .card__footer:empty { display: none; }
    `;

    this._shadow.innerHTML = `
      <style>${styles}</style>
      <div part="card" class="card">
        <div part="header" class="card__header"><slot name="header"></slot></div>
        <div part="body" class="card__body"><slot></slot></div>
        <div part="footer" class="card__footer"><slot name="footer"></slot></div>
      </div>
    `;
  }
}

export function registerBqCard(prefix = 'bq'): string {
  const tag = `${prefix}-card`;
  if (!customElements.get(tag)) customElements.define(tag, BqCard);
  return tag;
}
