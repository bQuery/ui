import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Forms/Switch',
  tags: ['autodocs'],
  render: (args) => html`<bq-switch label=${args.label} ?checked=${args.checked} ?disabled=${args.disabled} size=${args.size}></bq-switch>`,
  argTypes: {
    label:    { control: 'text' },
    checked:  { control: 'boolean' },
    disabled: { control: 'boolean' },
    size:     { control: 'select', options: ['sm','md','lg'] },
  },
  args: { label: 'Dark mode', checked: false, disabled: false, size: 'md' },
};
export default meta;
type Story = StoryObj;

export const Default:  Story = {};
export const On:       Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
