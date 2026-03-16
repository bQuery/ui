import { defineConfig } from 'vite';
import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';

const componentsDir = resolve(__dirname, 'src/components');
const componentEntries = Object.fromEntries(
  readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const componentEntry = resolve(componentsDir, entry.name, 'index.ts');
      if (!existsSync(componentEntry)) {
        throw new Error(`Component entrypoint not found: ${componentEntry}`);
      }
      return [`components/${entry.name}`, componentEntry];
    }),
);

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        register: resolve(__dirname, 'src/register.ts'),
        'tokens/index': resolve(__dirname, 'src/tokens/index.ts'),
        'theme/index': resolve(__dirname, 'src/theme/index.ts'),
        'i18n/index': resolve(__dirname, 'src/i18n/index.ts'),
        'utils/index': resolve(__dirname, 'src/utils/index.ts'),
        'components/index': resolve(__dirname, 'src/components/index.ts'),
        ...componentEntries,
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        format === 'es' ? `${entryName}.js` : `${entryName}.cjs`,
    },
    rollupOptions: {
      external: ['@bquery/bquery'],
      output: {
        preserveModules: false,
        exports: 'named',
      },
    },
    sourcemap: true,
    minify: false,
    target: 'es2020',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
