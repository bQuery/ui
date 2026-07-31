import { beforeAll, describe, expect, it } from 'bun:test';
import { parseKeys } from '../src/components/kbd/BqKbd.js';
import { clampRating } from '../src/components/rating/BqRating.js';
import {
  normalizeNumber,
  precisionFor,
} from '../src/components/number-input/BqNumberInput.js';
import {
  formatBytes,
  matchesAccept,
} from '../src/components/file-upload/BqFileUpload.js';
import { readSteps, stepStatus } from '../src/components/stepper/BqStepper.js';
import { waitForFrame } from './helpers.js';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

function mount(tag: string, attrs: Record<string, string> = {}): HTMLElement {
  const el = doc.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  doc.body.appendChild(el);
  return el;
}

describe('BqKbd', () => {
  beforeAll(async () => {
    await import('../src/components/kbd/index.js');
  });

  it('splits a combination into one key element per key', () => {
    const el = mount('bq-kbd', { keys: 'Ctrl+Shift+K' });
    const keys = Array.from(el.shadowRoot?.querySelectorAll('.key') ?? []);
    expect(keys.map((k) => k.textContent)).toEqual(['Ctrl', '⇧', 'K']);
  });

  it('falls back to slotted content without `keys`', () => {
    const el = mount('bq-kbd');
    expect(el.shadowRoot?.querySelector('.key slot')).not.toBeNull();
  });

  it('maps known key names to symbols and passes others through', () => {
    expect(parseKeys('cmd+enter')).toEqual(['⌘', '↵']);
    expect(parseKeys('Ctrl + F5')).toEqual(['Ctrl', 'F5']);
    expect(parseKeys('')).toEqual([]);
    expect(parseKeys('a++b')).toEqual(['a', 'b']);
  });
});

