/**
 * Registration smoke test for the built package (run after `bun run build:lib`).
 *
 * Bundles every per-component entry (`dist/components/<name>.js`) on its own,
 * the way an app bundler that honours `package.json` → `sideEffects` would,
 * and checks that the output still registers the element. A chunk missing
 * from `sideEffects` is dropped as side-effect free and its
 * `customElements.define` call disappears (see issue #23).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const distComponents = join(root, 'dist/components');
if (!existsSync(distComponents)) {
  console.error('dist/components not found — run `bun run build:lib` first.');
  process.exit(1);
}

const sourceDir = join(root, 'src/components');
const work = mkdtempSync(join(tmpdir(), 'bq-bundle-'));
const failures: string[] = [];
let checked = 0;

try {
  for (const name of readdirSync(sourceDir, { withFileTypes: true })) {
    if (!name.isDirectory()) continue;
    const dir = join(sourceDir, name.name);
    // Every tag the component's sources register: component('bq-x', …)
    const tags = new Set<string>();
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.ts')) continue;
      const text = readFileSync(join(dir, file), 'utf8');
      for (const m of text.matchAll(/component(?:<[^>]*>)?\(\s*['"](bq-[a-z0-9-]+)['"]/g)) {
        tags.add(m[1]!);
      }
    }
    if (tags.size === 0) continue;

    const entry = join(work, `${name.name}.ts`);
    writeFileSync(entry, `import ${JSON.stringify(join(distComponents, `${name.name}.js`))};\n`);
    const result = await Bun.build({ entrypoints: [entry], external: ['@bquery/bquery'], format: 'esm' });
    if (!result.success) {
      failures.push(`${name.name}: bundling failed\n${result.logs.join('\n')}`);
      continue;
    }
    const output = await result.outputs[0]!.text();
    for (const tag of tags) {
      checked++;
      if (!output.includes(`"${tag}"`)) {
        failures.push(`${name.name}: <${tag}> is not registered by \`import '@bquery/ui/components/${name.name}'\``);
      }
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`✓ ${checked} elements registered by their per-component entries`);
