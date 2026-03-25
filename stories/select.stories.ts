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

export const AllSizes: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:1rem;max-width:28rem">
      <bq-select label="Small" size="sm" placeholder="Choose…">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </bq-select>
      <bq-select label="Medium" size="md" placeholder="Choose…">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </bq-select>
      <bq-select label="Large" size="lg" placeholder="Choose…">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </bq-select>
    </div>
  `,
};

export const WithOptGroup: Story = {
  render: () => storyHtml`
    <bq-select label="Programming Language" placeholder="Select a language" hint="Group by paradigm">
      <optgroup label="Object-oriented">
        <option value="java">Java</option>
        <option value="csharp">C#</option>
      </optgroup>
      <optgroup label="Functional">
        <option value="haskell">Haskell</option>
        <option value="elixir">Elixir</option>
      </optgroup>
    </bq-select>
  `,
};

export const Required: Story = { args: { required: true } };
