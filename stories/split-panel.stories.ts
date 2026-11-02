import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const pane = 'padding: 1rem; height: 100%; background: var(--bq-bg-subtle, #f8fafc);';

const meta: Meta = {
  title: 'Layout/Split Panel',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <div style="height: 20rem; border: 1px solid var(--bq-border-base, #e2e8f0); border-radius: 0.5rem; overflow: hidden;">
      <bq-split-panel
        position=${args.position}
        min=${args.min}
        max=${args.max}
        step=${args.step}
        snap=${args.snap}
        orientation=${args.orientation}
        ?disabled=${args.disabled}
      >
        <div slot="start" style=${pane}>Start pane</div>
        <div slot="end" style=${pane}>End pane</div>
      </bq-split-panel>
    </div>
  `,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    position: { control: { type: 'range', min: 0, max: 100 } },
    disabled: { control: 'boolean' },
  },
  args: {
    position: 35,
    min: 10,
    max: 90,
    step: 5,
    snap: '',
    orientation: 'horizontal',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Vertical: Story = { args: { orientation: 'vertical', position: 60 } };
export const WithSnapPoints: Story = { args: { snap: '25 50 75' } };
export const Disabled: Story = { args: { disabled: true } };
