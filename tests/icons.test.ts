// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { beforeAll, afterEach, describe, expect, it } from 'bun:test';
import {
  allIconCss,
  iconCss,
  iconMaskText,
  iconNames,
  iconUrl,
  isIconName,
} from '../src/utils/icons.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('icon set', () => {
  it('exposes a sorted, non-empty catalogue', () => {
    expect(iconNames.length).toBeGreaterThan(30);
    expect([...iconNames]).toEqual([...iconNames].sort());
  });

  it('recognises its own names and rejects others', () => {
    expect(isIconName('check')).toBe(true);
    expect(isIconName('definitely-not-an-icon')).toBe(false);
  });

  it('encodes each icon as a data URI usable inside url()', () => {
    for (const name of iconNames) {
      const url = iconUrl(name);
      expect(url.startsWith('url("data:image/svg+xml,')).toBe(true);
      // A raw <, > or " would terminate the URI or the attribute around it.
      const payload = url.slice('url("'.length, -2);
      expect(payload).not.toContain('<');
      expect(payload).not.toContain('>');
      expect(payload).not.toContain('"');
    }
  });

  it('returns the identical URL for repeated lookups', () => {
    expect(iconUrl('check')).toBe(iconUrl('check'));
  });

  // A mask that fails to parse renders as an empty box, with nothing logged.
  it('decodes back to a well-formed SVG document', () => {
    for (const name of iconNames) {
      const svg = decodeURIComponent(
        iconUrl(name).slice('url("data:image/svg+xml,'.length, -2)
      );
      expect(svg.startsWith('<svg ')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      const opens = (svg.match(/<(?!\/)/g) ?? []).length;
      const closes =
        (svg.match(/\/>/g) ?? []).length + (svg.match(/<\//g) ?? []).length;
      expect(opens).toBe(closes);
    }
  });

  it('emits both the prefixed and unprefixed mask properties', () => {
    const text = iconMaskText('x');
    expect(text).toContain('-webkit-mask-image:');
    expect(text).toContain('mask-image:');
  });

  it('only emits rules for the icons a component asks for', () => {
    const text = iconCss('check', 'x').text;
    expect(text).toContain('.icon[data-icon="check"]');
    expect(text).toContain('.icon[data-icon="x"]');
    expect(text).not.toContain('.icon[data-icon="calendar"]');
  });

  it('drops duplicate names rather than repeating the rule', () => {
    const text = iconCss('check', 'check').text;
    expect(text.split('.icon[data-icon="check"]').length - 1).toBe(1);
  });

  it('emits every icon in the full sheet', () => {
    const text = allIconCss().text;
    for (const name of iconNames) {
      expect(text).toContain(`.icon[data-icon="${name}"]`);
    }
  });

  it('keeps the glyph visible under forced colors', () => {
    expect(iconCss('check').text).toContain('forced-colors: active');
  });
});

describe('bq-icon', () => {
  beforeAll(async () => {
    await import('../src/components/icon/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const create = (attrs: Record<string, string> = {}): HTMLElement => {
    const el = doc.createElement('bq-icon');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    doc.body.appendChild(el);
    return el;
  };

  it('registers as a custom element', () => {
    expect(win.customElements.get('bq-icon')).toBeDefined();
  });

  it('renders the named glyph', async () => {
    const el = create({ name: 'check' });
    await waitForFrame();
    const icon = el.shadowRoot?.querySelector('.icon');
    expect(icon?.getAttribute('data-icon')).toBe('check');
  });

  it('is decorative unless given a label', async () => {
    const el = create({ name: 'trash' });
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('.icon')?.getAttribute('aria-hidden')).toBe(
      'true'
    );

    el.setAttribute('label', 'Delete');
    await waitForFrame();
    const labelled = el.shadowRoot?.querySelector('.icon');
    expect(labelled?.getAttribute('role')).toBe('img');
    expect(labelled?.getAttribute('aria-label')).toBe('Delete');
    expect(labelled?.hasAttribute('aria-hidden')).toBe(false);
  });

  it('renders nothing for an unknown name', async () => {
    const el = create({ name: 'not-an-icon' });
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('[data-icon]')).toBeNull();
  });

  // `size` is the one prop that reaches an inline style, so it is the one that
  // could otherwise close the declaration and inject another.
  it('refuses a size that is not a plain length', async () => {
    const el = create({ name: 'check', size: 'red; background: url(x)' });
    await waitForFrame();
    const icon = el.shadowRoot?.querySelector('.icon');
    expect(icon?.getAttribute('style')).toBeNull();
  });

  it('applies a well-formed size', async () => {
    const el = create({ name: 'check', size: '2rem' });
    await waitForFrame();
    expect(el.shadowRoot?.querySelector('.icon')?.getAttribute('style')).toContain(
      '2rem'
    );
  });
});
