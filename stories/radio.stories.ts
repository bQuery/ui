import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Forms/Radio',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-radio label=${args.label} name="demo" value=${args.value} ?checked=${args.checked} ?disabled=${args.disabled} ?required=${args.required} hint=${args.hint}></bq-radio>`,
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    hint: { control: 'text' },
  },
  args: {
    label: 'Option A',
    value: 'a',
    checked: false,
    disabled: false,
    required: false,
    hint: '',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Group: Story = {
  render: () => storyHtml`
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      <bq-radio name="group" value="light" label="Light mode" checked></bq-radio>
      <bq-radio name="group" value="dark"  label="Dark mode"></bq-radio>
      <bq-radio name="group" value="system" label="Use system"></bq-radio>
    </div>
  `,
};
export const Required: Story = {
  args: { required: true, label: 'Accept terms' },
};
export const WithHint: Story = {
  args: { label: 'Premium', hint: 'Includes priority support' },
};
