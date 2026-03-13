import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Feedback/Spinner',
  tags: ['autodocs'],
  render: (args) => html`<bq-spinner size=${args.size} variant=${args.variant} label=${args.label}></bq-spinner>`,
  argTypes: {
    size:    { control: 'select', options: ['xs','sm','md','lg','xl'] },
    variant: { control: 'select', options: ['primary','secondary','danger','success','white'] },
    label:   { control: 'text' },
  },
  args: { size: 'md', variant: 'primary', label: 'Loading…' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const AllSizes: Story = {
  render: () => html`
    <div style="display:flex;gap:1.5rem;align-items:center">
      <bq-spinner size="xs"></bq-spinner>
      <bq-spinner size="sm"></bq-spinner>
      <bq-spinner size="md"></bq-spinner>
      <bq-spinner size="lg"></bq-spinner>
      <bq-spinner size="xl"></bq-spinner>
    </div>
  `,
};
