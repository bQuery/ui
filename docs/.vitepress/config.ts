import { defineConfig } from 'vitepress';

const githubPagesBase = `/${process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'ui'}/`;

export default defineConfig({
  title: '@bquery/ui',
  description: 'Production-grade web component library for the bQuery project',
  base: githubPagesBase,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/' },
      { text: 'GitHub', link: 'https://github.com/bQuery/ui' },
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Framework Integration', link: '/guide/framework-integration' },
          { text: 'Theming', link: '/guide/theming' },
          { text: 'Dark Mode', link: '/guide/dark-mode' },
          { text: 'Accessibility', link: '/guide/accessibility' },
          { text: 'Internationalization', link: '/guide/i18n' },
          { text: 'Architecture & Roadmap', link: '/guide/architecture-roadmap' },
        ],
      },
      {
        text: 'Components',
        items: [
          { text: 'Catalog', link: '/components/' },
          { text: 'Accordion', link: '/components/accordion' },
          { text: 'Alert', link: '/components/alert' },
          { text: 'Avatar', link: '/components/avatar' },
          { text: 'Badge', link: '/components/badge' },
          { text: 'Breadcrumbs', link: '/components/breadcrumbs' },
          { text: 'Button', link: '/components/button' },
          { text: 'Card', link: '/components/card' },
          { text: 'Checkbox', link: '/components/checkbox' },
          { text: 'Chip', link: '/components/chip' },
          { text: 'Dialog', link: '/components/dialog' },
          { text: 'Divider', link: '/components/divider' },
          { text: 'Drawer', link: '/components/drawer' },
          { text: 'Dropdown Menu', link: '/components/dropdown-menu' },
          { text: 'Empty State', link: '/components/empty-state' },
          { text: 'Icon Button', link: '/components/icon-button' },
          { text: 'Input', link: '/components/input' },
          { text: 'Pagination', link: '/components/pagination' },
          { text: 'Progress', link: '/components/progress' },
          { text: 'Radio', link: '/components/radio' },
          { text: 'Select', link: '/components/select' },
          { text: 'Segmented Control', link: '/components/segmented-control' },
          { text: 'Skeleton', link: '/components/skeleton' },
          { text: 'Slider', link: '/components/slider' },
          { text: 'Spinner', link: '/components/spinner' },
          { text: 'Switch', link: '/components/switch' },
          { text: 'Table', link: '/components/table' },
          { text: 'Tabs', link: '/components/tabs' },
          { text: 'Textarea', link: '/components/textarea' },
          { text: 'Toast', link: '/components/toast' },
          { text: 'Tooltip', link: '/components/tooltip' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/bQuery/ui' },
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
