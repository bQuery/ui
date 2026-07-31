import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Stacks avatars and collapses the remainder into a `+N` counter.
 */
const meta: Meta = {
  title: 'Components/Avatar Group',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-avatar-group max=${args.max} size=${args.size} spacing=${args.spacing}>
      <bq-avatar initials="AB"></bq-avatar>
      <bq-avatar initials="CD"></bq-avatar>
      <bq-avatar initials="EF"></bq-avatar>
      <bq-avatar initials="GH"></bq-avatar>
      <bq-avatar initials="IJ"></bq-avatar>
    </bq-avatar-group>
  `,
  argTypes: {
    max:     { control: { type: 'number', min: 0, max: 5 } },
    size:    { control: 'select', options: ['xs','sm','md','lg','xl'] },
    spacing: { control: 'select', options: ['tight','normal','loose'] },
  },
  args: { max: 3, size: 'md', spacing: 'normal' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const ShowAll: Story = { args: { max: 0 } };
export const Small: Story = { args: { size: 'sm', max: 3 } };
export const Tight: Story = { args: { spacing: 'tight' } };
