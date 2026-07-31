// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, describe, expect, it } from 'bun:test';
import {
  darkTokens,
  getDarkSchemeCSS,
  getLightSchemeCSS,
  getSchemeRootCSS,
  lightTokens,
} from '../src/theme/scheme.js';
import { installThemeStyles } from '../src/theme/root.js';
import {
  getColorScheme,
  getResolvedColorScheme,
  setColorScheme,
} from '../src/theme/index.js';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('semantic token tables', () => {
  it('defines the same tokens in both schemes', () => {
    for (const name of Object.keys(lightTokens)) {
      expect(darkTokens[name]).toBeDefined();
    }
  });

  it('never lands on the same value for foreground and background', () => {
    expect(lightTokens['--bq-bg-base']).not.toBe(lightTokens['--bq-text-base']);
    expect(darkTokens['--bq-bg-base']).not.toBe(darkTokens['--bq-text-base']);
  });

  it('lifts overlay surfaces off the page in dark mode', () => {
    // In light mode a popup is told apart from the page by its shadow; in dark
    // mode the shadow is invisible, so the surface itself has to be lighter.
    expect(darkTokens['--bq-surface-overlay']).not.toBe(
      darkTokens['--bq-bg-base']
    );
  });
});

describe('getLightSchemeCSS', () => {
  it('routes every semantic token through the scheme channel', () => {
    const css = getLightSchemeCSS();
    for (const name of Object.keys(lightTokens)) {
      const channel = name.replace('--bq-', '--bq-scheme-');
      expect(css).toContain(`${name}: var(${channel},`);
    }
  });

  it('lets the channel drive color-scheme too, so native widgets follow', () => {
    expect(getLightSchemeCSS()).toContain(
      'color-scheme: var(--bq-scheme-color-scheme, light)'
    );
  });
});

describe('getDarkSchemeCSS', () => {
  it('writes literal values, so an explicit theme outranks the ambient one', () => {
    const css = getDarkSchemeCSS();
    expect(css).toContain('--bq-bg-base: #0f172a;');
    expect(css).not.toContain('var(--bq-scheme-bg-base');
  });

  it('strengthens the shadows, which are invisible on a dark surface otherwise', () => {
    expect(getDarkSchemeCSS()).toContain('--bq-shadow-lg:');
  });
});

describe('getSchemeRootCSS', () => {
  const css = getSchemeRootCSS();

  it('handles all three settings from plain CSS', () => {
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('[data-theme="light"]');
    expect(css).toContain('[data-theme="auto"]');
    expect(css).toContain('prefers-color-scheme: dark');
  });

  // The whole point of the channel: a page sets it on an ancestor and it
  // inherits into every shadow root, with no `:host-context` involved.
  it('uses no selector that only Chromium understands', () => {
    expect(css).not.toContain(':host-context');
    expect(css).not.toContain('::part');
  });

  it('is not scoped to the root element, so a themed section works too', () => {
    expect(css).not.toContain(':root[data-theme="dark"]');
  });
});

describe('setColorScheme', () => {
  afterEach(() => {
    doc.documentElement.removeAttribute('data-theme');
  });

  it('records the requested scheme', () => {
    setColorScheme('dark');
    expect(getColorScheme()).toBe('dark');
    expect(doc.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  // Light used to be expressed by *removing* the attribute, which meant a
  // light island inside a dark page was impossible.
  it('marks light explicitly rather than by absence', () => {
    setColorScheme('light');
    expect(doc.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('leaves auto for CSS to resolve instead of a media listener', () => {
    setColorScheme('auto');
    expect(doc.documentElement.getAttribute('data-theme')).toBe('auto');
  });

  it('resolves a pinned scheme without consulting the OS', () => {
    setColorScheme('dark');
    expect(getResolvedColorScheme()).toBe('dark');
    setColorScheme('light');
    expect(getResolvedColorScheme()).toBe('light');
  });
});

describe('installThemeStyles', () => {
  it('is idempotent for a document it has already handled', () => {
    expect(installThemeStyles(doc)).toBe(true);
    expect(installThemeStyles(doc)).toBe(true);
  });
});
