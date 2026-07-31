import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Rich overlay anchored to a trigger. Unlike `bq-tooltip` it holds interactive
 * content, opens on click, and manages focus.
 */
const meta: Meta = {
  title: 'Components/Popover',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <div style="padding:5rem;display:flex;justify-content:center">
      <bq-popover
        placement=${args.placement}
        heading=${args.heading}
        ?dismissible=${args.dismissible}
        ?arrow=${args.arrow}
      >
        <bq-button slot="trigger">Open popover</bq-button>
        Choose how results are sorted and filtered.
      </bq-popover>
    </div>
  `,
  argTypes: {
    placement:   { control: 'select', options: ['top','bottom','left','right','bottom-start','bottom-end','top-start','top-end'] },
    heading:     { control: 'text' },
    dismissible: { control: 'boolean' },
    arrow:       { control: 'boolean' },
  },
  args: { placement: 'bottom', heading: 'Filters', dismissible: true, arrow: true },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Top: Story = { args: { placement: 'top' } };
export const NoHeading: Story = { args: { heading: '', dismissible: false } };
export const WithFooter: Story = {
  render: () => storyHtml`
    <div style="padding:5rem;display:flex;justify-content:center">
      <bq-popover heading="Delete project">
        <bq-button slot="trigger" variant="danger">Delete</bq-button>
        This cannot be undone.
        <bq-button slot="footer" variant="ghost" size="sm">Cancel</bq-button>
        <bq-button slot="footer" variant="danger" size="sm">Delete</bq-button>
      </bq-popover>
    </div>
  `,
};
