import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';
import { iconNames } from '../src/utils/icons.js';

/**
 * One glyph from the built-in set, drawn as a CSS mask so it inherits the
 * surrounding text colour and stays a single crisp path at any size.
 */
const meta: Meta = {
  title: 'Components/Icon',
  tags: ['autodocs'],
  render: (args) =>
    storyHtml`<bq-icon name=${args.name} size=${args.size} label=${args.label}></bq-icon>`,
  argTypes: {
    name: { control: 'select', options: [...iconNames] },
    size: { control: 'text' },
    label: { control: 'text' },
  },
  args: { name: 'check', size: '1.5rem', label: '' },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const InheritsTextColor: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:1.5rem;align-items:center;font-size:1.25rem">
      <span style="color:#2563eb"><bq-icon name="info"></bq-icon> Info</span>
      <span style="color:#16a34a"><bq-icon name="check-circle"></bq-icon> Done</span>
      <span style="color:#dc2626"><bq-icon name="alert-triangle"></bq-icon> Failed</span>
    </div>
  `,
};

export const ScalesWithFontSize: Story = {
  render: () => storyHtml`
    <div style="display:flex;gap:1rem;align-items:center">
      <span style="font-size:0.875rem"><bq-icon name="star"></bq-icon></span>
      <span style="font-size:1.25rem"><bq-icon name="star"></bq-icon></span>
      <span style="font-size:2rem"><bq-icon name="star"></bq-icon></span>
      <span style="font-size:3rem"><bq-icon name="star"></bq-icon></span>
    </div>
  `,
};

export const Catalog: Story = {
  render: () => storyHtml`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(7rem,1fr));gap:0.75rem">
      ${iconNames
        .map(
          (name) => `
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.375rem;padding:0.75rem;border:1px solid #e2e8f0;border-radius:0.5rem">
          <bq-icon name="${name}" size="1.5rem"></bq-icon>
          <code style="font-size:0.6875rem;color:#475569">${name}</code>
        </div>`
        )
        .join('')}
    </div>
  `,
};
