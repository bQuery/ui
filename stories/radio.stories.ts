import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Forms/Radio',
  tags: ['autodocs'],
  render: (args) => html`<bq-radio label=${args.label} name="demo" value=${args.value} ?checked=${args.checked} ?disabled=${args.disabled}></bq-radio>`,
  argTypes: {
    label:    { control: 'text' },
    value:    { control: 'text' },
    checked:  { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Option A', value: 'a', checked: false, disabled: false },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Group: Story = {
  render: () => html`
    <div style="display:flex;flex-direction:column;gap:0.75rem">
      <bq-radio name="group" value="light" label="Light mode" checked></bq-radio>
      <bq-radio name="group" value="dark"  label="Dark mode"></bq-radio>
      <bq-radio name="group" value="system" label="Use system"></bq-radio>
    </div>
  `,
};
