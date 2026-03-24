import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Overlays/Drawer',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-button variant="primary" id="open-drawer-btn">Open Drawer</bq-button>
    <bq-drawer id="demo-drawer" title=${args.title} placement=${args.placement} size=${args.size}>
      <p>Drawer content goes here.</p>
      <div slot="footer">
        <bq-button variant="ghost" id="close-drawer-btn">Close</bq-button>
      </div>
    </bq-drawer>
    <script>
      document.getElementById('open-drawer-btn')?.addEventListener('bq-click', () => {
        document.getElementById('demo-drawer')?.setAttribute('open', '');
      });
      document.getElementById('close-drawer-btn')?.addEventListener('bq-click', () => {
        document.getElementById('demo-drawer')?.removeAttribute('open');
      });
    </script>
  `,
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
  render: () => storyHtml`
    <bq-drawer open title="Notifications" placement="right" size="sm">
      <p>You have 3 new notifications.</p>
    </bq-drawer>
  `,
};
