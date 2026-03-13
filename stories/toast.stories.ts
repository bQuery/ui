import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Feedback/Toast',
  tags: ['autodocs'],
  render: (args) => html`<bq-toast variant=${args.variant} message=${args.message} duration="0" ?dismissible=${args.dismissible}></bq-toast>`,
  argTypes: {
    variant:    { control: 'select', options: ['info','success','error','warning'] },
    message:    { control: 'text' },
    dismissible:{ control: 'boolean' },
  },
  args: { variant: 'info', message: 'This is a notification', dismissible: true },
};
export default meta;
type Story = StoryObj;

export const Info:    Story = {};
export const Success: Story = { args: { variant: 'success', message: 'Changes saved successfully!' } };
export const Error:   Story = { args: { variant: 'error',   message: 'Failed to save changes.' } };
export const Warning: Story = { args: { variant: 'warning', message: 'Disk space is running low.' } };
export const AllVariants: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      <bq-toast variant="info"    message="Informational message." duration="0"></bq-toast>
      <bq-toast variant="success" message="Operation completed." duration="0"></bq-toast>
      <bq-toast variant="warning" message="Review required." duration="0"></bq-toast>
      <bq-toast variant="error"   message="An error occurred." duration="0"></bq-toast>
    </div>
  `,
};
