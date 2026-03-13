import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

/**
 * The bq-button component is the primary interactive control.
 * Supports multiple variants, sizes, loading and disabled states, and link rendering.
 */
const meta: Meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: (args) => html`
    <bq-button
      variant=${args.variant}
      size=${args.size}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      type=${args.type}
    >${args.label}</bq-button>
  `,
  argTypes: {
    variant: { control: 'select', options: ['primary','secondary','outline','ghost','danger'], description: 'Visual style variant' },
    size:    { control: 'select', options: ['sm','md','lg','xl'], description: 'Button size' },
    disabled:{ control: 'boolean', description: 'Disables the button' },
    loading: { control: 'boolean', description: 'Shows loading spinner' },
    type:    { control: 'select', options: ['button','submit','reset'], description: 'HTML button type' },
    label:   { control: 'text', description: 'Button label' },
  },
  args: { variant: 'primary', size: 'md', disabled: false, loading: false, type: 'button', label: 'Click me' },
};
export default meta;
type Story = StoryObj;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', label: 'Secondary' } };
export const Outline: Story = { args: { variant: 'outline', label: 'Outline' } };
export const Ghost: Story = { args: { variant: 'ghost', label: 'Ghost' } };
export const Danger: Story = { args: { variant: 'danger', label: 'Delete' } };
export const Small: Story = { args: { size: 'sm', label: 'Small' } };
export const Large: Story = { args: { size: 'lg', label: 'Large' } };
export const Loading: Story = { args: { loading: true, label: 'Loading…' } };
export const Disabled: Story = { args: { disabled: true, label: 'Disabled' } };
export const AsLink: Story = {
  render: () => html`<bq-button href="https://example.com" target="_blank">Open link</bq-button>`,
};
export const AllVariants: Story = {
  render: () => html`
    <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center">
      <bq-button variant="primary">Primary</bq-button>
      <bq-button variant="secondary">Secondary</bq-button>
      <bq-button variant="outline">Outline</bq-button>
      <bq-button variant="ghost">Ghost</bq-button>
      <bq-button variant="danger">Danger</bq-button>
    </div>
  `,
};
