import { defineConfig } from 'vite';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const componentsDir = resolve(__dirname, 'src/components');
const componentModulePattern = /^Bq.+\.ts$/;
const componentEntries = Object.fromEntries(
  readdirSync(componentsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const componentModule = readdirSync(resolve(componentsDir, entry.name))
        .find((fileName) => componentModulePattern.test(fileName));
      if (!componentModule) throw new Error(`Component module matching pattern ${componentModulePattern} not found in ${entry.name}`);
      return [`components/${entry.name}`, resolve(componentsDir, entry.name, componentModule)];
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
