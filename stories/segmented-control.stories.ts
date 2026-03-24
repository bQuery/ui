import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Forms/Segmented Control',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-segmented-control
      label="View mode"
      hint="Choose the layout that fits the current task."
      name="view-mode"
      value=${args.value}
      size=${args.size}
      ?full-width=${args.fullWidth}
    >
      <button value="overview">Overview</button>
      <button value="board">Board</button>
      <button value="activity">Activity</button>
    </bq-segmented-control>
  `,
  argTypes: {
    value: { control: 'select', options: ['overview', 'board', 'activity'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    fullWidth: { control: 'boolean' },
  },
  args: {
    value: 'overview',
    size: 'md',
    fullWidth: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Large: Story = { args: { size: 'lg' } };
export const FullWidth: Story = { args: { fullWidth: true } };
