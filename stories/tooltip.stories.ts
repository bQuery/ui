import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/Tooltip',
  tags: ['autodocs'],
  render: (args) => html`
    <div style="padding:4rem;display:inline-block">
      <bq-tooltip content=${args.content} placement=${args.placement} delay=${args.delay}>
        <bq-button>Hover me</bq-button>
      </bq-tooltip>
    </div>
  `,
  argTypes: {
    content:   { control: 'text' },
    placement: { control: 'select', options: ['top','bottom','left','right'] },
    delay:     { control: 'number' },
  },
  args: { content: 'Tooltip text', placement: 'top', delay: 200 },
};
export default meta;
type Story = StoryObj;

export const Top:    Story = {};
export const Bottom: Story = { args: { placement: 'bottom' } };
export const Left:   Story = { args: { placement: 'left' } };
export const Right:  Story = { args: { placement: 'right' } };
