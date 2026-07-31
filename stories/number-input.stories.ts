import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Numeric field with stepper buttons, range clamping and step snapping.
 */
const meta: Meta = {
  title: 'Components/Number Input',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-number-input
      label=${args.label}
      value=${args.value}
      min=${args.min}
      max=${args.max}
      step=${args.step}
      size=${args.size}
      hint=${args.hint}
      error=${args.error}
      ?disabled=${args.disabled}
      ?readonly=${args.readonly}
    ></bq-number-input>
  `,
  argTypes: {
    label:    { control: 'text' },
    value:    { control: 'number' },
    min:      { control: 'number' },
    max:      { control: 'number' },
    step:     { control: 'number' },
    size:     { control: 'select', options: ['sm','md','lg'] },
    hint:     { control: 'text' },
    error:    { control: 'text' },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
  },
  args: {
    label: 'Quantity', value: 1, min: 1, max: 99, step: 1,
    size: 'md', hint: '', error: '', disabled: false, readonly: false,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: 'Between 1 and 99' } };
export const WithError: Story = { args: { value: 99, error: 'Maximum is 20' } };
export const Decimals: Story = { args: { label: 'Weight', value: 2.5, min: 0, max: 10, step: 0.5 } };
export const Disabled: Story = { args: { disabled: true, value: 5 } };
export const WithAffixes: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:1rem;max-width:16rem">
      <bq-number-input label="Price" value="20" min="0" step="0.01">
        <span slot="prefix">€</span>
      </bq-number-input>
      <bq-number-input label="Duration" value="30" min="0" step="5">
        <span slot="suffix">min</span>
      </bq-number-input>
    </div>
  `,
};
