import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Forms/Combobox',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-combobox
      label=${args.label}
      hint=${args.hint}
      placeholder=${args.placeholder}
      size=${args.size}
      filter-mode=${args.filterMode}
      ?multiple=${args.multiple}
      ?clearable=${args.clearable}
      ?disabled=${args.disabled}
      ?required=${args.required}
      error=${args.error}
    >
      <option value="de">Germany</option>
      <option value="fr">France</option>
      <option value="es">Spain</option>
      <option value="pt">Portugal</option>
      <option value="it">Italy</option>
      <option value="br">Brazil (São Paulo)</option>
      <option value="ch" disabled>Switzerland</option>
    </bq-combobox>
  `,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    filterMode: { control: 'select', options: ['contains', 'starts-with'] },
    multiple: { control: 'boolean' },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    label: 'Country',
    hint: 'Start typing to filter the list.',
    placeholder: 'Search countries…',
    size: 'md',
    filterMode: 'contains',
    multiple: false,
    clearable: false,
    disabled: false,
    required: false,
    error: '',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Multiple: Story = { args: { multiple: true, clearable: true } };
export const StartsWith: Story = { args: { filterMode: 'starts-with' } };
export const WithError: Story = { args: { required: true, error: 'Please pick a country.' } };
export const Disabled: Story = { args: { disabled: true } };

export const Grouped: Story = {
  render: () => storyHtml`
    <bq-combobox label="Framework" clearable>
      <optgroup label="Frontend">
        <option value="vue">Vue</option>
        <option value="svelte">Svelte</option>
        <option value="solid">Solid</option>
      </optgroup>
      <optgroup label="Backend">
        <option value="hono">Hono</option>
        <option value="fastify">Fastify</option>
      </optgroup>
    </bq-combobox>
  `,
};
