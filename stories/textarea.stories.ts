import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Forms/Textarea',
  tags: ['autodocs'],
  render: (args) => storyHtml`<bq-textarea label=${args.label} placeholder=${args.placeholder} rows=${args.rows} ?disabled=${args.disabled} ?required=${args.required} error=${args.error} hint=${args.hint}></bq-textarea>`,
  argTypes: {
    label:      { control: 'text' },
    placeholder:{ control: 'text' },
    rows:       { control: 'number' },
    disabled:   { control: 'boolean' },
    required:   { control: 'boolean' },
    error:      { control: 'text' },
    hint:       { control: 'text' },
  },
  args: { label: 'Message', placeholder: 'Write your message…', rows: 4, disabled: false, required: false, error: '', hint: 'Max 500 characters' },
};
export default meta;
type Story = StoryObj;

export const Default:   Story = {};
export const WithError: Story = { args: { error: 'Message is required', hint: '' } };
export const Disabled:  Story = { args: { disabled: true } };
