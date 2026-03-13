/**
 * i18n / locale system for @bquery/ui
 *
 * Usage:
 *   import { setLocale, t } from '@bquery/ui/i18n';
 *   setLocale({ dialog: { close: 'Schließen' } });
 *   t('dialog.close'); // → 'Schließen'
 */
import { en } from './en.js';

export { en };
export type { EnLocale } from './en.js';

/** Deep partial helper for locale overrides */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type BqLocale = typeof en;
export type BqLocaleOverride = DeepPartial<BqLocale>;

let _locale: BqLocale = { ...en };

/**
 * Override locale strings. Merges shallowly at the top level, deeply at the second level.
 */
export function setLocale(overrides: BqLocaleOverride): void {
  _locale = deepMerge(_locale, overrides) as BqLocale;
}

/** Returns the currently active locale object. */
export function getLocale(): BqLocale {
  return _locale;
}

/**
 * Translate a dot-notation key, with optional template variable substitution.
 *
 * @example
 *   t('dialog.close')                        // 'Close dialog'
 *   t('input.characterCount', { count: 5, max: 100 })  // '5 of 100 characters'
 */
export function t(
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = _locale;
  for (const part of parts) {
    if (value == null || typeof value !== 'object') return key;
    value = (value as Record<string, unknown>)[part];
  }
  if (typeof value !== 'string') return key;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_: string, k: string) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function deepMerge<T extends object>(base: T, overrides: DeepPartial<T>): T {
  const result = { ...base } as T;
  for (const key in overrides) {
    const k = key as keyof T;
    const ov = overrides[k];
    if (ov !== undefined) {
      if (
        typeof ov === 'object' &&
        !Array.isArray(ov) &&
        typeof base[k] === 'object' &&
        !Array.isArray(base[k])
      ) {
        (result as Record<keyof T, unknown>)[k] = deepMerge(
          base[k] as object,
          ov as DeepPartial<object>,
        );
      } else {
        (result as Record<keyof T, unknown>)[k] = ov as T[keyof T];
      }
    }
  }
  return result;
}