describe('BqBanner', () => {
  beforeAll(async () => {
    await import('../src/components/banner/index.js');
  });

  it('uses an assertive alert only for the danger variant', () => {
    const danger = mount('bq-banner', { variant: 'danger' });
    expect(danger.shadowRoot?.querySelector('.banner')?.getAttribute('role')).toBe('alert');
    const info = mount('bq-banner', { variant: 'info' });
    expect(info.shadowRoot?.querySelector('.banner')?.getAttribute('role')).toBe('status');
  });

  it('hides itself and emits bq-dismiss when dismissed', () => {
    const el = mount('bq-banner', { dismissible: '' });
    let detailSeen = false;
    el.addEventListener('bq-dismiss', () => {
      detailSeen = true;
    });
    (el.shadowRoot?.querySelector('.dismiss') as HTMLElement).click();
    expect(detailSeen).toBe(true);
    expect(el.hasAttribute('hidden')).toBe(true);
  });

  it('stays mounted when bq-dismiss is cancelled', () => {
    const el = mount('bq-banner', { dismissible: '' });
    el.addEventListener('bq-dismiss', (e) => e.preventDefault());
    (el.shadowRoot?.querySelector('.dismiss') as HTMLElement).click();
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('omits the dismiss button unless dismissible', () => {
    const el = mount('bq-banner');
    expect(el.shadowRoot?.querySelector('.dismiss')).toBeNull();
  });
});

describe('BqAvatarGroup', () => {
  beforeAll(async () => {
    await import('../src/components/avatar-group/index.js');
    await import('../src/components/avatar/index.js');
  });

  it('collapses avatars past `max` into a counter', async () => {
    const el = mount('bq-avatar-group', { max: '2' });
    el.innerHTML = '<bq-avatar></bq-avatar>'.repeat(5);
    await waitForFrame(2);

    const overflow = el.shadowRoot?.querySelector('.overflow');
    expect(overflow?.textContent).toBe('+3');
    expect(overflow?.hasAttribute('hidden')).toBe(false);
    expect(el.children[2]?.hasAttribute('data-bq-overflow-hidden')).toBe(true);
    expect(el.children[1]?.hasAttribute('data-bq-overflow-hidden')).toBe(false);
  });

  it('shows every avatar when max is 0', async () => {
    const el = mount('bq-avatar-group');
    el.innerHTML = '<bq-avatar></bq-avatar>'.repeat(3);
    await waitForFrame(2);
    expect(el.shadowRoot?.querySelector('.overflow')?.hasAttribute('hidden')).toBe(true);
  });

  it('emits bq-overflow-click with the hidden count', async () => {
    const el = mount('bq-avatar-group', { max: '1' });
    el.innerHTML = '<bq-avatar></bq-avatar>'.repeat(4);
    await waitForFrame(2);

    let hidden = -1;
    el.addEventListener('bq-overflow-click', (e) => {
      hidden = (e as CustomEvent<{ hidden: number }>).detail.hidden;
    });
    (el.shadowRoot?.querySelector('.overflow') as HTMLElement).click();
    expect(hidden).toBe(3);
  });
});

describe('BqButtonGroup', () => {
  beforeAll(async () => {
    await import('../src/components/button-group/index.js');
  });

  it('exposes a labelled group role', () => {
    const el = mount('bq-button-group', { label: 'Actions' });
    const group = el.shadowRoot?.querySelector('.group');
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.getAttribute('aria-label')).toBe('Actions');
  });

  it('forwards its size to children that have none of their own', async () => {
    const el = mount('bq-button-group', { size: 'lg' });
    el.innerHTML = '<button></button><button size="sm"></button>';
    await waitForFrame(2);
    expect(el.children[0]?.getAttribute('size')).toBe('lg');
    // An explicit child size wins over the group default.
    expect(el.children[1]?.getAttribute('size')).toBe('sm');
  });
});

describe('BqStepper', () => {
  beforeAll(async () => {
    await import('../src/components/stepper/index.js');
  });

  it('classifies steps relative to the current index', () => {
    expect(stepStatus(0, 1)).toBe('complete');
    expect(stepStatus(1, 1)).toBe('current');
    expect(stepStatus(2, 1)).toBe('upcoming');
  });

  it('reads declarative [data-step] children', () => {
    const holder = doc.createElement('div');
    holder.innerHTML =
      '<div data-step label="A" description="first"></div><div data-step label="B" disabled></div>';
    expect(readSteps(holder)).toEqual([
      { label: 'A', description: 'first', disabled: false },
      { label: 'B', description: '', disabled: true },
    ]);
  });

  it('marks the active step and renders a check for completed ones', () => {
    // Steps are read in connected(), so the markup has to exist before mount.
    const el = doc.createElement('bq-stepper');
    el.setAttribute('current', '1');
    el.innerHTML =
      '<div data-step label="One"></div><div data-step label="Two"></div><div data-step label="Three"></div>';
    doc.body.appendChild(el);

    const steps = Array.from(el.shadowRoot?.querySelectorAll('.step') ?? []);
    expect(steps).toHaveLength(3);
    expect(steps[0]?.getAttribute('data-status')).toBe('complete');
    expect(steps[0]?.querySelector('.marker')?.textContent).toBe('✓');
    expect(steps[1]?.getAttribute('data-status')).toBe('current');
    expect(steps[1]?.getAttribute('aria-current')).toBe('step');
    expect(steps[2]?.getAttribute('data-status')).toBe('upcoming');
  });

  it('emits bq-step-change only when clickable', () => {
    const el = doc.createElement('bq-stepper');
    el.setAttribute('current', '2');
    el.setAttribute('clickable', '');
    el.innerHTML = '<div data-step label="One"></div><div data-step label="Two"></div>';
    doc.body.appendChild(el);

    let index = -1;
    el.addEventListener('bq-step-change', (e) => {
      index = (e as CustomEvent<{ index: number }>).detail.index;
    });
    (el.shadowRoot?.querySelector('button.step[data-index="0"]') as HTMLElement)?.click();
    expect(index).toBe(0);
    expect(el.getAttribute('current')).toBe('0');
  });

  it('renders non-interactive steps when not clickable', () => {
    const el = doc.createElement('bq-stepper');
    el.innerHTML = '<div data-step label="One"></div>';
    doc.body.appendChild(el);
    expect(el.shadowRoot?.querySelector('.step')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('button.step')).toBeNull();
  });
});

describe('BqTimeline', () => {
  beforeAll(async () => {
    await import('../src/components/timeline/index.js');
  });

  it('renders an ordered list with an accessible name', () => {
    const el = mount('bq-timeline');
    const list = el.shadowRoot?.querySelector('ol');
    expect(list).not.toBeNull();
    expect(list?.getAttribute('aria-label')).toBe('Timeline');
  });

  it('renders a machine-readable time when datetime is set', () => {
    const el = mount('bq-timeline-item', {
      headline: 'Shipped',
      timestamp: 'Mar 3',
      datetime: '2026-03-03',
    });
    const time = el.shadowRoot?.querySelector('time');
    expect(time?.getAttribute('datetime')).toBe('2026-03-03');
    expect(time?.textContent).toBe('Mar 3');
    expect(el.shadowRoot?.querySelector('.headline')?.textContent).toBe('Shipped');
  });

  it('omits the time element when no timestamp is given', () => {
    const el = mount('bq-timeline-item', { headline: 'Only headline' });
    expect(el.shadowRoot?.querySelector('time')).toBeNull();
  });
});

describe('BqRating', () => {
  beforeAll(async () => {
    await import('../src/components/rating/index.js');
  });

  it('clamps values into range', () => {
    expect(clampRating(7, 5)).toBe(5);
    expect(clampRating(-2, 5)).toBe(0);
    expect(clampRating(Number.NaN, 5)).toBe(0);
    expect(clampRating(3, 5)).toBe(3);
  });

  it('fills stars up to the current value', () => {
    const el = mount('bq-rating', { value: '3', max: '5' });
    const stars = Array.from(el.shadowRoot?.querySelectorAll('.star') ?? []);
    expect(stars).toHaveLength(5);
    expect(stars.filter((s) => s.getAttribute('data-filled') === 'true')).toHaveLength(3);
    expect(el.shadowRoot?.querySelector('.rating')?.getAttribute('role')).toBe('radiogroup');
  });

  it('commits a new value on click', () => {
    const el = mount('bq-rating', { value: '1', max: '5' });
    let value = -1;
    el.addEventListener('bq-change', (e) => {
      value = (e as CustomEvent<{ value: number }>).detail.value;
    });
    (el.shadowRoot?.querySelector('.star[data-value="4"]') as HTMLElement).click();
    expect(value).toBe(4);
    expect(el.getAttribute('value')).toBe('4');
  });

  it('ignores clicks when readonly or disabled', () => {
    for (const attr of ['readonly', 'disabled']) {
      const el = mount('bq-rating', { value: '2', max: '5', [attr]: '' });
      (el.shadowRoot?.querySelector('.star[data-value="5"]') as HTMLElement).click();
      expect(el.getAttribute('value')).toBe('2');
    }
  });

  it('clears back to zero when clearable and re-selected', () => {
    const el = mount('bq-rating', { value: '3', max: '5', clearable: '' });
    (el.shadowRoot?.querySelector('.star[data-value="3"]') as HTMLElement).click();
    expect(el.getAttribute('value')).toBe('0');
  });

  it('registers a hidden input for form participation', () => {
    const form = doc.createElement('form');
    doc.body.appendChild(form);
    const el = doc.createElement('bq-rating');
    el.setAttribute('name', 'score');
    el.setAttribute('value', '4');
    form.appendChild(el);

    const proxy = form.querySelector('input[data-bq-form-proxy]') as HTMLInputElement | null;
    expect(proxy?.name).toBe('score');
    expect(proxy?.value).toBe('4');
  });
});

describe('BqNumberInput', () => {
  beforeAll(async () => {
    await import('../src/components/number-input/index.js');
  });

  it('derives display precision from step', () => {
    expect(precisionFor(1, -1)).toBe(0);
    expect(precisionFor(0.25, -1)).toBe(2);
    expect(precisionFor(0.1, 3)).toBe(3);
  });

  it('clamps and snaps to the step grid', () => {
    expect(normalizeNumber(7, 0, 5, 1, 0)).toBe(5);
    expect(normalizeNumber(-3, 0, 5, 1, 0)).toBe(0);
    expect(normalizeNumber(2.4, 0, 10, 0.5, 1)).toBe(2.5);
    expect(normalizeNumber(Number.NaN, 2, 10, 1, 0)).toBe(2);
  });

  it('avoids float drift when stepping by tenths', () => {
    expect(normalizeNumber(0.1 + 0.2, 0, 1, 0.1, 1)).toBe(0.3);
  });

  it('increments and decrements through the stepper buttons', () => {
    const el = mount('bq-number-input', { value: '5', min: '0', max: '10', step: '1' });
    let value = -1;
    el.addEventListener('bq-change', (e) => {
      value = (e as CustomEvent<{ value: number }>).detail.value;
    });

    (el.shadowRoot?.querySelector('[data-action="increment"]') as HTMLElement).click();
    expect(value).toBe(6);
    expect(el.getAttribute('value')).toBe('6');

    (el.shadowRoot?.querySelector('[data-action="decrement"]') as HTMLElement).click();
    expect(value).toBe(5);
  });

  it('disables the stepper button at each bound', () => {
    const atMax = mount('bq-number-input', { value: '10', min: '0', max: '10' });
    expect(
      (atMax.shadowRoot?.querySelector('[data-action="increment"]') as HTMLButtonElement).disabled
    ).toBe(true);

    const atMin = mount('bq-number-input', { value: '0', min: '0', max: '10' });
    expect(
      (atMin.shadowRoot?.querySelector('[data-action="decrement"]') as HTMLButtonElement).disabled
    ).toBe(true);
  });

  it('links hint and error text to the field', () => {
    const el = mount('bq-number-input', { hint: 'Between 1 and 9', label: 'Qty' });
    const input = el.shadowRoot?.querySelector('input');
    const hint = el.shadowRoot?.querySelector('.hint');
    expect(input?.getAttribute('aria-describedby')).toBe(hint?.id);

    const invalid = mount('bq-number-input', { error: 'Too large' });
    const field = invalid.shadowRoot?.querySelector('input');
    expect(field?.getAttribute('aria-invalid')).toBe('true');
    expect(invalid.shadowRoot?.querySelector('.error')?.getAttribute('role')).toBe('alert');
  });
});

describe('BqFileUpload', () => {
  beforeAll(async () => {
    await import('../src/components/file-upload/index.js');
  });

  it('formats byte sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('matches extensions, wildcards and exact MIME types', () => {
    const png = { name: 'a.PNG', type: 'image/png', size: 1 } as File;
    expect(matchesAccept(png, '')).toBe(true);
    expect(matchesAccept(png, '.png')).toBe(true);
    expect(matchesAccept(png, 'image/*')).toBe(true);
    expect(matchesAccept(png, 'image/png')).toBe(true);
    expect(matchesAccept(png, '.pdf,text/plain')).toBe(false);
  });

  it('renders an accessible drop zone', () => {
    const el = mount('bq-file-upload', { label: 'Attachments' });
    expect(el.shadowRoot?.querySelector('.zone')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('input[type="file"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.label')?.textContent).toBe('Attachments');
  });

  it('forwards accept and multiple to the native input', () => {
    const el = mount('bq-file-upload', { accept: '.png,.jpg', multiple: '' });
    const input = el.shadowRoot?.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.getAttribute('accept')).toBe('.png,.jpg');
    expect(input.hasAttribute('multiple')).toBe(true);
  });

  it('flags the drop zone while a drag is over it', () => {
    const el = mount('bq-file-upload');
    const over = new win.Event('dragover', { bubbles: true, cancelable: true });
    el.dispatchEvent(over);
    expect(el.hasAttribute('data-dragging')).toBe(true);

    el.dispatchEvent(new win.Event('dragleave', { bubbles: true }));
    expect(el.hasAttribute('data-dragging')).toBe(false);
  });
});

