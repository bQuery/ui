import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/Avatar',
  tags: ['autodocs'],
  render: (args) => html`<bq-avatar src=${args.src} alt=${args.alt} size=${args.size} shape=${args.shape} status=${args.status}></bq-avatar>`,
  argTypes: {
    src:    { control: 'text' },
    alt:    { control: 'text' },
    size:   { control: 'select', options: ['xs','sm','md','lg','xl'] },
    shape:  { control: 'select', options: ['circle','square'] },
    status: { control: 'select', options: ['','online','away','busy','offline'] },
  },
  args: { src: '', alt: 'Jane Doe', size: 'md', shape: 'circle', status: '' },
};
export default meta;
type Story = StoryObj;

export const Initials: Story = {};
export const WithImage: Story = { args: { src: 'https://i.pravatar.cc/80?img=1', alt: 'User avatar' } };
export const Online: Story = { args: { status: 'online' } };
export const AllSizes: Story = {
  render: () => html`
    <div style="display:flex;gap:1rem;align-items:center">
      <bq-avatar alt="XS" size="xs"></bq-avatar>
      <bq-avatar alt="SM" size="sm"></bq-avatar>
      <bq-avatar alt="MD" size="md"></bq-avatar>
      <bq-avatar alt="LG" size="lg"></bq-avatar>
      <bq-avatar alt="XL" size="xl"></bq-avatar>
    </div>
  `,
};
