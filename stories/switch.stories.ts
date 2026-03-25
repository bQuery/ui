import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Forms/Switch',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-switch label=${args.label} ?checked=${args.checked} ?disabled=${args.disabled} size=${args.size}></bq-switch>`,
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
  args: { label: 'Dark mode', checked: false, disabled: false, size: 'md' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const On: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };

export const AllSizes: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:1rem">
      <bq-switch label="Small" size="sm"></bq-switch>
      <bq-switch label="Medium" size="md"></bq-switch>
      <bq-switch label="Large" size="lg"></bq-switch>
    </div>
  `,
};
