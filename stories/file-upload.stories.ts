import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Drop zone backed by a native file input, with client-side type and size
 * filtering. Drag and drop is an enhancement; the zone is a real button.
 */
const meta: Meta = {
  title: 'Components/File Upload',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-file-upload
      label=${args.label}
      accept=${args.accept}
      hint=${args.hint}
      error=${args.error}
      max-size=${args.maxSize}
      ?multiple=${args.multiple}
      ?disabled=${args.disabled}
    ></bq-file-upload>
  `,
  argTypes: {
    label:    { control: 'text' },
    accept:   { control: 'text' },
    hint:     { control: 'text' },
    error:    { control: 'text' },
    maxSize:  { control: 'number' },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Attachments', accept: '', hint: '', error: '',
    maxSize: 0, multiple: false, disabled: false,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Multiple: Story = { args: { multiple: true, hint: 'Select as many files as you like' } };
export const ImagesOnly: Story = { args: { accept: 'image/*', hint: 'Images only' } };
export const SizeLimited: Story = { args: { maxSize: 5242880, hint: 'Up to 5 MB per file' } };
export const WithError: Story = { args: { error: 'Upload failed, please try again' } };
export const Disabled: Story = { args: { disabled: true } };
