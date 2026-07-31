/**
 * Guards against attributes that silently vanish from rendered output.
 *
 * Component markup is sanitized before it reaches the shadow root, and the
 * framework's allowlist is narrower than it looks — `scope`, `colspan`,
 * `style`, `spellcheck` and `inputmode` are all dropped unless a component
 * opts in through `sanitize.allowAttributes`. Nothing warns when that happens;
 * the attribute is simply not there, which is how `bq-table` shipped a
 * "no data" cell that spanned one column instead of the whole row.
 *
 * So the check lives here: parse every render template, and fail on any
 * attribute the sanitizer would throw away.
 */
import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Tags the sanitizer keeps, plus `slot`, which the component runtime adds. */
const KNOWN_TAGS = new Set(
  `a abbr address article aside b bdi bdo blockquote br button caption cite code
   col colgroup data dd del details dfn div dl dt em figcaption figure footer
   form h1 h2 h3 h4 h5 h6 header hgroup hr i img input ins kbd label legend li
   main mark nav ol optgroup option p picture pre progress q rp rt ruby s samp
   section select small source span strong sub summary sup table tbody td
   textarea tfoot th thead time tr u ul var wbr slot`.split(/\s+/)
);

/** The sanitizer's own allowlist. */
const BASE_ATTRIBUTES = new Set(
  `alt class dir height hidden href id lang loading name rel role src srcset
   tabindex target title type width`.split(/\s+/)
);

/** What the component runtime adds on top of it. */
const RUNTIME_ATTRIBUTES = new Set(
  `part disabled checked placeholder value rows cols readonly required maxlength
   minlength max min step pattern autocomplete autofocus for multiple selected
   wrap`.split(/\s+/)
);

const COMPONENTS_DIR = join(import.meta.dir, '..', 'src', 'components');

function componentFiles(): { name: string; path: string; source: string }[] {
  return readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const dir = join(COMPONENTS_DIR, entry.name);
      return readdirSync(dir)
        .filter((file) => file.startsWith('Bq') && file.endsWith('.ts'))
        .map((file) => ({
          name: `${entry.name}/${file}`,
          path: join(dir, file),
          source: readFileSync(join(dir, file), 'utf8'),
        }));
    });
}

/** Reads the component's own `sanitize.allowAttributes` opt-ins. */
function declaredAllowList(source: string): Set<string> {
  const match = /sanitize:\s*\{[\s\S]*?allowAttributes:\s*\[([\s\S]*?)\]/.exec(
    source
  );
  if (!match?.[1]) return new Set();
  return new Set(
    Array.from(match[1].matchAll(/['"]([^'"]+)['"]/g), (m) =>
      (m[1] ?? '').toLowerCase()
    )
  );
}

/**
 * Collects the attribute names a render template emits.
 *
 * Only opening tags of known HTML elements are inspected — scanning the file
 * as a whole would trip over TypeScript generics such as `Record<string, …>`.
 */
function renderedAttributes(source: string): Set<string> {
  const renderStart = source.indexOf('render(');
  if (renderStart < 0) return new Set();
  const body = source.slice(renderStart);
  const attributes = new Set<string>();

  // `[^<>]` already matches newlines — a character class is not affected by
  // the `s` flag — so spelling out `(?:[^<>]|\n)` made the two branches
  // ambiguous and the group exponentially backtrackable on an unterminated
  // tag. One unambiguous class matches the same text in linear time.
  for (const tag of body.matchAll(/<([a-zA-Z][\w-]*)([^<>]*)>/g)) {
    if (!KNOWN_TAGS.has((tag[1] ?? '').toLowerCase())) continue;
    for (const attribute of (tag[2] ?? '').matchAll(
      /(?:^|[\s"'`])([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*["']/g
    )) {
      attributes.add((attribute[1] ?? '').toLowerCase());
    }
  }
  return attributes;
}

describe('sanitizer allowlist', () => {
  const files = componentFiles();

  it('finds the component sources', () => {
    expect(files.length).toBeGreaterThan(40);
  });

  it('never renders an attribute the sanitizer would strip', () => {
    const offenders: string[] = [];

    for (const file of files) {
      const allowed = declaredAllowList(file.source);
      for (const attribute of renderedAttributes(file.source)) {
        if (
          attribute.startsWith('aria-') ||
          attribute.startsWith('data-') ||
          BASE_ATTRIBUTES.has(attribute) ||
          RUNTIME_ATTRIBUTES.has(attribute) ||
          allowed.has(attribute)
        ) {
          continue;
        }
        offenders.push(`${file.name}: ${attribute}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
