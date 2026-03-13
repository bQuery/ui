import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Layout/Accordion',
  tags: ['autodocs'],
  render: (args) => html`
    <bq-accordion label=${args.label} ?open=${args.open} ?disabled=${args.disabled} variant=${args.variant}>
      ${args.content}
    </bq-accordion>
  `,
  argTypes: {
    label:    { control: 'text' },
    open:     { control: 'boolean' },
    disabled: { control: 'boolean' },
    variant:  { control: 'select', options: ['default','bordered','flush'] },
    content:  { control: 'text' },
  },
  args: { label: 'What is bQuery?', open: false, disabled: false, variant: 'default', content: 'bQuery is a modern, lightweight web component library.' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Open:    Story = { args: { open: true } };
export const Bordered:Story = { args: { variant: 'bordered' } };
export const Multiple:Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:0.5rem">
      <bq-accordion variant="bordered" label="Section 1">Content for section 1.</bq-accordion>
      <bq-accordion variant="bordered" label="Section 2" open>Content for section 2.</bq-accordion>
      <bq-accordion variant="bordered" label="Section 3">Content for section 3.</bq-accordion>
    </div>
  `,
};
