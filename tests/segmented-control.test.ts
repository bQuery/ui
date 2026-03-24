// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as
  Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqSegmentedControl', () => {
  beforeAll(async () => {
    await import('../src/components/segmented-control/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const createControl = (
    beforeAppend?: (elements: {
      el: HTMLElement;
      overview: HTMLButtonElement;
      board: HTMLButtonElement;
      activity: HTMLButtonElement;
    }) => void
  ) => {
    const el = doc.createElement('bq-segmented-control');
    el.setAttribute('name', 'view');
    el.setAttribute('label', 'View mode');
    el.setAttribute('hint', 'Choose a preferred layout');

    const overview = doc.createElement('button');
    overview.setAttribute('value', 'overview');
    overview.textContent = 'Overview';

    const board = doc.createElement('button');
    board.setAttribute('value', 'board');
    board.textContent = 'Board';

    const activity = doc.createElement('button');
    activity.setAttribute('value', 'activity');
    activity.textContent = 'Activity';

    el.append(overview, board, activity);
    beforeAppend?.({ el, overview, board, activity });
    doc.body.appendChild(el);

    return { el, overview, board, activity };
  };

  it('should define bq-segmented-control as a custom element', () => {
    expect(win.customElements.get('bq-segmented-control')).toBeDefined();
  });

  it('should link the radiogroup to its label and hint', async () => {
    const { el } = createControl();
    await waitForFrame();

    const group = el.shadowRoot?.querySelector('[role="radiogroup"]');
    const label = el.shadowRoot?.querySelector('[part="label"]');
    const hint = el.shadowRoot?.querySelector('[part="hint"]');

    expect(group?.getAttribute('aria-labelledby')).toBe(label?.id);
    expect(group?.getAttribute('aria-describedby')).toBe(hint?.id);
  });

  it('should default to the first enabled segment and sync a form proxy', async () => {
    const { el, overview, board } = createControl();
    board.setAttribute('disabled', '');
    await waitForFrame();

    const proxy = el.nextElementSibling as HTMLInputElement | null;

    expect(el.getAttribute('value')).toBe('overview');
    expect(overview.getAttribute('data-selected')).toBe('true');
    expect(overview.getAttribute('aria-checked')).toBe('true');
    expect(overview.getAttribute('tabindex')).toBe('0');
    expect(board.getAttribute('aria-disabled')).toBe('true');
    expect(proxy?.name).toBe('view');
    expect(proxy?.value).toBe('overview');
  });

  it('should dispatch bq-change and update selection on click', async () => {
    const { el, board } = createControl();
    await waitForFrame();

    let detailValue = '';
    el.addEventListener('bq-change', (event: Event) => {
      detailValue = (event as CustomEvent<{ value: string }>).detail.value;
    });

    board.click();

    expect(el.getAttribute('value')).toBe('board');
    expect(board.getAttribute('data-selected')).toBe('true');
    expect(detailValue).toBe('board');
  });

  it('should not register a host keydown listener', async () => {
    let hostKeydownRegistrations = 0;
    const { el } = createControl(({ el: control }) => {
      const originalHostAddEventListener = control.addEventListener.bind(control);
      control.addEventListener = ((type, listener, options) => {
        if (type === 'keydown') hostKeydownRegistrations += 1;
        return originalHostAddEventListener(type, listener, options);
      }) as HTMLElement['addEventListener'];
    });

    await waitForFrame();

    expect(hostKeydownRegistrations).toBe(0);
  });

  it('should allow aria-label when no visible label is rendered', async () => {
    const el = doc.createElement('bq-segmented-control');
    el.setAttribute('aria-label', 'Display density');

    const compact = doc.createElement('button');
    compact.setAttribute('value', 'compact');
    compact.textContent = 'Compact';

    const comfortable = doc.createElement('button');
    comfortable.setAttribute('value', 'comfortable');
    comfortable.textContent = 'Comfortable';

    el.append(compact, comfortable);
    doc.body.appendChild(el);

    await waitForFrame();

    const group = el.shadowRoot?.querySelector('[role="radiogroup"]');
    expect(group?.getAttribute('aria-label')).toBe('Display density');
  });
});
