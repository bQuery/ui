import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Layout/Divider',
  tags: ['autodocs'],
  render: (args) => html`<bq-divider orientation=${args.orientation} variant=${args.variant} label=${args.label}></bq-divider>`,
  argTypes: {
    orientation: { control: 'select', options: ['horizontal','vertical'] },
    variant:     { control: 'select', options: ['solid','dashed','dotted'] },
    label:       { control: 'text' },
  },
  args: { orientation: 'horizontal', variant: 'solid', label: '' },
};
export default meta;
type Story = StoryObj;

export const Default:     Story = {};
export const WithLabel:   Story = { args: { label: 'OR' } };
export const Dashed:      Story = { args: { variant: 'dashed' } };
