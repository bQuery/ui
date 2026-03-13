import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Feedback/Skeleton',
  tags: ['autodocs'],
  render: (args) => html`<bq-skeleton variant=${args.variant} width=${args.width} height=${args.height} lines=${args.lines}></bq-skeleton>`,
  argTypes: {
    variant: { control: 'select', options: ['text','circle','rect','card'] },
    width:   { control: 'text' },
    height:  { control: 'text' },
    lines:   { control: 'number' },
  },
  args: { variant: 'text', width: '100%', height: '1rem', lines: 1 },
};
export default meta;
type Story = StoryObj;

export const Text:     Story = {};
export const Circle:   Story = { args: { variant: 'circle', width: '3rem', height: '3rem' } };
export const MultiLine:Story = { args: { lines: 3 } };
export const CardSkeleton: Story = {
  render: () => html`
    <div style="max-width:24rem;display:flex;flex-direction:column;gap:0.75rem;padding:1rem">
      <div style="display:flex;gap:0.75rem;align-items:center">
        <bq-skeleton variant="circle" width="3rem" height="3rem"></bq-skeleton>
        <div style="flex:1;display:flex;flex-direction:column;gap:0.5rem">
          <bq-skeleton variant="text" width="60%"></bq-skeleton>
          <bq-skeleton variant="text" width="40%"></bq-skeleton>
        </div>
      </div>
      <bq-skeleton variant="rect" width="100%" height="10rem"></bq-skeleton>
      <bq-skeleton variant="text" lines="3"></bq-skeleton>
    </div>
  `,
};
