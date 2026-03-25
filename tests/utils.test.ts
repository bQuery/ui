import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { cn } from '../src/utils/cn.js';
import { getAnimationTimeoutMs } from '../src/utils/dom.js';
import { setLocale, getLocale, resetLocale, t } from '../src/i18n/index.js';
import { en } from '../src/i18n/en.js';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window &
  typeof globalThis;
const doc = win.document as unknown as Document;

describe('cn utility', () => {
  it('should join string classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should filter falsy values', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('should handle conditional object', () => {
    expect(cn({ active: true, hidden: false })).toBe('active');
  });

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('should handle nested arrays', () => {
    expect(cn([['a', 'b'], 'c'])).toBe('a b c');
  });

  it('should return empty string for no args', () => {
    expect(cn()).toBe('');
  });
});

describe('i18n system', () => {
  beforeEach(() => {
    resetLocale();
  });

  it('should return default locale', () => {
    const locale = getLocale();
    expect(locale.dialog.close).toBe('Close dialog');
  });

  it('should translate dot-notation key', () => {
    expect(t('dialog.close')).toBe('Close dialog');
  });

  it('should return key if not found', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('should substitute template variables', () => {
    const result = t('input.characterCount', { count: 5, max: 100 });
    expect(result).toBe('5 of 100 characters');
  });

  it('should override locale strings', () => {
    setLocale({ dialog: { close: 'Fermer' } });
    expect(t('dialog.close')).toBe('Fermer');
  });

  it('should merge locale overrides without losing other keys', () => {
    setLocale({ dialog: { confirm: 'Confirmer' } });
    expect(t('dialog.cancel')).toBe('Cancel');
  });

  it('should restore with setLocale', () => {
    setLocale({ dialog: { close: en.dialog.close } });
    expect(t('dialog.close')).toBe('Close dialog');
  });

  it('should reset nested locale state', () => {
    setLocale({ dialog: { confirm: 'Confirmer' } });
    resetLocale();
    expect(t('dialog.confirm')).toBe(en.dialog.confirm);
  });

  it('should keep default drawer labels available', () => {
    expect(t('drawer.close')).toBe(en.drawer.close);
  });
});

describe('design tokens', () => {
  it('should export colors object', async () => {
    const { colors } = await import('../src/tokens/colors.js');
    expect(colors.primary600).toBe('#2563eb');
    expect(colors.danger500).toBe('#ef4444');
    expect(colors.success500).toBe('#22c55e');
  });

  it('should export typography object', async () => {
    const { typography } = await import('../src/tokens/typography.js');
    expect(typography.fontSizeMd).toBe('1rem');
    expect(typography.fontWeightBold).toBe('700');
  });

  it('should export motion object', async () => {
    const { motion } = await import('../src/tokens/motion.js');
    expect(motion.durationFast).toBe('150ms');
    expect(motion.easingStandard).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
  });

  it('should generate tokens CSS string', async () => {
    const { getTokensCSS } = await import('../src/tokens/index.js');
    const css = getTokensCSS();
    expect(css).toContain('--bq-color-primary-600');
    expect(css).toContain('--bq-font-family-sans');
    expect(css).toContain('--bq-radius-md');
  });
});

describe('dom utilities', () => {
  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('should respect explicit 0ms animations instead of using the fallback timeout', () => {
    const el = doc.createElement('div');
    doc.body.appendChild(el);

    const originalGetComputedStyle = win.getComputedStyle.bind(win);
    const mockedGetComputedStyle = ((node: Element) => {
      const styles = originalGetComputedStyle(node);
      if (node === el) {
        return {
          ...styles,
          animationName: 'fade-out',
          animationDuration: '0s',
          animationDelay: '0s',
        } as CSSStyleDeclaration;
      }
      return styles;
    }) as typeof win.getComputedStyle;

    win.getComputedStyle = mockedGetComputedStyle;

    try {
      expect(getAnimationTimeoutMs(el, '200ms')).toBe(0);
    } finally {
      win.getComputedStyle = originalGetComputedStyle as typeof win.getComputedStyle;
    }
  });

  it('should use the fallback timeout when no animation name is present', () => {
    const el = doc.createElement('div');
    doc.body.appendChild(el);

    const originalGetComputedStyle = win.getComputedStyle.bind(win);
    const mockedGetComputedStyle = ((node: Element) => {
      const styles = originalGetComputedStyle(node);
      if (node === el) {
        return {
          ...styles,
          animationName: 'none',
          animationDuration: '0s',
          animationDelay: '0s',
        } as CSSStyleDeclaration;
      }
      return styles;
    }) as typeof win.getComputedStyle;

    win.getComputedStyle = mockedGetComputedStyle;

    try {
      expect(getAnimationTimeoutMs(el, '200ms')).toBe(200);
    } finally {
      win.getComputedStyle = originalGetComputedStyle as typeof win.getComputedStyle;
    }
  });
});
