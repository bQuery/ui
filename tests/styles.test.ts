import { describe, expect, it } from 'bun:test';
import { isComponentStyles } from '@bquery/bquery/component';
import {
  baseStyles,
  focusVisible,
  focusVisibleStyles,
  getBaseStyles,
  rawCss,
  reset,
  srOnly,
  srOnlyStyles,
} from '../src/utils/styles.js';

describe('style payloads', () => {
  it('exposes the shared fragments as ComponentStyles payloads', () => {
    for (const payload of [baseStyles, focusVisible, srOnly, reset]) {
      expect(isComponentStyles(payload)).toBe(true);
    }
  });

  it('keeps the string exports in sync with the css payloads', () => {
    expect(baseStyles.text).toBe(getBaseStyles());
    expect(focusVisible.text).toBe(focusVisibleStyles);
    expect(srOnly.text).toBe(srOnlyStyles);
  });

  it('round-trips CSS through rawCss without escaping', () => {
    // `css` escapes interpolated *values*; rawCss must pass trusted CSS text
    // through verbatim or every composed stylesheet would be corrupted.
    const source = `.a { content: "x"; font-family: 'y'; }\n@media (min-width: 10px) { .b { color: red; } }`;
    expect(rawCss(source).text).toBe(source);
  });

  it('preserves braces, quotes and semicolons when composed into a css template', () => {
    const composed = rawCss(`${baseStyles.text}`);
    expect(composed.text).toContain('{');
    expect(composed.text).toContain('}');
    expect(composed.text).toContain(';');
    expect(composed.text).not.toContain('\\7b');
  });

  it('produces an adoptable stylesheet when the environment supports it', () => {
    // happy-dom does not ship Constructable Stylesheets, so stand one up to
    // prove the payloads take the shared-stylesheet path in real browsers
    // rather than the per-instance <style> fallback.
    const g = globalThis as unknown as Record<string, unknown>;
    const original = g['CSSStyleSheet'];
    class FakeSheet {
      cssText = '';
      replaceSync(text: string): void {
        this.cssText = text;
      }
    }
    g['CSSStyleSheet'] = FakeSheet;
    try {
      const payload = rawCss('.adoptable { color: red; }');
      const sheet = payload.toAdoptableSheet();
      expect(sheet).not.toBeNull();
      expect((sheet as unknown as FakeSheet).cssText).toBe(payload.text);
      // Repeated construction for identical text reuses one shared sheet.
      expect(rawCss('.adoptable { color: red; }').toAdoptableSheet()).toBe(sheet);
    } finally {
      if (original === undefined) delete g['CSSStyleSheet'];
      else g['CSSStyleSheet'] = original;
    }
  });

  it('emits the token block and both color schemes exactly once', () => {
    const text = baseStyles.text;
    expect(text).toContain('--bq-color-primary-600');
    expect(text).toContain('--bq-bg-base: #ffffff');
    expect(text).toContain('[data-theme="dark"]');
  });
});
