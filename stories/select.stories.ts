import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Forms/Select',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-select label=${args.label} value=${args.value} placeholder=${args.placeholder} size=${args.size} hint=${args.hint} ?disabled=${args.disabled} ?required=${args.required} error=${args.error}>
      <option value="react">React</option>
      <option value="vue">Vue</option>
      <option value="angular">Angular</option>
      <option value="svelte">Svelte</option>
    </bq-select>
  `,
  argTypes: {
    label: { control: 'text' },
    value: {
      control: 'select',
      options: ['', 'react', 'vue', 'angular', 'svelte'],
    },
    placeholder: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    hint: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'text' },
  },
  args: {
    label: 'Framework',
    value: '',
    placeholder: 'Select a framework',
    size: 'md',
    hint: 'Used for generated examples and docs snippets.',
    disabled: false,
    required: false,
    error: '',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const WithError: Story = { args: { error: 'Please select an option' } };
export const Disabled: Story = { args: { disabled: true } };
export const Selected: Story = { args: { value: 'vue' } };
