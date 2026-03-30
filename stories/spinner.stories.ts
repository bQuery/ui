import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Feedback/Spinner',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-spinner size=${args.size} variant=${args.variant} label=${args.label}></bq-spinner>`,
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'success', 'white'],
    },
    label: { control: 'text' },
  },
  args: { size: 'md', variant: 'primary', label: 'Loading…' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const LocalizedFallbackLabel: Story = {
  render: () => storyHtml`
    <div style="display:grid;gap:0.75rem;align-items:start">
      <p style="margin:0;color:#475569;font:500 0.875rem/1.4 system-ui,sans-serif">
        This example omits the <code>label</code> prop so the spinner falls back to the
        localized default loading string.
      </p>
      <bq-spinner size="md" variant="primary"></bq-spinner>
    </div>
  `,
};

export const AllSizes: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:1.5rem;align-items:center">
      <bq-spinner size="xs"></bq-spinner>
      <bq-spinner size="sm"></bq-spinner>
      <bq-spinner size="md"></bq-spinner>
      <bq-spinner size="lg"></bq-spinner>
      <bq-spinner size="xl"></bq-spinner>
    </div>
  `,
};
