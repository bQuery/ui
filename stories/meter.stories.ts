import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * A scalar measurement inside a known range — disk usage, password strength,
 * a budget. Unlike a progress bar it can move in either direction, and the
 * `low`/`high`/`optimum` bands colour it by whether the reading is healthy.
 */
const meta: Meta = {
  title: 'Components/Meter',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-meter
      value=${args.value}
      min=${args.min}
      max=${args.max}
      label=${args.label}
      size=${args.size}
      ?show-value=${args.showValue}
    ></bq-meter>
  `,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    showValue: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { value: 64, min: 0, max: 100, label: 'Storage used', size: 'md', showValue: true },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const LowerIsBetter: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:1rem;max-width:24rem">
      <bq-meter label="Disk usage" value="18" low="40" high="80" optimum="0" show-value></bq-meter>
      <bq-meter label="Disk usage" value="62" low="40" high="80" optimum="0" show-value></bq-meter>
      <bq-meter label="Disk usage" value="94" low="40" high="80" optimum="0" show-value></bq-meter>
    </div>
  `,
};

export const HigherIsBetter: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:1rem;max-width:24rem">
      <bq-meter label="Battery" value="12" low="20" high="80" optimum="100" show-value></bq-meter>
      <bq-meter label="Battery" value="55" low="20" high="80" optimum="100" show-value></bq-meter>
      <bq-meter label="Battery" value="93" low="20" high="80" optimum="100" show-value></bq-meter>
    </div>
  `,
};

export const CustomValueText: Story = {
  args: { label: 'Storage', value: 72 },
  render: (args) => storyHtml`
    <bq-meter label=${args.label} value=${args.value} value-text="72 GB of 100 GB" show-value></bq-meter>
  `,
};
