import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

const meta: Meta = {
  title: 'Navigation/Tabs',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-tabs active-tab="tab1" variant=${args.variant}>
      <span id="tab1" data-tab-item label="Overview"></span>
      <span id="tab2" data-tab-item label="Features"></span>
      <span id="tab3" data-tab-item label="Pricing"></span>
      <div data-tab="tab1"><p>Overview content</p></div>
      <div data-tab="tab2"><p>Features content</p></div>
      <div data-tab="tab3"><p>Pricing content</p></div>
    </bq-tabs>
  `,
  argTypes: {
    variant: { control: 'select', options: ['default','pills','underline'] },
  },
  args: { variant: 'default' },
};
export default meta;
type Story = StoryObj;

export const Default:   Story = {};
export const Pills:     Story = { args: { variant: 'pills' } };
export const Underline: Story = { args: { variant: 'underline' } };
