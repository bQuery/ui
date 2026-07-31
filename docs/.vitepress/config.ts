import { defineConfig } from 'vitepress';

export function resolveDocsBase(env: NodeJS.ProcessEnv = process.env): string {
  const explicitBase = env.DOCS_BASE ?? env.VITEPRESS_BASE;

  if (explicitBase) {
    return explicitBase;
  }

  const repositoryName =
    env.GITHUB_ACTIONS === 'true'
      ? env.GITHUB_REPOSITORY?.split('/')[1]
      : undefined;

  return repositoryName ? `/${repositoryName}/` : '/';
}

const repositoryBasePath = resolveDocsBase();

export default defineConfig({
  title: '@bquery/ui',
  description: 'Production-grade web component library for the bQuery project',
  base: repositoryBasePath,
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
          { text: 'Migration from 1.1.0', link: '/guide/migration-from-1-1-0' },
          {
            text: 'Framework Integration',
            link: '/guide/framework-integration',
          },
          { text: 'Theming', link: '/guide/theming' },
          { text: 'Dark Mode', link: '/guide/dark-mode' },
          { text: 'Accessibility', link: '/guide/accessibility' },
          { text: 'Internationalization', link: '/guide/i18n' },
          {
            text: 'Architecture & Roadmap',
            link: '/guide/architecture-roadmap',
          },
        ],
      },
      {
        text: 'Components',
        items: [
          { text: 'Catalog', link: '/components/' },
          { text: 'Accordion', link: '/components/accordion' },
          { text: 'Alert', link: '/components/alert' },
          { text: 'Avatar', link: '/components/avatar' },
          { text: 'Avatar Group', link: '/components/avatar-group' },
          { text: 'Badge', link: '/components/badge' },
          { text: 'Banner', link: '/components/banner' },
          { text: 'Breadcrumbs', link: '/components/breadcrumbs' },
          { text: 'Button', link: '/components/button' },
          { text: 'Button Group', link: '/components/button-group' },
          { text: 'Card', link: '/components/card' },
          { text: 'Checkbox', link: '/components/checkbox' },
          { text: 'Chip', link: '/components/chip' },
          { text: 'Dialog', link: '/components/dialog' },
          { text: 'Divider', link: '/components/divider' },
          { text: 'Drawer', link: '/components/drawer' },
          { text: 'Dropdown Menu', link: '/components/dropdown-menu' },
          { text: 'Empty State', link: '/components/empty-state' },
          { text: 'File Upload', link: '/components/file-upload' },
          { text: 'Icon Button', link: '/components/icon-button' },
          { text: 'Input', link: '/components/input' },
          { text: 'Kbd', link: '/components/kbd' },
          { text: 'Number Input', link: '/components/number-input' },
          { text: 'Pagination', link: '/components/pagination' },
          { text: 'Popover', link: '/components/popover' },
          { text: 'Progress', link: '/components/progress' },
          { text: 'Radio', link: '/components/radio' },
          { text: 'Rating', link: '/components/rating' },
          { text: 'Select', link: '/components/select' },
          { text: 'Segmented Control', link: '/components/segmented-control' },
          { text: 'Skeleton', link: '/components/skeleton' },
          { text: 'Slider', link: '/components/slider' },
          { text: 'Spinner', link: '/components/spinner' },
          { text: 'Stat Card', link: '/components/stat-card' },
          { text: 'Stepper', link: '/components/stepper' },
          { text: 'Switch', link: '/components/switch' },
          { text: 'Table', link: '/components/table' },
          { text: 'Tabs', link: '/components/tabs' },
          { text: 'Textarea', link: '/components/textarea' },
          { text: 'Timeline', link: '/components/timeline' },
          { text: 'Toast', link: '/components/toast' },
          { text: 'Tooltip', link: '/components/tooltip' },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/bQuery/ui' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 bQuery',
    },
  },
  head: [['meta', { name: 'theme-color', content: '#2563eb' }]],
});
