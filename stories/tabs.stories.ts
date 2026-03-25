import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

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
    variant: { control: 'select', options: ['default', 'pills', 'underline'] },
  },
  args: { variant: 'default' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Pills: Story = { args: { variant: 'pills' } };
export const Underline: Story = { args: { variant: 'underline' } };

export const DisabledTab: Story = {
  render: () => storyHtml`
    <bq-tabs active-tab="tab1" variant="default">
      <span id="tab1" data-tab-item label="Overview"></span>
      <span id="tab2" data-tab-item label="Features" disabled></span>
      <span id="tab3" data-tab-item label="Pricing"></span>
      <div data-tab="tab1"><p>Overview content</p></div>
      <div data-tab="tab2"><p>Features content (disabled)</p></div>
      <div data-tab="tab3"><p>Pricing content</p></div>
    </bq-tabs>
  `,
};

export const ManyTabs: Story = {
  render: () => storyHtml`
    <bq-tabs active-tab="t1" variant="default">
      <span id="t1" data-tab-item label="Tab 1"></span>
      <span id="t2" data-tab-item label="Tab 2"></span>
      <span id="t3" data-tab-item label="Tab 3"></span>
      <span id="t4" data-tab-item label="Tab 4"></span>
      <span id="t5" data-tab-item label="Tab 5"></span>
      <div data-tab="t1"><p>Content 1</p></div>
      <div data-tab="t2"><p>Content 2</p></div>
      <div data-tab="t3"><p>Content 3</p></div>
      <div data-tab="t4"><p>Content 4</p></div>
      <div data-tab="t5"><p>Content 5</p></div>
    </bq-tabs>
  `,
};
