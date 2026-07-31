import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Star rating input with radio-group semantics and full keyboard support.
 */
const meta: Meta = {
  title: 'Components/Rating',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-rating
      value=${args.value}
      max=${args.max}
      size=${args.size}
      ?readonly=${args.readonly}
      ?disabled=${args.disabled}
      ?clearable=${args.clearable}
    ></bq-rating>
  `,
  argTypes: {
    value:     { control: { type: 'number', min: 0, max: 10 } },
    max:       { control: { type: 'number', min: 1, max: 10 } },
    size:      { control: 'select', options: ['sm','md','lg'] },
    readonly:  { control: 'boolean' },
    disabled:  { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
  args: { value: 3, max: 5, size: 'md', readonly: false, disabled: false, clearable: false },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const ReadOnly: Story = { args: { readonly: true, value: 4 } };
export const Disabled: Story = { args: { disabled: true, value: 2 } };
export const Clearable: Story = { args: { clearable: true } };
export const TenStars: Story = { args: { max: 10, value: 7 } };
export const Sizes: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:0.5rem;align-items:flex-start">
      <bq-rating size="sm" value="3"></bq-rating>
      <bq-rating size="md" value="3"></bq-rating>
      <bq-rating size="lg" value="3"></bq-rating>
    </div>
  `,
};
