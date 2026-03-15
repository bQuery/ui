import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Components/EmptyState',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-empty-state icon=${args.icon} title=${args.title} description=${args.description}>
      <bq-button variant="primary">Get started</bq-button>
    </bq-empty-state>
  `,
  argTypes: {
    icon:        { control: 'text' },
    title:       { control: 'text' },
    description: { control: 'text' },
  },
  args: { icon: '📭', title: 'No results found', description: 'Try adjusting your search or filter criteria.' },
};
export default meta;
type Story = StoryObj;

export const Default:    Story = {};
export const NoResults:  Story = { args: { icon: '🔍', title: 'No results', description: 'Try different keywords.' } };
export const EmptyInbox: Story = { args: { icon: '📬', title: 'Your inbox is empty', description: 'No messages to show.' } };
