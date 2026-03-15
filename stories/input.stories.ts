import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Text input field with label, hint, error, and slot support.
 */
const meta: Meta = {
  title: 'Forms/Input',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-input
      label=${args.label} type=${args.type} placeholder=${args.placeholder}
      size=${args.size} ?disabled=${args.disabled} ?required=${args.required}
      error=${args.error} hint=${args.hint}
    ></bq-input>
  `,
  argTypes: {
    label:      { control: 'text' },
    type:       { control: 'select', options: ['text','email','password','number','tel','url','search'] },
    placeholder:{ control: 'text' },
    size:       { control: 'select', options: ['sm','md','lg'] },
    disabled:   { control: 'boolean' },
    required:   { control: 'boolean' },
    error:      { control: 'text' },
    hint:       { control: 'text' },
  },
  args: { label: 'Email address', type: 'email', placeholder: 'you@example.com', size: 'md', disabled: false, required: false, error: '', hint: "We'll never share your email." },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const WithError: Story = { args: { error: 'Invalid email address', hint: '' } };
export const Disabled: Story = { args: { disabled: true } };
export const Required: Story = { args: { required: true } };
export const Password: Story = { args: { label: 'Password', type: 'password', placeholder: 'Enter password', hint: '' } };
export const AllSizes: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:1rem;max-width:28rem">
      <bq-input label="Small" size="sm" placeholder="Small input"></bq-input>
      <bq-input label="Medium" size="md" placeholder="Medium input"></bq-input>
      <bq-input label="Large" size="lg" placeholder="Large input"></bq-input>
    </div>
  `,
};
