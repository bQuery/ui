import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Joins related buttons into a single visual control. For a single-choice
 * control prefer `bq-segmented-control`, which has radio-group semantics.
 */
const meta: Meta = {
  title: 'Components/Button Group',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-button-group
      orientation=${args.orientation}
      size=${args.size}
      ?attached=${args.attached}
      label="Text alignment"
    >
      <bq-button variant="outline">Left</bq-button>
      <bq-button variant="outline">Center</bq-button>
      <bq-button variant="outline">Right</bq-button>
    </bq-button-group>
  `,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal','vertical'] },
    size:        { control: 'select', options: ['sm','md','lg'] },
    attached:    { control: 'boolean' },
  },
  args: { orientation: 'horizontal', size: 'md', attached: false },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Attached: Story = { args: { attached: true } };
export const Vertical: Story = { args: { orientation: 'vertical', attached: true } };
export const Small: Story = { args: { size: 'sm', attached: true } };
