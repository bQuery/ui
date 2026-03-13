import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Navigation/Breadcrumbs',
  tags: ['autodocs'],
  render: () => html`
    <bq-breadcrumbs>
      <a href="#">Home</a>
      <a href="#">Products</a>
      <a href="#">Category</a>
      <a href="#">Item</a>
    </bq-breadcrumbs>
  `,
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
