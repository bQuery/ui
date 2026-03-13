import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Forms/Checkbox',
  tags: ['autodocs'],
  render: (args) => html`<bq-checkbox label=${args.label} ?checked=${args.checked} ?disabled=${args.disabled} ?required=${args.required} hint=${args.hint}></bq-checkbox>`,
  argTypes: {
    label:    { control: 'text' },
    checked:  { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    hint:     { control: 'text' },
  },
  args: { label: 'Accept terms and conditions', checked: false, disabled: false, required: false, hint: '' },
};
export default meta;
type Story = StoryObj;

export const Default:  Story = {};
export const Checked:  Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const WithHint: Story = { args: { hint: 'You must accept to continue', required: true } };
