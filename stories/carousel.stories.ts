import { storyHtml, unsafeHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const slide = (n: number, hue: number) =>
  `<div style="display: grid; place-items: center; height: 12rem; border-radius: 0.5rem; font: 600 1.5rem system-ui; color: #fff; background: hsl(${hue} 70% 45%);">Slide ${n}</div>`;

const slides = [210, 160, 280, 20, 340].map((hue, i) => slide(i + 1, hue)).join('');

const meta: Meta = {
  title: 'Navigation/Carousel',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <bq-carousel
      label="Highlights"
      per-view=${args.perView}
      autoplay=${args.autoplay}
      ?loop=${args.loop}
      ?hide-controls=${args.hideControls}
      ?hide-indicators=${args.hideIndicators}
    >${unsafeHtml(slides)}</bq-carousel>
  `,
  argTypes: {
    perView: { control: { type: 'number', min: 1, max: 4 } },
    autoplay: { control: 'number' },
    loop: { control: 'boolean' },
    hideControls: { control: 'boolean' },
    hideIndicators: { control: 'boolean' },
  },
  args: {
    perView: 1,
    autoplay: 0,
    loop: false,
    hideControls: false,
    hideIndicators: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Looping: Story = { args: { loop: true } };
export const MultiplePerView: Story = { args: { perView: 3 } };
export const Autoplay: Story = { args: { autoplay: 4000, loop: true } };
