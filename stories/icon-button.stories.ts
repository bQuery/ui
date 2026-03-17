import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Components/IconButton',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-icon-button
      variant=${args.variant}
      size=${args.size}
      label=${args.label}
      title=${args.title}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
    >
      <span aria-hidden="true">${args.icon}</span>
    </bq-icon-button>
  `,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text', description: 'Preferred accessible name' },
    title: { control: 'text', description: 'Optional tooltip and label fallback' },
    icon: { control: 'text' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    variant: 'ghost',
    size: 'md',
    label: 'Open menu',
    title: '',
    icon: '☰',
    disabled: false,
    loading: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const WithTitleFallback: Story = {
  args: {
    label: '',
    title: 'Refresh results',
    icon: '↻',
  },
};

export const Loading: Story = {
  args: {
    label: 'Sync data',
    icon: '⟳',
    loading: true,
  },
};

export const AllVariants: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center">
      <bq-icon-button variant="primary" label="Create item"><span aria-hidden="true">＋</span></bq-icon-button>
      <bq-icon-button variant="secondary" label="Archive item"><span aria-hidden="true">🗂</span></bq-icon-button>
      <bq-icon-button variant="outline" label="Edit item"><span aria-hidden="true">✎</span></bq-icon-button>
      <bq-icon-button variant="ghost" label="Open menu"><span aria-hidden="true">☰</span></bq-icon-button>
      <bq-icon-button variant="danger" label="Delete item"><span aria-hidden="true">🗑</span></bq-icon-button>
    </div>
  `,
};
