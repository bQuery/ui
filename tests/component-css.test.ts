/**
 * Parses the stylesheet every component actually ships.
 *
 * Component CSS is assembled from template literals and never seen by a
 * compiler, so a stray brace, an unclosed comment or a bad interpolation
 * produces a stylesheet that a browser silently discards from the error
 * onwards — the component simply renders unstyled, with nothing logged.
 *
 * Two components have already been broken by a backtick inside a CSS comment,
 * which terminates the template literal. This runs the real text through a CSS
 * parser so that class of mistake fails here instead of in a screenshot.
 */
import { beforeAll, describe, expect, it } from 'bun:test';
import postcss from 'postcss';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

/** Reads the stylesheet the runtime injected into a component's shadow root. */
function shadowCss(tag: string): string {
  const el = doc.createElement(tag);
  doc.body.appendChild(el);
  const style = el.shadowRoot?.querySelector(
    'style[data-bquery-component-style]'
  );
  const text = style?.textContent ?? '';
  el.remove();
  return text;
}

describe('component stylesheets', () => {
  let tags: string[] = [];

  beforeAll(async () => {
    await import('../src/components/index.js');
    // happy-dom has no Constructable Stylesheets, so the runtime falls back to
    // a <style> element — which is exactly the text we want to read.
    tags = Array.from(
      new Set(
        [
          'accordion', 'alert', 'avatar', 'avatar-group', 'badge', 'banner',
          'breadcrumbs', 'button', 'button-group', 'card', 'checkbox', 'chip',
          'combobox', 'copy-button', 'date-picker', 'dialog', 'divider',
          'drawer', 'dropdown-menu', 'empty-state', 'file-upload', 'icon',
          'icon-button', 'input', 'kbd', 'meter', 'number-input', 'pagination',
          'pin-input', 'popover', 'progress', 'radio', 'rating',
          'segmented-control', 'select', 'skeleton', 'slider', 'spinner',
          'stat-card', 'stepper', 'switch', 'table', 'tabs', 'tag-input',
          'textarea', 'timeline', 'toast', 'tooltip', 'tree',
        ].map((name) => `bq-${name}`)
      )
    );
  });

  it('covers every registered component', () => {
    for (const tag of tags) {
      expect(win.customElements.get(tag)).toBeDefined();
    }
  });

  it('emits CSS that parses', () => {
    const broken: string[] = [];
    for (const tag of tags) {
      const css = shadowCss(tag);
      if (!css) {
        broken.push(`${tag}: no stylesheet`);
        continue;
      }
      try {
        postcss.parse(css, { from: `${tag}.css` });
      } catch (error) {
        broken.push(`${tag}: ${(error as Error).message}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('leaves no unresolved template interpolation in the output', () => {
    const broken: string[] = [];
    for (const tag of tags) {
      // `${…}` surviving into the CSS means a fragment was interpolated as a
      // plain string and escaped, or a helper returned undefined.
      if (/\$\{/.test(shadowCss(tag))) broken.push(tag);
    }
    expect(broken).toEqual([]);
  });

  it('escapes nothing that would corrupt a declaration', () => {
    const broken: string[] = [];
    for (const tag of tags) {
      const css = shadowCss(tag);
      // `css` HTML-escapes interpolated *strings*; a fragment that arrived as
      // one instead of as ComponentStyles shows up as an entity.
      if (/&(?:quot|amp|lt|gt|#x27|#x60);/.test(css)) broken.push(tag);
    }
    expect(broken).toEqual([]);
  });

  it('carries the token block and the dark scheme into every component', () => {
    for (const tag of tags) {
      const css = shadowCss(tag);
      expect(css).toContain('--bq-color-primary-600');
      expect(css).toContain(':host([data-theme="dark"])');
    }
  });
});
