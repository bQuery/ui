/**
 * Icon component — renders one glyph from the built-in set.
 *
 * The icon is drawn as a CSS mask filled with `currentColor`, so it inherits
 * the surrounding text colour and scales with `font-size` by default. That
 * also means it is a single path at any zoom or pixel density, unlike the
 * text glyphs (`✓`, `×`, `▾`) this library used before, whose weight and
 * baseline were up to whichever font the platform happened to pick.
 *
 * ```html
 * <bq-icon name="check"></bq-icon>
 * <bq-icon name="trash" size="1.5rem" label="Delete"></bq-icon>
 * ```
 *
 * Decorative by default (`aria-hidden`). Pass `label` when the icon *is* the
 * content — an icon-only button with no other text — and it becomes an
 * `img`-role element with an accessible name instead.
 *
 * @element bq-icon
 * @prop {string} name  - Icon name; see `iconNames`
 * @prop {string} size  - Any CSS length; defaults to `1em`
 * @prop {string} label - Accessible name. Omit for decorative icons.
 * @cssprop --bq-icon-size - Alternative to the `size` prop
 */
import type { ComponentDefinition } from '@bquery/bquery/component';
import { component, css, html } from '@bquery/bquery/component';
import { escapeHtml } from '@bquery/bquery/security';
import { allIconCss, isIconName } from '../../utils/icons.js';
import { baseStyles, reset } from '../../utils/styles.js';

type BqIconProps = { name: string; size: string; label: string };

/**
 * Rejects anything that is not a plain CSS length or keyword.
 *
 * `size` lands in an inline style, so it is the one prop that could otherwise
 * carry `)` or `;` out of an attribute value and into the rest of the
 * declaration block.
 */
function safeSize(value: string): string {
  const trimmed = value.trim();
  return /^[0-9a-zA-Z.%\-\s]*$/.test(trimmed) ? trimmed : '';
}

const definition: ComponentDefinition<BqIconProps> = {
  props: {
    name: { type: String, default: '' },
    size: { type: String, default: '' },
    label: { type: String, default: '' },
  },
  sanitize: { allowAttributes: ['style'] },
  styles: css`
    ${baseStyles}
    ${reset}
    ${allIconCss()}
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      /* Nudges the glyph onto the text baseline it sits next to; without it an
         icon in a sentence rides slightly high. */
      vertical-align: -0.125em;
    }
    .icon { display: block; }
  `,
  render({ props }) {
    const name = isIconName(props.name) ? props.name : '';
    if (!name) return html`<span></span>`;
    const size = safeSize(props.size);
    const label = props.label.trim();
    return html`
      <span
        class="icon"
        part="icon"
        data-icon="${escapeHtml(name)}"
        ${size ? `style="--bq-icon-size: ${escapeHtml(size)}"` : ''}
        ${
          label
            ? `role="img" aria-label="${escapeHtml(label)}"`
            : 'aria-hidden="true"'
        }
      ></span>
    `;
  },
};

component<BqIconProps>('bq-icon', definition);
