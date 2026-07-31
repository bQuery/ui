import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Ordered list of events along a connecting line. Mark the final entry with
 * `last` to drop its trailing connector.
 */
const meta: Meta = {
  title: 'Components/Timeline',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-timeline variant=${args.variant}>
      <bq-timeline-item headline="Order placed" timestamp="Mar 1" datetime="2026-03-01">
        Payment authorized.
      </bq-timeline-item>
      <bq-timeline-item headline="Shipped" timestamp="Mar 3" datetime="2026-03-03" variant="info">
        Left the warehouse.
      </bq-timeline-item>
      <bq-timeline-item headline="Delivered" timestamp="Mar 5" datetime="2026-03-05" variant="success" last>
        Signed for by A. Berger.
      </bq-timeline-item>
    </bq-timeline>
  `,
  argTypes: {
    variant: { control: 'select', options: ['default','compact'] },
  },
  args: { variant: 'default' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Compact: Story = { args: { variant: 'compact' } };
export const Variants: Story = {
  render: () => storyHtml`
    <bq-timeline>
      <bq-timeline-item variant="primary" headline="Created" timestamp="09:00"></bq-timeline-item>
      <bq-timeline-item variant="info" headline="Commented" timestamp="10:15"></bq-timeline-item>
      <bq-timeline-item variant="warning" headline="Needs review" timestamp="11:30"></bq-timeline-item>
      <bq-timeline-item variant="danger" headline="Rejected" timestamp="13:00"></bq-timeline-item>
      <bq-timeline-item variant="success" headline="Approved" timestamp="15:45" last></bq-timeline-item>
    </bq-timeline>
  `,
};
export const CustomMarker: Story = {
  render: () => storyHtml`
    <bq-timeline>
      <bq-timeline-item headline="Deployed" timestamp="Today">
        <span slot="marker">🚀</span>
        Release 1.15.0 is live.
      </bq-timeline-item>
      <bq-timeline-item headline="Tagged" timestamp="Yesterday" last>
        <span slot="marker">🏷️</span>
        Version bumped.
      </bq-timeline-item>
    </bq-timeline>
  `,
};
