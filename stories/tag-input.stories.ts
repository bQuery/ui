import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Forms/Tag Input',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-tag-input
      label=${args.label}
      hint=${args.hint}
      value=${args.value}
      size=${args.size}
      max=${args.max}
      delimiters=${args.delimiters}
      ?allow-duplicates=${args.allowDuplicates}
      ?disabled=${args.disabled}
      ?required=${args.required}
      error=${args.error}
    ></bq-tag-input>
  `,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    max: { control: 'number' },
    allowDuplicates: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    label: 'Keywords',
    hint: 'Press Enter or type a comma to add a tag.',
    value: 'web,components',
    size: 'md',
    max: 0,
    delimiters: ',',
    allowDuplicates: false,
    disabled: false,
    required: false,
    error: '',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const WithLimit: Story = { args: { max: 3, value: 'one,two,three' } };
export const SpaceDelimited: Story = { args: { delimiters: ', ', value: '' } };
export const WithError: Story = { args: { value: '', required: true, error: 'Add at least one keyword.' } };
export const Disabled: Story = { args: { disabled: true } };
