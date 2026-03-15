import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Navigation/Breadcrumbs',
  tags: ['autodocs'],
  render: () => storyHtml`
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
