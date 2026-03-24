// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { waitForFrame } from './helpers';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('overlay and utility component fixes', () => {
  beforeAll(async () => {
    await import('../src/components/dialog/index.js');
    await import('../src/components/drawer/index.js');
    await import('../src/components/breadcrumbs/index.js');
    await import('../src/components/skeleton/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('assigns unique title ids to dialog instances', () => {
    const first = doc.createElement('bq-dialog');
    const second = doc.createElement('bq-dialog');
    first.setAttribute('open', '');
    second.setAttribute('open', '');
    doc.body.append(first, second);

    const firstDialog = first.shadowRoot?.querySelector('.dialog');
    const secondDialog = second.shadowRoot?.querySelector('.dialog');
    const firstTitle = first.shadowRoot?.querySelector('.header-title');
    const secondTitle = second.shadowRoot?.querySelector('.header-title');

    expect(firstDialog?.getAttribute('aria-labelledby')).toBe(firstTitle?.id);
    expect(secondDialog?.getAttribute('aria-labelledby')).toBe(secondTitle?.id);
    expect(firstTitle?.id).not.toBe(secondTitle?.id);
  });

  it('assigns unique title ids to drawer instances', () => {
    const first = doc.createElement('bq-drawer');
    const second = doc.createElement('bq-drawer');
    doc.body.append(first, second);

    const firstDrawer = first.shadowRoot?.querySelector('.drawer');
    const secondDrawer = second.shadowRoot?.querySelector('.drawer');
    const firstTitle = first.shadowRoot?.querySelector('.title');
    const secondTitle = second.shadowRoot?.querySelector('.title');

    expect(firstDrawer?.getAttribute('aria-labelledby')).toBe(firstTitle?.id);
    expect(secondDrawer?.getAttribute('aria-labelledby')).toBe(secondTitle?.id);
    expect(firstTitle?.id).not.toBe(secondTitle?.id);
  });

  it('moves focus into the dialog on open and restores it on close', async () => {
    const trigger = doc.createElement('button');
    trigger.textContent = 'Open dialog';
    doc.body.appendChild(trigger);
    trigger.focus();

    const dialog = doc.createElement('bq-dialog');
    dialog.setAttribute('title', 'Example');
    doc.body.appendChild(dialog);

    dialog.setAttribute('open', '');
    await waitForFrame(2);

    const closeButton = dialog.shadowRoot?.querySelector(
      '.close-btn'
    ) as HTMLButtonElement | null;
    const activeWithinDialog = dialog.shadowRoot
      ?.activeElement as Element | null;

    expect(closeButton).toBeTruthy();
    expect(activeWithinDialog).toBe(closeButton);

    dialog.removeAttribute('open');
    await waitForFrame(1);

    expect(doc.activeElement).toBe(trigger);
  });

  it('focuses the dialog container when no focusable descendants are available', async () => {
    const trigger = doc.createElement('button');
    trigger.textContent = 'Open dialog';
    doc.body.appendChild(trigger);
    trigger.focus();

    const dialog = doc.createElement('bq-dialog');
    dialog.setAttribute('title', 'Example');
    dialog.setAttribute('dismissible', 'false');
    dialog.innerHTML = '<p>Static content only.</p>';
    doc.body.appendChild(dialog);

    dialog.setAttribute('open', '');
    await waitForFrame(2);

    const dialogSurface = dialog.shadowRoot?.querySelector(
      '.dialog'
    ) as HTMLElement | null;
    const activeWithinDialog = dialog.shadowRoot
      ?.activeElement as Element | null;

    expect(dialogSurface).toBeTruthy();
    expect(activeWithinDialog).toBe(dialogSurface);
  });

  it('does not move focus into a dialog that closes before the scheduled focus runs', async () => {
    const trigger = doc.createElement('button');
    trigger.textContent = 'Open dialog';
    doc.body.appendChild(trigger);
    trigger.focus();

    const dialog = doc.createElement('bq-dialog');
    dialog.setAttribute('title', 'Example');
    doc.body.appendChild(dialog);

    dialog.setAttribute('open', '');
    dialog.removeAttribute('open');
    await waitForFrame(2);

    expect(doc.activeElement).toBe(trigger);
  });

  it('restores focus when an open dialog is disconnected', async () => {
    const trigger = doc.createElement('button');
    trigger.textContent = 'Open dialog';
    doc.body.appendChild(trigger);
    trigger.focus();

    const dialog = doc.createElement('bq-dialog');
    dialog.setAttribute('title', 'Example');
    doc.body.appendChild(dialog);

    dialog.setAttribute('open', '');
    await waitForFrame(2);
    dialog.remove();

    expect(doc.activeElement).toBe(trigger);
  });

  it('does not steal focus back on unrelated dialog updates while open', async () => {
    const dialog = doc.createElement('bq-dialog');
    dialog.setAttribute('title', 'Example');
    dialog.innerHTML = '<button id="inside-dialog">Inside dialog</button>';
    doc.body.appendChild(dialog);

    dialog.setAttribute('open', '');
    await waitForFrame(2);

    const insideButton = dialog.querySelector(
      '#inside-dialog'
    ) as HTMLButtonElement | null;
    expect(insideButton).toBeTruthy();

    insideButton?.focus();
    expect(doc.activeElement).toBe(insideButton);

    dialog.setAttribute('title', 'Updated title');
    await waitForFrame(2);

    expect(doc.activeElement).toBe(insideButton);
  });

  it('moves focus into the drawer on open and restores it on close', async () => {
    const trigger = doc.createElement('button');
    trigger.textContent = 'Open drawer';
    doc.body.appendChild(trigger);
    trigger.focus();

    const drawer = doc.createElement('bq-drawer');
    drawer.setAttribute('title', 'Example');
    doc.body.appendChild(drawer);

    drawer.setAttribute('open', '');
    await waitForFrame(2);

    const closeButton = drawer.shadowRoot?.querySelector(
      '.close-btn'
    ) as HTMLButtonElement | null;
    const activeWithinDrawer = drawer.shadowRoot
      ?.activeElement as Element | null;

    expect(closeButton).toBeTruthy();
    expect(activeWithinDrawer).toBe(closeButton);

    drawer.removeAttribute('open');
    await waitForFrame(1);

    expect(doc.activeElement).toBe(trigger);
  });

  it('focuses the drawer container when no focusable descendants are available', async () => {
    const trigger = doc.createElement('button');
    trigger.textContent = 'Open drawer';
    doc.body.appendChild(trigger);
    trigger.focus();

    const drawer = doc.createElement('bq-drawer');
    drawer.setAttribute('title', 'Example');
    drawer.innerHTML = '<p>Static content only.</p>';
    doc.body.appendChild(drawer);

    drawer.setAttribute('open', '');
    const closeButton = drawer.shadowRoot?.querySelector('.close-btn');
    closeButton?.remove();
    await waitForFrame(2);

    const drawerSurface = drawer.shadowRoot?.querySelector(
      '.drawer'
    ) as HTMLElement | null;
    const activeWithinDrawer = drawer.shadowRoot
      ?.activeElement as Element | null;

    expect(drawerSurface).toBeTruthy();
    expect(drawerSurface?.getAttribute('tabindex')).toBe('-1');
    expect(activeWithinDrawer).toBe(drawerSurface);
  });

  it('does not move focus into a drawer that closes before the scheduled focus runs', async () => {
    const trigger = doc.createElement('button');
    trigger.textContent = 'Open drawer';
    doc.body.appendChild(trigger);
    trigger.focus();

    const drawer = doc.createElement('bq-drawer');
    drawer.setAttribute('title', 'Example');
    doc.body.appendChild(drawer);

    drawer.setAttribute('open', '');
    drawer.removeAttribute('open');
    await waitForFrame(2);

    expect(doc.activeElement).toBe(trigger);
  });

  it('restores focus when an open drawer is disconnected', async () => {
    const trigger = doc.createElement('button');
    trigger.textContent = 'Open drawer';
    doc.body.appendChild(trigger);
    trigger.focus();

    const drawer = doc.createElement('bq-drawer');
    drawer.setAttribute('title', 'Example');
    doc.body.appendChild(drawer);

    drawer.setAttribute('open', '');
    await waitForFrame(2);
    drawer.remove();

    expect(doc.activeElement).toBe(trigger);
  });

  it('does not steal focus back on unrelated drawer updates while open', async () => {
    const drawer = doc.createElement('bq-drawer');
    drawer.setAttribute('title', 'Example');
    drawer.innerHTML = '<button id="inside-drawer">Inside drawer</button>';
    doc.body.appendChild(drawer);

    drawer.setAttribute('open', '');
    await waitForFrame(2);

    const insideButton = drawer.querySelector(
      '#inside-drawer'
    ) as HTMLButtonElement | null;
    expect(insideButton).toBeTruthy();

    insideButton?.focus();
    expect(doc.activeElement).toBe(insideButton);

    drawer.setAttribute('title', 'Updated title');
    await waitForFrame(2);

    expect(doc.activeElement).toBe(insideButton);
  });

  it('renders breadcrumb separators from the separator prop', async () => {
    const el = doc.createElement('bq-breadcrumbs');
    el.setAttribute('separator', '>');
    el.innerHTML =
      '<a href="/">Home</a><a href="/docs">Docs</a><a href="/api">API</a>';
    doc.body.appendChild(el);
    await Promise.resolve();

    const separators = Array.from(
      el.querySelectorAll('[data-bq-breadcrumb-separator]')
    );

    expect(separators).toHaveLength(2);
    expect(separators.map((item) => item.textContent)).toEqual(['>', '>']);
    expect(
      el.querySelector('a:last-of-type')?.getAttribute('aria-current')
    ).toBe('page');
  });

  it('applies width and height styles to single skeleton variants', () => {
    const el = doc.createElement('bq-skeleton');
    el.setAttribute('variant', 'rect');
    el.setAttribute('width', '240px');
    el.setAttribute('height', '120px');
    doc.body.appendChild(el);

    const skeleton = el.shadowRoot?.querySelector('.skeleton');
    expect(skeleton?.getAttribute('style')).toContain('width:240px');
    expect(skeleton?.getAttribute('style')).toContain('height:120px');
  });

  it('applies height styles to multiline skeleton lines', () => {
    const el = doc.createElement('bq-skeleton');
    el.setAttribute('variant', 'text');
    el.setAttribute('lines', '2');
    el.setAttribute('width', '320px');
    el.setAttribute('height', '18px');
    doc.body.appendChild(el);

    const lines = Array.from(
      el.shadowRoot?.querySelectorAll('.skeleton') ?? []
    );
    expect(lines).toHaveLength(2);
    expect(lines[0]?.getAttribute('style')).toContain('width:320px');
    expect(lines[0]?.getAttribute('style')).toContain('height:18px');
    expect(lines[1]?.getAttribute('style')).toContain('width:70%');
  });

  it('ignores unsafe skeleton dimension values instead of emitting extra CSS declarations', () => {
    const el = doc.createElement('bq-skeleton');
    el.setAttribute('variant', 'rect');
    el.setAttribute('width', '240px;background:red');
    el.setAttribute('height', '120px;position:absolute');
    doc.body.appendChild(el);

    const skeleton = el.shadowRoot?.querySelector('.skeleton');
    expect(skeleton?.getAttribute('style')).toBe('');
  });
});
