import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Copies text to the clipboard and confirms it did, because a copy button
 * without feedback is indistinguishable from a dead one.
 */
const meta: Meta = {
  title: 'Components/Copy Button',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-copy-button
      value=${args.value}
      variant=${args.variant}
      size=${args.size}
      ?disabled=${args.disabled}
    ></bq-copy-button>
  `,
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'outline', 'solid'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
  },
  args: { value: 'npm install @bquery/ui', variant: 'ghost', size: 'md', disabled: false },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const CopiesAnotherElement: Story = {
  render: () => storyHtml`
    <div style="display:flex;align-items:center;gap:0.5rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.5rem 0.75rem">
      <code id="install-snippet" style="flex:1">npm install @bquery/ui</code>
      <bq-copy-button from="#install-snippet"></bq-copy-button>
    </div>
  `,
};

export const Variants: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:0.75rem;align-items:center">
      <bq-copy-button value="ghost" variant="ghost"></bq-copy-button>
      <bq-copy-button value="outline" variant="outline"></bq-copy-button>
      <bq-copy-button value="solid" variant="solid"></bq-copy-button>
    </div>
  `,
};
