import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const FILES = JSON.stringify([
  {
    id: 'src',
    label: 'src',
    icon: 'folder',
    children: [
      { id: 'index', label: 'index.ts', icon: 'file' },
      {
        id: 'components',
        label: 'components',
        icon: 'folder',
        children: [
          { id: 'button', label: 'BqButton.ts', icon: 'file' },
          { id: 'input', label: 'BqInput.ts', icon: 'file' },
        ],
      },
      { id: 'utils', label: 'utils', icon: 'folder', children: [{ id: 'dom', label: 'dom.ts', icon: 'file' }] },
    ],
  },
  { id: 'readme', label: 'README.md', icon: 'file' },
  { id: 'lock', label: 'node_modules', icon: 'folder', disabled: true },
]);

/**
 * Hierarchical navigation with the full ARIA tree keyboard pattern: one tab
 * stop for the whole widget, arrows to move, Right/Left to open and close,
 * and first-letter typeahead.
 */
const meta: Meta = {
  title: 'Components/Tree',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-tree
      items=${FILES}
      label=${args.label}
      expanded=${args.expanded}
      selected=${args.selected}
      ?multiple=${args.multiple}
    ></bq-tree>
  `,
  argTypes: {
    label: { control: 'text' },
    expanded: { control: 'text' },
    selected: { control: 'text' },
    multiple: { control: 'boolean' },
  },
  args: { label: 'Project files', expanded: 'src', selected: '', multiple: false },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Collapsed: Story = { args: { expanded: '' } };
export const DeepBranchOpen: Story = { args: { expanded: 'src,components', selected: 'button' } };
export const MultiSelect: Story = { args: { multiple: true, selected: 'readme', expanded: 'src' } };
