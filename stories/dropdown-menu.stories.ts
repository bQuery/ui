import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

function renderDropdownLinkStory(): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = storyHtml`
    <div style="padding:3rem;display:flex;justify-content:center">
      <bq-dropdown-menu label="Navigation links" placement="bottom-start">
        <button slot="trigger" type="button">Navigate</button>
        <a href="#dashboard">Dashboard</a>
        <a href="#reports">Reports</a>
        <a href="#settings">Settings</a>
      </bq-dropdown-menu>
    </div>
  `;

  container.querySelectorAll('bq-dropdown-menu a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
    });
  });

  return container;
}

const meta: Meta = {
  title: 'Overlays/Dropdown Menu',
  tags: ['autodocs'],
  render: (args) => storyHtml`
    <div style="padding:3rem;display:flex;justify-content:center">
      <bq-dropdown-menu label=${args.label} placement=${args.placement} ?disabled=${args.disabled}>
        <button slot="trigger" type="button">${args.triggerLabel}</button>
        <button data-value="edit">Edit</button>
        <button data-value="duplicate">Duplicate</button>
        <hr />
        <button data-value="archive">Archive</button>
        <button data-value="delete">Delete</button>
      </bq-dropdown-menu>
    </div>
  `,
  argTypes: {
    label: { control: 'text', description: 'Accessible label for the menu' },
    triggerLabel: { control: 'text', description: 'Visible trigger text' },
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
      description: 'Preferred overlay placement',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the trigger and menu',
    },
  },
  args: {
    label: 'Row actions',
    triggerLabel: 'Actions',
    placement: 'bottom-start',
    disabled: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const TopEnd: Story = {
  args: {
    placement: 'top-end',
    triggerLabel: 'More actions',
  },
};

export const WithLinks: Story = {
  render: () => renderDropdownLinkStory(),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    triggerLabel: 'Unavailable',
  },
};

export const OpenByDefault: Story = {
  render: () => storyHtml`
    <div style="padding:3rem;display:flex;justify-content:center">
      <bq-dropdown-menu label="Quick actions" placement="bottom-end">
        <button slot="trigger" type="button">Quick actions</button>
        <button data-value="rename">Rename</button>
        <button data-value="share">Share</button>
        <button data-value="delete">Delete</button>
      </bq-dropdown-menu>
    </div>
  `,
};
