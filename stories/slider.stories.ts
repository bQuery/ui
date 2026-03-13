import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Forms/Slider',
  tags: ['autodocs'],
  render: (args) => html`<bq-slider label=${args.label} value=${args.value} min=${args.min} max=${args.max} step=${args.step} ?disabled=${args.disabled} show-value="true"></bq-slider>`,
  argTypes: {
    label:    { control: 'text' },
    value:    { control: 'number' },
    min:      { control: 'number' },
    max:      { control: 'number' },
    step:     { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Volume', value: 60, min: 0, max: 100, step: 1, disabled: false },
};
export default meta;
type Story = StoryObj;

export const Default:  Story = {};
export const Disabled: Story = { args: { disabled: true } };
