import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Data Display/Formatting',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Numbers: Story = {
  args: { locale: 'en-US' },
  argTypes: { locale: { control: 'select', options: ['en-US', 'de-DE', 'fr-FR', 'ja-JP'] } },
  render: (args) => storyHtml`
    <ul style="font-family: system-ui; line-height: 2">
      <li><bq-format-number value="1234567.891" locale=${args.locale}></bq-format-number></li>
      <li><bq-format-number value="49.9" type="currency" currency="EUR" locale=${args.locale}></bq-format-number></li>
      <li><bq-format-number value="0.256" type="percent" maximum-fraction-digits="1" locale=${args.locale}></bq-format-number></li>
      <li><bq-format-number value="12300" notation="compact" locale=${args.locale}></bq-format-number></li>
      <li><bq-format-number value="3200000" type="bytes" locale=${args.locale}></bq-format-number></li>
      <li><bq-format-number value="80" type="unit" unit="kilometer-per-hour" locale=${args.locale}></bq-format-number></li>
    </ul>
  `,
};

export const Dates: Story = {
  args: { locale: 'en-US' },
  argTypes: { locale: { control: 'select', options: ['en-US', 'de-DE', 'fr-FR', 'ja-JP'] } },
  render: (args) => storyHtml`
    <ul style="font-family: system-ui; line-height: 2">
      <li><bq-format-date date="2024-03-01T15:30:00Z" locale=${args.locale}></bq-format-date></li>
      <li><bq-format-date date="2024-03-01T15:30:00Z" date-style="full" time-style="short" locale=${args.locale}></bq-format-date></li>
      <li><bq-format-date date="2024-03-01" month="long" year="numeric" locale=${args.locale}></bq-format-date></li>
    </ul>
  `,
};

export const RelativeTime: Story = {
  render: () => {
    const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
    return storyHtml`
      <ul style="font-family: system-ui; line-height: 2">
        <li>Live: <bq-relative-time date=${ago(5_000)} sync></bq-relative-time></li>
        <li><bq-relative-time date=${ago(45 * 60_000)}></bq-relative-time></li>
        <li><bq-relative-time date=${ago(26 * 3_600_000)}></bq-relative-time></li>
        <li><bq-relative-time date=${ago(-3 * 86_400_000)}></bq-relative-time></li>
        <li><bq-relative-time date=${ago(3 * 3_600_000)} locale="de" format="short"></bq-relative-time></li>
      </ul>
    `;
  },
};
