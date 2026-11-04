import { describe, expect, it } from 'bun:test';
import { resolve } from 'node:path';
import ts from 'typescript';

/**
 * Type-level guard for issue #24: the `as const` English locale must not leak
 * its string literals into `BqLocaleOverride`, or every translation is a
 * type error.
 */
function typeErrors(source: string): string[] {
  const file = resolve(import.meta.dir, '__i18n-type-check.ts');
  const options: ts.CompilerOptions = {
    strict: true,
    exactOptionalPropertyTypes: true,
    noEmit: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile.bind(host);
  host.readFile = (name) => (resolve(name) === file ? source : readFile(name));
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (name) => resolve(name) === file || fileExists(name);
  const program = ts.createProgram([file], options, host);
  return ts
    .getPreEmitDiagnostics(program, program.getSourceFile(file))
    .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
}

describe('i18n types', () => {
  it('accepts non-English strings in setLocale()', () => {
    const errors = typeErrors(`
      import { setLocale, getLocale, type BqLocale } from '../src/i18n/index.js';
      setLocale({ dialog: { close: 'Dialog schließen' } });
      setLocale({ input: { characterCount: '{count} von {max} Zeichen' } });
      const close: string = getLocale().dialog.close;
      const full: BqLocale = getLocale();
      void close; void full;
    `);
    expect(errors).toEqual([]);
  }, 30000);

  it('still rejects unknown keys and non-string values', () => {
    const errors = typeErrors(`
      import { setLocale } from '../src/i18n/index.js';
      setLocale({ dialog: { nope: 'x' } });
      setLocale({ dialog: { close: 42 } });
    `);
    expect(errors.length).toBe(2);
  }, 30000);
});
