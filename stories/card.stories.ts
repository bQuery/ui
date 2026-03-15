import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Layout/Card',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-card title=${args.title} ?elevated=${args.elevated} padding=${args.padding} style="max-width:24rem">
      ${args.content}
      <div slot="footer"><bq-button variant="primary" size="sm">Action</bq-button></div>
    </bq-card>
  `,
  argTypes: {
    title:    { control: 'text' },
    elevated: { control: 'boolean' },
    padding:  { control: 'select', options: ['none','sm','md','lg'] },
    content:  { control: 'text' },
  },
  args: { title: 'Card Title', elevated: true, padding: 'md', content: 'Card body content goes here. It can contain any HTML.' },
};
export default meta;
type Story = StoryObj;

export const Default:   Story = {};
export const NoShadow:  Story = { args: { elevated: false } };
export const NoHeader:  Story = { args: { title: '' } };
