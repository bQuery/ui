import './components/index.js';

/** @deprecated Components self-register on import; options passed to `registerAll()` are ignored. */
export interface RegisterOptions {
  /** @deprecated Custom prefixes are no longer supported. Components always register as `bq-*`. */
  prefix?: string;
}

let didWarnDeprecatedRegisterOptions = false;

/**
 * @deprecated Components now self-register on import. Passing options no longer changes registration behavior.
 */
export function registerAll(options: RegisterOptions = {}): void {
  if (Object.keys(options).length === 0) return;
  if (didWarnDeprecatedRegisterOptions) return;

  didWarnDeprecatedRegisterOptions = true;

  let warning = '@bquery/ui registerAll() no longer accepts registration options because components self-register on import.';

  if (options.prefix === 'bq') {
    warning = '@bquery/ui registerAll() no longer needs a `prefix` option because components self-register on import as "bq-*".';
  } else if (options.prefix) {
    warning = `@bquery/ui registerAll() no longer supports custom prefixes; received "${options.prefix}" but components always register as "bq-*".`;
  }

  console.warn(warning);
}
