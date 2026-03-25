import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

function renderDialogStory(args: {
  title: string;
  size: string;
  dismissible: boolean;
  content: string;
  triggerLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = storyHtml`
    <div style="display:flex;flex-direction:column;align-items:flex-start;gap:1rem">
      <bq-button variant="primary">${args.triggerLabel ?? 'Open dialog'}</bq-button>
      <bq-dialog title=${args.title} size=${args.size} ?dismissible=${args.dismissible}>
        <p>${args.content}</p>
        <div slot="footer">
          <bq-button variant="ghost">${args.cancelLabel ?? 'Cancel'}</bq-button>
          <bq-button variant="primary">${args.confirmLabel ?? 'Confirm'}</bq-button>
        </div>
      </bq-dialog>
    </div>
  `;

  const [openButton, dialog] = Array.from(
    container.querySelectorAll('bq-button, bq-dialog')
  ) as [HTMLElement | undefined, HTMLElement | undefined];
  const cancelButton = container.querySelector(
    'bq-dialog [slot="footer"] bq-button[variant="ghost"]'
  ) as HTMLElement | null;
  const confirmButton = container.querySelector(
    'bq-dialog [slot="footer"] bq-button[variant="primary"]'
  ) as HTMLElement | null;

  openButton?.addEventListener('bq-click', () => {
    dialog?.setAttribute('open', '');
  });

  cancelButton?.addEventListener('bq-click', () => {
    dialog?.removeAttribute('open');
  });

  confirmButton?.addEventListener('bq-click', () => {
    dialog?.removeAttribute('open');
  });

  return container;
}

const meta: Meta = {
  title: 'Overlays/Dialog',
  tags: ['autodocs'],
  render: (args) =>
    renderDialogStory({
      title: String(args.title ?? ''),
      size: String(args.size ?? 'md'),
      dismissible: Boolean(args.dismissible),
      content: String(args.content ?? ''),
    }),
  argTypes: {
    title: { control: 'text' },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    dismissible: { control: 'boolean' },
    content: { control: 'text' },
  },
  args: {
    title: 'Confirm action',
    size: 'md',
    dismissible: true,
    content: 'Are you sure you want to proceed? This action cannot be undone.',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const SmallDialog: Story = {
  render: () =>
    renderDialogStory({
      title: 'Quick confirm',
      size: 'sm',
      dismissible: true,
      content: 'Are you sure?',
      triggerLabel: 'Open small dialog',
      cancelLabel: 'No',
      confirmLabel: 'Yes',
    }),
};

export const LargeDialog: Story = {
  render: () =>
    renderDialogStory({
      title: 'Detailed view',
      size: 'lg',
      dismissible: true,
      content:
        'This is a large dialog with more space for content, forms, or complex layouts.',
      triggerLabel: 'Open large dialog',
      confirmLabel: 'Save',
    }),
};

export const ExtraLargeDialog: Story = {
  render: () =>
    renderDialogStory({
      title: 'Full content',
      size: 'xl',
      dismissible: true,
      content:
        'Extra-large dialogs are suitable for dashboards, previews, and multi-step flows.',
      triggerLabel: 'Open extra-large dialog',
      confirmLabel: 'Continue',
    }),
};

export const OpenByDefault: Story = {
  render: () =>
    renderDialogStory({
      title: 'Welcome',
      size: 'sm',
      dismissible: true,
      content:
        'This dialog can be opened immediately from the preview trigger.',
      triggerLabel: 'Open welcome dialog',
      cancelLabel: 'Close',
      confirmLabel: 'Got it',
    }),
};
