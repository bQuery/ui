import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Feedback/Progress',
  tags: ['autodocs'],
  render: (args) => html`<bq-progress value=${args.value} max=${args.max} variant=${args.variant} size=${args.size} label=${args.label} ?indeterminate=${args.indeterminate}></bq-progress>`,
  argTypes: {
    value:         { control: 'number' },
    max:           { control: 'number' },
    variant:       { control: 'select', options: ['primary','success','danger','warning'] },
    size:          { control: 'select', options: ['sm','md','lg'] },
    label:         { control: 'text' },
    indeterminate: { control: 'boolean' },
  },
  args: { value: 60, max: 100, variant: 'primary', size: 'md', label: 'Progress', indeterminate: false },
};
export default meta;
type Story = StoryObj;

export const Default:       Story = {};
export const Success:       Story = { args: { value: 100, variant: 'success', label: 'Complete' } };
export const Danger:        Story = { args: { value: 25, variant: 'danger', label: 'Critical' } };
export const Indeterminate: Story = { args: { indeterminate: true } };