describe('BqPopover', () => {
  beforeAll(async () => {
    await import('../src/components/popover/index.js');
  });

  it('toggles open on trigger click and closes on Escape', async () => {
    const el = mount('bq-popover', { heading: 'Details' });
    el.innerHTML = '<button slot="trigger">Open</button>Body';
    await waitForFrame(2);

    const trigger = el.querySelector('[slot="trigger"]') as HTMLElement;
    trigger.click();
    expect(el.hasAttribute('open')).toBe(true);

    el.dispatchEvent(
      new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    );
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('marks the panel as a labelled dialog', () => {
    const el = mount('bq-popover', { heading: 'Details' });
    const panel = el.shadowRoot?.querySelector('.panel');
    expect(panel?.getAttribute('role')).toBe('dialog');
    expect(panel?.getAttribute('aria-labelledby')).toBe(
      el.shadowRoot?.querySelector('.heading')?.id
    );
  });

  it('closes through the dismiss button', async () => {
    const el = mount('bq-popover', { heading: 'Details', open: '' });
    el.innerHTML = '<button slot="trigger">Open</button>';
    await waitForFrame(2);

    let closed = false;
    el.addEventListener('bq-close', () => {
      closed = true;
    });
    (el.shadowRoot?.querySelector('.close') as HTMLElement).click();
    expect(closed).toBe(true);
    expect(el.hasAttribute('open')).toBe(false);
  });

  it('reflects expanded state onto the trigger', async () => {
    const el = mount('bq-popover');
    el.innerHTML = '<button slot="trigger">Open</button>';
    await waitForFrame(2);

    const trigger = el.querySelector('[slot="trigger"]') as HTMLElement;
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });
});
