import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * Progress indicator for multi-step flows. Steps are declared as light-DOM
 * children carrying `data-step`.
 */
const meta: Meta = {
  title: 'Components/Stepper',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-stepper current=${args.current} orientation=${args.orientation} ?clickable=${args.clickable}>
      <div data-step label="Account" description="Your details"></div>
      <div data-step label="Shipping" description="Where it goes"></div>
      <div data-step label="Payment" description="How you pay"></div>
    </bq-stepper>
  `,
  argTypes: {
    current:     { control: { type: 'number', min: 0, max: 2 } },
    orientation: { control: 'select', options: ['horizontal','vertical'] },
    clickable:   { control: 'boolean' },
  },
  args: { current: 1, orientation: 'horizontal', clickable: false },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Vertical: Story = { args: { orientation: 'vertical' } };
export const Clickable: Story = { args: { clickable: true, current: 2 } };
export const FirstStep: Story = { args: { current: 0 } };
export const WithoutDescriptions: Story = {
  render: () => storyHtml`
    <bq-stepper current="1">
      <div data-step label="Cart"></div>
      <div data-step label="Checkout"></div>
      <div data-step label="Done"></div>
    </bq-stepper>
  `,
};
