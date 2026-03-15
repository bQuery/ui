import './components/index.js';

export interface RegisterOptions {
  prefix?: string;
}

/** Legacy compatibility shim. Components now self-register on import and any options are ignored. */
export function registerAll(_options: RegisterOptions = {}): void {}
