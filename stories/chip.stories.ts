import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Components/Chip',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-chip variant=${args.variant} size=${args.size} ?removable=${args.removable} ?selected=${args.selected} ?disabled=${args.disabled}>${args.label}</bq-chip>`,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'danger', 'warning', 'info'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    removable: { control: 'boolean' },
    selected: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    removable: false,
    selected: false,
    disabled: false,
    label: 'React',
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Removable: Story = { args: { removable: true } };
export const Selected: Story = { args: { selected: true } };
export const Disabled: Story = { args: { disabled: true } };

export const AllSizes: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:0.5rem;align-items:center">
      <bq-chip variant="primary" size="sm">Small</bq-chip>
      <bq-chip variant="primary" size="md">Medium</bq-chip>
      <bq-chip variant="primary" size="lg">Large</bq-chip>
    </div>
  `,
};

export const AllVariants: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <bq-chip variant="primary">Primary</bq-chip>
      <bq-chip variant="secondary">Secondary</bq-chip>
      <bq-chip variant="success">Success</bq-chip>
      <bq-chip variant="danger">Danger</bq-chip>
      <bq-chip variant="warning">Warning</bq-chip>
      <bq-chip variant="info">Info</bq-chip>
    </div>
  `,
};

export const Tags: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
      <bq-chip variant="primary" removable>TypeScript</bq-chip>
      <bq-chip variant="secondary" removable>React</bq-chip>
      <bq-chip variant="success" removable>Node.js</bq-chip>
    </div>
  `,
};
