import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * A row of single-character cells for verification codes. Typing advances,
 * Backspace steps back, and a pasted code spreads across the cells.
 */
const meta: Meta = {
  title: 'Components/Pin Input',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-pin-input
      length=${args.length}
      type=${args.type}
      label=${args.label}
      hint=${args.hint}
      error=${args.error}
      size=${args.size}
      ?mask=${args.mask}
      ?disabled=${args.disabled}
    ></bq-pin-input>
  `,
  argTypes: {
    length: { control: { type: 'number', min: 2, max: 10 } },
    type: { control: 'select', options: ['numeric', 'alphanumeric', 'text'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    mask: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    hint: { control: 'text' },
    error: { control: 'text' },
  },
  args: {
    length: 6,
    type: 'numeric',
    size: 'md',
    mask: false,
    disabled: false,
    label: 'Verification code',
    hint: 'We sent a six-digit code to your phone.',
    error: '',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Alphanumeric: Story = { args: { type: 'alphanumeric', length: 5, hint: '' } };
export const Masked: Story = { args: { mask: true, length: 4, label: 'PIN', hint: '' } };
export const WithError: Story = { args: { error: 'That code has expired.', hint: '' } };
export const Sizes: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:1.25rem">
      <bq-pin-input size="sm" length="4" label="Small"></bq-pin-input>
      <bq-pin-input size="md" length="4" label="Medium"></bq-pin-input>
      <bq-pin-input size="lg" length="4" label="Large"></bq-pin-input>
    </div>
  `,
};
