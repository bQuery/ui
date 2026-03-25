import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const columns = JSON.stringify([
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status' },
]);
const rows = JSON.stringify([
  { name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
  { name: 'Bob Smith', role: 'Designer', status: 'Active' },
  { name: 'Carol White', role: 'Manager', status: 'Inactive' },
]);

const meta: Meta = {
  title: 'Data/Table',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-table columns=${columns} rows=${rows} caption=${args.caption} sort-key=${args.sortKey} sort-dir=${args.sortDir} ?striped=${args.striped} ?bordered=${args.bordered} ?hover=${args.hover} ?loading=${args.loading}></bq-table>`,
  argTypes: {
    caption: { control: 'text' },
    sortKey: { control: 'select', options: ['', 'name', 'role'] },
    sortDir: { control: 'select', options: ['asc', 'desc'] },
    striped: { control: 'boolean' },
    bordered: { control: 'boolean' },
    hover: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    caption: '',
    sortKey: '',
    sortDir: 'asc',
    striped: false,
    bordered: false,
    hover: false,
    loading: false,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Striped: Story = { args: { striped: true } };
export const Bordered: Story = { args: { bordered: true } };
export const Hoverable: Story = { args: { hover: true } };
export const Loading: Story = { args: { loading: true } };
export const SortedByName: Story = {
  args: { sortKey: 'name', sortDir: 'asc' },
};
export const WithCaption: Story = {
  args: { caption: 'Team members and their roles' },
};
