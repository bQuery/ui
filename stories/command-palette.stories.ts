import { storyHtml } from '@bquery/bquery/storybook';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Overlays/Command Palette',
  tags: ['autodocs'],
  render: (args) => {
    const container = document.createElement('div');
    container.innerHTML = storyHtml`
    <p>Press <bq-kbd keys="cmd+K"></bq-kbd> / <bq-kbd keys="ctrl+K"></bq-kbd> or use the button.</p>
    <bq-button>Open command palette</bq-button>
    <bq-command-palette
      ?open=${args.open}
      hotkey=${args.hotkey}
      placeholder=${args.placeholder}
      ?keep-open=${args.keepOpen}
    >
      <optgroup label="Navigation">
        <option value="dashboard" data-shortcut="G D">Go to dashboard</option>
        <option value="projects" data-shortcut="G P" data-keywords="repos work">Go to projects</option>
        <option value="settings" data-shortcut="G S" data-keywords="preferences options">Open settings</option>
      </optgroup>
      <optgroup label="Actions">
        <option value="new" data-keywords="create add" data-description="Start from a template">New project</option>
        <option value="invite" data-description="Send an email invitation">Invite teammate</option>
        <option value="theme" data-shortcut="⇧ T" data-keywords="dark light mode">Toggle theme</option>
        <option value="delete" disabled>Delete project</option>
      </optgroup>
      <optgroup label="Help">
        <option value="docs">Search documentation</option>
        <option value="shortcuts" data-shortcut="?">Keyboard shortcuts</option>
      </optgroup>
    </bq-command-palette>
  `;
    const palette = container.querySelector('bq-command-palette');
    container
      .querySelector('bq-button')
      ?.addEventListener('bq-click', () => palette?.setAttribute('open', ''));
    return container;
  },
  argTypes: {
    open: { control: 'boolean' },
    keepOpen: { control: 'boolean' },
  },
  args: {
    open: false,
    hotkey: 'mod+k',
    placeholder: '',
    keepOpen: false,
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Open: Story = { args: { open: true } };
export const KeepOpen: Story = { args: { open: true, keepOpen: true } };
