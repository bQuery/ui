import type { StorybookConfig } from '@storybook/web-components-vite';

/**
 * Storybook configuration for @bquery/ui
 *
 * Uses the web-components-vite framework which provides:
 * - Native Web Component / Custom Element support
 * - Vite-powered fast HMR
 * - MDX story format support via addon-docs
 */
const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|mdx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
