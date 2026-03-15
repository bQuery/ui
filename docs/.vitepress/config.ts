import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '@bquery/ui',
  description: 'Production-grade web component library for the bQuery project',
  base: '/',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/button' },
      { text: 'GitHub', link: 'https://github.com/bquery/component-library' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Theming', link: '/guide/theming' },
          { text: 'Dark Mode', link: '/guide/dark-mode' },
          { text: 'Accessibility', link: '/guide/accessibility' },
          { text: 'Internationalization', link: '/guide/i18n' },
        ],
      },
      {
        text: 'Components',
        items: [
          { text: 'Button', link: '/components/button' },
          { text: 'Input', link: '/components/input' },
          { text: 'Card', link: '/components/card' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bquery/component-library' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 bQuery',
    },
  },
  head: [
    ['meta', { name: 'theme-color', content: '#2563eb' }],
  ],
});
