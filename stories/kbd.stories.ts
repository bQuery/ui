import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Renders a keystroke or key combination. Common key names are replaced with their symbol.
 */
const meta: Meta = {
  title: 'Components/Kbd',
  tags: ['autodocs'],
  render: (args) => storyHtml`<bq-kbd keys=${args.keys} size=${args.size} variant=${args.variant}></bq-kbd>`,
  argTypes: {
    keys:    { control: 'text' },
    size:    { control: 'select', options: ['sm','md','lg'] },
    variant: { control: 'select', options: ['solid','outline'] },
  },
  args: { keys: 'Ctrl+K', size: 'md', variant: 'solid' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Outline: Story = { args: { variant: 'outline' } };
export const SingleKey: Story = { args: { keys: 'Esc' } };
export const Symbols: Story = { args: { keys: 'Cmd+Shift+Enter' } };
export const Sizes: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:0.75rem;align-items:center">
      <bq-kbd size="sm" keys="Ctrl+C"></bq-kbd>
      <bq-kbd size="md" keys="Ctrl+C"></bq-kbd>
      <bq-kbd size="lg" keys="Ctrl+C"></bq-kbd>
    </div>
  `,
};
