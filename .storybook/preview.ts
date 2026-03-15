import type { Preview } from '@storybook/web-components';
import { registerAll } from '../src/register.js';

/**
 * Register all @bquery/ui components so they are available in every story.
 * Components are registered once at startup.
 */
registerAll();

const preview: Preview = {
  parameters: {
    docs: {
      toc: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f172a' },
        { name: 'neutral', value: '#f8fafc' },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1280px', height: '900px' } },
      },
    },
  },
};

export default preview;
