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
    expect(text).toContain('[data-theme="dark"]');
  });

  // A component defines the semantic tokens on its own `:host`, and a value set
  // on the element always beats one inherited from an ancestor. Routing them
  // through `--bq-scheme-*` — which is never defined on the host — is what lets
  // a page re-theme components from the document.
  it('resolves semantic tokens through the scheme channel', () => {
    expect(baseStyles.text).toContain(
      '--bq-bg-base: var(--bq-scheme-bg-base, #ffffff)'
    );
    expect(baseStyles.text).toContain(
      'color-scheme: var(--bq-scheme-color-scheme, light)'
    );
  });

  // `:host-context()` only exists in Chromium, and it set the dark tokens as
  // literals: there it beat a page's own `--bq-scheme-*` palette, elsewhere
  // it did nothing (issue #27). An ancestor's `data-theme` now reaches the
  // component only through the scheme channel, the same way in every engine.
  it('emits no :host-context rule; dark literals apply only to an explicitly dark host', () => {
    expect(baseStyles.text).not.toContain(':host-context');
    expect(baseStyles.text).toContain(':host([data-theme="dark"]) {');
  });
});
