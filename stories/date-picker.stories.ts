import type { Meta, StoryObj } from '@storybook/web-components';
import { storyHtml } from '@bquery/bquery/storybook';

/**
 * A text field with a calendar popup. Values are ISO `YYYY-MM-DD` on the
 * attribute; what the user sees is formatted for the requested locale, as are
 * the month names, weekday headers and the first day of the week.
 */
const meta: Meta = {
  title: 'Components/Date Picker',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <div style="min-height:26rem">
      <bq-date-picker
        label=${args.label}
        value=${args.value}
        min=${args.min}
        max=${args.max}
        locale=${args.locale}
        hint=${args.hint}
        error=${args.error}
        size=${args.size}
        first-day-of-week=${args.firstDayOfWeek}
        ?clearable=${args.clearable}
        ?disabled=${args.disabled}
      ></bq-date-picker>
    </div>
  `,
  argTypes: {
    locale: { control: 'select', options: ['en-US', 'en-GB', 'de-DE', 'fr-FR', 'ja-JP'] },
    firstDayOfWeek: { control: { type: 'number', min: 0, max: 6 } },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    clearable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Due date',
    value: '2026-03-15',
    min: '',
    max: '',
    locale: 'en-US',
    hint: '',
    error: '',
    size: 'md',
    firstDayOfWeek: 1,
    clearable: true,
    disabled: false,
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const German: Story = { args: { locale: 'de-DE', label: 'Fälligkeitsdatum' } };
export const SundayFirst: Story = { args: { locale: 'en-US', firstDayOfWeek: 0 } };
export const RestrictedRange: Story = {
  args: { min: '2026-03-10', max: '2026-03-24', hint: 'Only the third week of March is open.' },
};
export const WithError: Story = { args: { error: 'Pick a date in the future.' } };
