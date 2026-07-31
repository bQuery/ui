// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { resetLocale, setLocale } from '../src/i18n/index.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqSegmentedControl', () => {
  beforeAll(async () => {
    await import('../src/components/segmented-control/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
    resetLocale();
  });

  const createControl = (
    beforeAttach?: (elements: {
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
    beforeAttach?.({ el, overview, board, activity });
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

  // Keyboard handling used to be bound to every individual segment button,
  // which meant a button removed from the light DOM kept its listener. The
  // handler resolves its button from the event target anyway, so one
  // delegated listener on the host does the same job without the leak. What
  // must hold either way is that a keypress is handled exactly once — see
  // the ArrowRight test below, which is the regression guard for the
  // double-handling bug that the two-path implementation originally caused.
  it('should not bind keydown listeners to individual segment buttons', async () => {
    const perButtonRegistrations: string[] = [];
    const { overview, board } = createControl(({ overview: a, board: b }) => {
      for (const button of [a, b]) {
        const original = button.addEventListener.bind(button);
        button.addEventListener = ((type, listener, options) => {
          if (type === 'keydown') perButtonRegistrations.push(type);
          return original(type, listener, options);
        }) as HTMLElement['addEventListener'];
      }
    });

    await waitForFrame();

    expect(perButtonRegistrations).toEqual([]);

    // Delegation still has to reach a button that was never present when the
    // component connected.
    const extra = doc.createElement('button');
    extra.setAttribute('value', 'timeline');
    extra.textContent = 'Timeline';
    board.after(extra);
    await waitForFrame();

    extra.dispatchEvent(
      new win.KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        cancelable: true,
      })
    );

    expect(overview.getAttribute('data-selected')).toBe('true');
  });

  it('should still move selection when a segment receives ArrowRight', async () => {
    const { el, overview, board } = createControl();
    await waitForFrame();

    let changes = 0;
    el.addEventListener('bq-change', () => {
      changes += 1;
    });

    overview.dispatchEvent(
      new win.KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      })
    );

    expect(el.getAttribute('value')).toBe('board');
    expect(board.getAttribute('data-selected')).toBe('true');
    expect(changes).toBe(1);
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

  it('should fall back to the localized default label when no label props are provided', async () => {
    setLocale({ segmentedControl: { defaultLabel: 'Optionen' } });

    const el = doc.createElement('bq-segmented-control');

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
    expect(group?.getAttribute('aria-label')).toBe('Optionen');
  });
});
