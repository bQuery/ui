import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Forms/Select',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-select label=${args.label} placeholder=${args.placeholder} size=${args.size} ?disabled=${args.disabled} ?required=${args.required} error=${args.error}>
      <option value="react">React</option>
      <option value="vue">Vue</option>
      <option value="angular">Angular</option>
      <option value="svelte">Svelte</option>
    </bq-select>
  `,
  argTypes: {
    label:      { control: 'text' },
    placeholder:{ control: 'text' },
    size:       { control: 'select', options: ['sm','md','lg'] },
    disabled:   { control: 'boolean' },
    required:   { control: 'boolean' },
    error:      { control: 'text' },
  },
  args: { label: 'Framework', placeholder: 'Select a framework', size: 'md', disabled: false, required: false, error: '' },
};
export default meta;
type Story = StoryObj;

export const Default:  Story = {};
export const WithError:Story = { args: { error: 'Please select an option' } };
export const Disabled: Story = { args: { disabled: true } };
