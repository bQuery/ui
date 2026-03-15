import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Contextual status messages for success, error, warning, and info states.
 */
const meta: Meta = {
  title: 'Feedback/Alert',
  tags: ['autodocs'],
  render: (args) => storyHtml`<bq-alert variant=${args.variant} title=${args.title} ?dismissible=${args.dismissible}>${args.message}</bq-alert>`,
  argTypes: {
    variant:    { control: 'select', options: ['info','success','warning','danger'] },
    title:      { control: 'text' },
    dismissible:{ control: 'boolean' },
    message:    { control: 'text' },
  },
  args: { variant: 'info', title: 'Heads up!', dismissible: false, message: 'This is an informational alert.' },
};
export default meta;
type Story = StoryObj;

export const Info:    Story = {};
export const Success: Story = { args: { variant: 'success', title: 'Done!',    message: 'Your changes were saved.' } };
export const Warning: Story = { args: { variant: 'warning', title: 'Warning!', message: 'Please review before continuing.' } };
export const Danger:  Story = { args: { variant: 'danger',  title: 'Error!',   message: 'Something went wrong.' } };
export const Dismissible: Story = { args: { dismissible: true, title: 'Dismissible' } };
export const AllVariants: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:1rem">
      <bq-alert variant="info"    title="Info">Informational message.</bq-alert>
      <bq-alert variant="success" title="Success">Your action was successful.</bq-alert>
      <bq-alert variant="warning" title="Warning">Proceed with caution.</bq-alert>
      <bq-alert variant="danger"  title="Error">An error occurred.</bq-alert>
    </div>
  `,
};
