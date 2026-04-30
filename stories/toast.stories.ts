import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Feedback/Toast',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-toast variant=${args.variant} message=${args.message} duration="0" ?dismissible=${args.dismissible}></bq-toast>`,
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'error', 'warning'],
    },
    message: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  args: {
    variant: 'info',
    message: 'This is a notification',
    dismissible: true,
  },
};
export default meta;
type Story = StoryObj;

export const Info: Story = {};
export const Success: Story = {
  args: { variant: 'success', message: 'Changes saved successfully!' },
};
export const Error: Story = {
  args: { variant: 'error', message: 'Failed to save changes.' },
};
export const Warning: Story = {
  args: { variant: 'warning', message: 'Disk space is running low.' },
};
export const AllVariants: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      <bq-toast variant="info"    message="Informational message." duration="0"></bq-toast>
      <bq-toast variant="success" message="Operation completed." duration="0"></bq-toast>
      <bq-toast variant="warning" message="Review required." duration="0"></bq-toast>
      <bq-toast variant="error"   message="An error occurred." duration="0"></bq-toast>
    </div>
  `,
};

export const NonDismissible: Story = {
  render: () => storyHtml`
    <bq-toast variant="info" message="This notification cannot be dismissed." duration="0" ?dismissible=${false}></bq-toast>
  `,
};

/**
 * Demonstrates the imperative `showToast()` API across the six anchor positions.
 * Each button mounts a real toast in its target corner; the underlying container
 * is created lazily on first use and re-used for subsequent calls.
 */
export const ImperativePositions: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;max-width:32rem">
      <button onclick="window.__showToast?.('top-left')">top-left</button>
      <button onclick="window.__showToast?.('top-center')">top-center</button>
      <button onclick="window.__showToast?.('top-right')">top-right</button>
      <button onclick="window.__showToast?.('bottom-left')">bottom-left</button>
      <button onclick="window.__showToast?.('bottom-center')">bottom-center</button>
      <button onclick="window.__showToast?.('bottom-right')">bottom-right</button>
    </div>
    <script type="module">
      import { showToast } from '/src/components/toast/BqToast.ts';
      window.__showToast = (position) => showToast({
        variant: 'info',
        message: 'Anchored at ' + position,
        position,
        duration: 3000,
      });
    </script>
  `,
};
