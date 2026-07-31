import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Full-width page-level announcement. Use `bq-alert` for section-scoped messages
 * and `bq-toast` for transient notifications.
 */
const meta: Meta = {
  title: 'Components/Banner',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-banner variant=${args.variant} ?dismissible=${args.dismissible} ?sticky=${args.sticky}>
      ${args.message}
    </bq-banner>
  `,
  argTypes: {
    variant:     { control: 'select', options: ['info','success','warning','danger','neutral'] },
    dismissible: { control: 'boolean' },
    sticky:      { control: 'boolean' },
    message:     { control: 'text' },
  },
  args: {
    variant: 'info',
    dismissible: false,
    sticky: false,
    message: 'Scheduled maintenance on Sunday, 02:00–04:00 UTC.',
  },
};
export default meta;
type Story = StoryObj;

export const Info: Story = {};
export const Warning: Story = { args: { variant: 'warning', message: 'Your trial ends in 3 days.' } };
export const Danger: Story = { args: { variant: 'danger', message: 'We could not process your last payment.' } };
export const Dismissible: Story = { args: { dismissible: true, variant: 'warning', message: 'Your trial ends in 3 days.' } };
export const WithIconAndActions: Story = {
  render: () => storyHtml`
    <bq-banner variant="warning" dismissible>
      <span slot="icon">⚠️</span>
      Your trial ends in 3 days.
      <bq-button slot="actions" size="sm">Upgrade</bq-button>
    </bq-banner>
  `,
};
export const AllVariants: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:0.5rem">
      <bq-banner variant="info">Informational message</bq-banner>
      <bq-banner variant="success">Everything worked</bq-banner>
      <bq-banner variant="warning">Something needs attention</bq-banner>
      <bq-banner variant="danger">Something went wrong</bq-banner>
      <bq-banner variant="neutral">Neutral notice</bq-banner>
    </div>
  `,
};
