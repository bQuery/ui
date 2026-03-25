import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Forms/Textarea',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-textarea label=${args.label} placeholder=${args.placeholder} rows=${args.rows} ?disabled=${args.disabled} ?required=${args.required} error=${args.error} hint=${args.hint}></bq-textarea>`,
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    rows: { control: 'number' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'text' },
    hint: { control: 'text' },
  },
  args: {
    label: 'Message',
    placeholder: 'Write your message…',
    rows: 4,
    disabled: false,
    required: false,
    error: '',
    hint: 'Max 500 characters',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const WithError: Story = {
  args: { error: 'Message is required', hint: '' },
};
export const Disabled: Story = { args: { disabled: true } };

export const CharacterCounter: Story = {
  render: () => storyHtml`
    <bq-textarea label="Bio" placeholder="Tell us about yourself…" maxlength="200" show-counter hint="Max 200 characters"></bq-textarea>
  `,
};

export const Readonly: Story = {
  render: () => storyHtml`
    <bq-textarea label="Terms" value="These are the terms of service. They cannot be edited." readonly rows="3"></bq-textarea>
  `,
};
