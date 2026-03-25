import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Forms/Slider',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-slider label=${args.label} value=${args.value} min=${args.min} max=${args.max} step=${args.step} ?disabled=${args.disabled} show-value="true"></bq-slider>`,
  argTypes: {
    label: { control: 'text' },
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Volume',
    value: 60,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };

export const CustomRange: Story = {
  render: () => storyHtml`
    <bq-slider label="Temperature" value="22" min="16" max="30" step="0.5" show-value></bq-slider>
  `,
};

export const WithoutLabel: Story = {
  render: () => storyHtml`
    <bq-slider value="50" min="0" max="100" show-value></bq-slider>
  `,
};
