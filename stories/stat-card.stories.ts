import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Data Display/Stat Card',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-stat-card
      label=${args.label}
      value=${args.value}
      change=${args.change}
      hint=${args.hint}
      trend=${args.trend}
      size=${args.size}
      ?loading=${args.loading}
      style="max-width:22rem"
    >
      <span slot="icon" aria-hidden="true">${args.icon}</span>
      ${args.extra ? `<bq-badge variant="success">${args.extra}</bq-badge>` : ''}
    </bq-stat-card>
  `,
  argTypes: {
    label:   { control: 'text' },
    value:   { control: 'text' },
    change:  { control: 'text' },
    hint:    { control: 'text' },
    trend:   { control: 'select', options: ['up', 'down', 'neutral'] },
    size:    { control: 'select', options: ['sm', 'md'] },
    loading: { control: 'boolean' },
    icon:    { control: 'text' },
    extra:   { control: 'text' },
  },
  args: {
    label: 'Monthly revenue',
    value: '$128k',
    change: '+12.4%',
    hint: 'Compared with the previous 30 days.',
    trend: 'up',
    size: 'md',
    loading: false,
    icon: '📈',
    extra: 'Healthy',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Compact: Story = { args: { size: 'sm', icon: '⚡', extra: 'Live' } };
export const Loading: Story = { args: { loading: true, value: '', change: '', extra: '' } };
