import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Layout/Divider',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-divider orientation=${args.orientation} variant=${args.variant} label=${args.label}></bq-divider>`,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    variant: { control: 'select', options: ['solid', 'dashed', 'dotted'] },
    label: { control: 'text' },
  },
  args: { orientation: 'horizontal', variant: 'solid', label: '' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const WithLabel: Story = { args: { label: 'OR' } };
export const Dashed: Story = { args: { variant: 'dashed' } };
export const VerticalWithLabel: Story = {
  render: () => storyHtml`
    <div style="display:flex;align-items:center;gap:1rem;height:10rem">
      <span>Before</span>
      <bq-divider orientation="vertical" label="STEP"></bq-divider>
      <span>After</span>
    </div>
  `,
};
