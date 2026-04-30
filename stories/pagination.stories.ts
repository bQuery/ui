import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Navigation/Pagination',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-pagination page=${args.page} total=${args.total} sibling-count=${args.siblingCount} ?show-first-last=${args.showFirstLast} ?disabled=${args.disabled}></bq-pagination>`,
  argTypes: {
    page: { control: 'number' },
    total: { control: 'number' },
    siblingCount: { control: 'number' },
    showFirstLast: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    page: 5,
    total: 20,
    siblingCount: 1,
    showFirstLast: false,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const FirstPage: Story = { args: { page: 1 } };
export const LastPage: Story = { args: { page: 20 } };
export const WithFirstLast: Story = { args: { showFirstLast: true } };
export const Disabled: Story = { args: { disabled: true } };
