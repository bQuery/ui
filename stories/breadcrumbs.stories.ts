import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Navigation/Breadcrumbs',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-breadcrumbs separator=${args.separator}>
      <a href="#">Home</a>
      <a href="#">Products</a>
      <a href="#">Category</a>
      <a href="#">Item</a>
    </bq-breadcrumbs>
  `,
  argTypes: {
    separator: { control: 'text' },
  },
  args: { separator: '/' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const CustomSeparator: Story = {
  args: { separator: '›' },
};

export const ChevronSeparator: Story = {
  args: { separator: '»' },
};

export const SingleItem: Story = {
  render: () => storyHtml`
    <bq-breadcrumbs>
      <a href="#">Home</a>
    </bq-breadcrumbs>
  `,
};

export const ManyItems: Story = {
  render: () => storyHtml`
    <bq-breadcrumbs>
      <a href="#">Home</a>
      <a href="#">Electronics</a>
      <a href="#">Computers</a>
      <a href="#">Laptops</a>
      <a href="#">Gaming</a>
      <a href="#">Under $1000</a>
    </bq-breadcrumbs>
  `,
};

export const WithCurrentPage: Story = {
  render: () => storyHtml`
    <bq-breadcrumbs separator="/">
      <a href="#">Home</a>
      <a href="#">Documentation</a>
      <span>Getting Started</span>
    </bq-breadcrumbs>
  `,
};
