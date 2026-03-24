import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

function renderDrawerStory(args: {
  title: string;
  placement: string;
  size: string;
  triggerLabel?: string;
  closeLabel?: string;
  content?: string;
}): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = storyHtml`
    <div style="display:flex;flex-direction:column;align-items:flex-start;gap:1rem">
      <bq-button variant="primary">${args.triggerLabel ?? 'Open drawer'}</bq-button>
      <bq-drawer title=${args.title} placement=${args.placement} size=${args.size}>
        <p>${args.content ?? 'Drawer content goes here.'}</p>
        <div slot="footer">
          <bq-button variant="ghost">${args.closeLabel ?? 'Close'}</bq-button>
        </div>
      </bq-drawer>
    </div>
  `;

  const [openButton, drawer] = Array.from(
    container.querySelectorAll('bq-button, bq-drawer')
  ) as [HTMLElement | undefined, HTMLElement | undefined];
  const closeButton = container.querySelector(
    'bq-drawer [slot="footer"] bq-button'
  ) as HTMLElement | null;

  openButton?.addEventListener('bq-click', () => {
    drawer?.setAttribute('open', '');
  });

  closeButton?.addEventListener('bq-click', () => {
    drawer?.removeAttribute('open');
  });

  return container;
}

const meta: Meta = {
  title: 'Overlays/Drawer',
  tags: ['autodocs'],
  render: (args) =>
    renderDrawerStory({
      title: String(args.title ?? ''),
      placement: String(args.placement ?? 'right'),
      size: String(args.size ?? 'md'),
    }),
  argTypes: {
    title: { control: 'text' },
    placement: {
      control: 'select',
      options: ['right', 'left', 'top', 'bottom'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg', 'full'] },
  },
  args: { title: 'Settings', placement: 'right', size: 'md' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const LeftSide: Story = {
  args: { placement: 'left', title: 'Navigation' },
};
export const BottomSheet: Story = {
  args: { placement: 'bottom', title: 'Options', size: 'sm' },
};
export const TopPanel: Story = {
  args: { placement: 'top', title: 'Search', size: 'sm' },
};
export const FullWidth: Story = {
  args: { placement: 'right', title: 'Full Drawer', size: 'full' },
};
export const OpenByDefault: Story = {
  render: () =>
    renderDrawerStory({
      title: 'Notifications',
      placement: 'right',
      size: 'sm',
      triggerLabel: 'Open notifications drawer',
      closeLabel: 'Dismiss',
      content: 'You have 3 new notifications.',
    }),
};
