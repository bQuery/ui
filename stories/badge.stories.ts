import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Small status or count indicator. Supports multiple variants and sizes.
 */
const meta: Meta = {
  title: 'Components/Badge',
  tags: ['autodocs'],
  render: (args) => storyHtml`<bq-badge variant=${args.variant} size=${args.size} ?pill=${args.pill}>${args.label}</bq-badge>`,
  argTypes: {
    variant: { control: 'select', options: ['primary','secondary','success','danger','warning','info','outline'] },
    size:    { control: 'select', options: ['sm','md','lg'] },
    pill:    { control: 'boolean' },
    label:   { control: 'text' },
  },
  args: { variant: 'primary', size: 'md', pill: false, label: 'Badge' },
};
export default meta;
type Story = StoryObj;

export const Primary: Story = {};
export const Success: Story = { args: { variant: 'success', label: 'Active' } };
export const Danger:  Story = { args: { variant: 'danger',  label: 'Error' } };
export const Warning: Story = { args: { variant: 'warning', label: 'Pending' } };
export const Outline: Story = { args: { variant: 'outline', label: 'Draft' } };
export const Pill:    Story = { args: { pill: true } };
export const AllVariants: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center">
      <bq-badge variant="primary">Primary</bq-badge>
      <bq-badge variant="secondary">Secondary</bq-badge>
      <bq-badge variant="success">Success</bq-badge>
      <bq-badge variant="danger">Danger</bq-badge>
      <bq-badge variant="warning">Warning</bq-badge>
      <bq-badge variant="info">Info</bq-badge>
      <bq-badge variant="outline">Outline</bq-badge>
    </div>
  `,
};
