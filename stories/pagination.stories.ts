import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Navigation/Pagination',
  tags: ['autodocs'],
  render: (args) => storyHtml`<bq-pagination page=${args.page} total=${args.total} sibling-count=${args.siblingCount} ?disabled=${args.disabled}></bq-pagination>`,
  argTypes: {
    page:         { control: 'number' },
    total:        { control: 'number' },
    siblingCount: { control: 'number' },
    disabled:     { control: 'boolean' },
  },
  args: { page: 5, total: 20, siblingCount: 1, disabled: false },
};
export default meta;
type Story = StoryObj;

export const Default:  Story = {};
export const FirstPage:Story = { args: { page: 1 } };
export const LastPage: Story = { args: { page: 20 } };
export const Disabled: Story = { args: { disabled: true } };
