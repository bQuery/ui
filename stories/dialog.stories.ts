import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Overlays/Dialog',
  tags: ['autodocs'],
  render: (args) => html`
    <bq-button variant="primary" id="open-dialog-btn">Open dialog</bq-button>
    <bq-dialog id="demo-dialog" title=${args.title} size=${args.size} ?dismissible=${args.dismissible}>
      <p>${args.content}</p>
      <div slot="footer">
        <bq-button variant="ghost" id="cancel-btn">Cancel</bq-button>
        <bq-button variant="primary">Confirm</bq-button>
      </div>
    </bq-dialog>
    <script>
      document.getElementById('open-dialog-btn')?.addEventListener('bq-click', () => {
        document.getElementById('demo-dialog')?.setAttribute('open', '');
      });
      document.getElementById('cancel-btn')?.addEventListener('bq-click', () => {
        document.getElementById('demo-dialog')?.removeAttribute('open');
      });
    </script>
  `,
  argTypes: {
    title:      { control: 'text' },
    size:       { control: 'select', options: ['sm','md','lg','xl'] },
    dismissible:{ control: 'boolean' },
    content:    { control: 'text' },
  },
  args: { title: 'Confirm action', size: 'md', dismissible: true, content: 'Are you sure you want to proceed? This action cannot be undone.' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const OpenByDefault: Story = {
  render: () => html`
    <bq-dialog open title="Welcome" size="sm">
      <p>This dialog is open by default in this story.</p>
      <div slot="footer"><bq-button variant="primary">Got it</bq-button></div>
    </bq-dialog>
  `,
};
