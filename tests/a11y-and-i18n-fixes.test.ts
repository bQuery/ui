// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { describe, it, expect, beforeAll, afterEach } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)['window'] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('accessibility and i18n fixes', () => {
  beforeAll(async () => {
    await import('../src/components/select/index.js');
    await import('../src/components/chip/index.js');
    await import('../src/components/table/index.js');
    await import('../src/components/dialog/index.js');
    await import('../src/components/drawer/index.js');
    await import('../src/components/spinner/index.js');
    await import('../src/components/toast/index.js');
    await import('../src/components/accordion/index.js');
    await import('../src/components/progress/index.js');
    await import('../src/components/skeleton/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  // --- BqSelect aria-describedby ---
  it('should link select to error message via aria-describedby', () => {
    const el = doc.createElement('bq-select');
    el.setAttribute('label', 'Country');
    el.setAttribute('error', 'Required field');
    doc.body.appendChild(el);

    const select = el.shadowRoot?.querySelector('select');
    const errorSpan = el.shadowRoot?.querySelector('.error-msg');

    expect(select?.getAttribute('aria-invalid')).toBe('true');
    expect(select?.getAttribute('aria-describedby')).toBeTruthy();
    expect(errorSpan?.id).toBeTruthy();
    expect(select?.getAttribute('aria-describedby')).toBe(errorSpan?.id);
  });

  it('should not add aria-describedby to select when no error', () => {
    const el = doc.createElement('bq-select');
    el.setAttribute('label', 'Country');
    doc.body.appendChild(el);

    const select = el.shadowRoot?.querySelector('select');
    expect(select?.getAttribute('aria-invalid')).toBe('false');
    // aria-describedby should be absent or empty when there is no error
    const describedBy = select?.getAttribute('aria-describedby');
    expect(!describedBy || describedBy === '').toBe(true);
  });

  // --- BqChip aria-pressed fix ---
  it('should render aria-pressed as string "true"/"false" on chip', () => {
    const el = doc.createElement('bq-chip');
    doc.body.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.getAttribute('aria-pressed')).toBe('false');

    el.setAttribute('selected', '');
    const chipAfter = el.shadowRoot?.querySelector('.chip');
    expect(chipAfter?.getAttribute('aria-pressed')).toBe('true');
  });

  it('should render aria-disabled as string "true"/"false" on chip', () => {
    const el = doc.createElement('bq-chip');
    doc.body.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.getAttribute('aria-disabled')).toBe('false');

    el.setAttribute('disabled', '');
    const chipAfter = el.shadowRoot?.querySelector('.chip');
    expect(chipAfter?.getAttribute('aria-disabled')).toBe('true');
  });

  // --- BqTable i18n strings ---
  it('should use i18n strings for table loading state', () => {
    const el = doc.createElement('bq-table');
    el.setAttribute('columns', JSON.stringify([{ key: 'name', label: 'Name' }]));
    el.setAttribute('rows', '[]');
    el.setAttribute('loading', '');
    doc.body.appendChild(el);

    const loadingCell = el.shadowRoot?.querySelector('.loading-overlay');
    expect(loadingCell).toBeTruthy();
    // Should use the i18n translated string, not hardcoded "Loading…"
    const text = loadingCell?.textContent?.trim() ?? '';
    expect(text.length).toBeGreaterThan(0);
    // The i18n default is "Loading data…"
    expect(text).toBe('Loading data…');
  });

  it('should use i18n strings for table empty state', () => {
    const el = doc.createElement('bq-table');
    el.setAttribute('columns', JSON.stringify([{ key: 'name', label: 'Name' }]));
    el.setAttribute('rows', '[]');
    doc.body.appendChild(el);

    const emptyCell = el.shadowRoot?.querySelector('.empty-row td');
    expect(emptyCell).toBeTruthy();
    // The i18n default is "No data available"
    expect(emptyCell?.textContent?.trim()).toBe('No data available');
  });

  // --- Prefers-reduced-motion CSS ---
  it('should include prefers-reduced-motion media query in dialog styles', () => {
    const el = doc.createElement('bq-dialog');
    doc.body.appendChild(el);

    const styles = el.shadowRoot?.querySelector('style');
    expect(styles?.textContent).toContain('prefers-reduced-motion');
  });

  it('should include prefers-reduced-motion media query in drawer styles', () => {
    const el = doc.createElement('bq-drawer');
    doc.body.appendChild(el);

    const styles = el.shadowRoot?.querySelector('style');
    expect(styles?.textContent).toContain('prefers-reduced-motion');
  });

  it('should include prefers-reduced-motion media query in spinner styles', () => {
    const el = doc.createElement('bq-spinner');
    doc.body.appendChild(el);

    const styles = el.shadowRoot?.querySelector('style');
    expect(styles?.textContent).toContain('prefers-reduced-motion');
  });

  it('should include prefers-reduced-motion media query in toast styles', () => {
    const el = doc.createElement('bq-toast');
    el.setAttribute('message', 'Test');
    el.setAttribute('duration', '0');
    doc.body.appendChild(el);

    const styles = el.shadowRoot?.querySelector('style');
    expect(styles?.textContent).toContain('prefers-reduced-motion');
  });

  it('should include prefers-reduced-motion media query in accordion styles', () => {
    const el = doc.createElement('bq-accordion');
    doc.body.appendChild(el);

    const styles = el.shadowRoot?.querySelector('style');
    expect(styles?.textContent).toContain('prefers-reduced-motion');
  });

  it('should include prefers-reduced-motion media query in progress styles', () => {
    const el = doc.createElement('bq-progress');
    doc.body.appendChild(el);

    const styles = el.shadowRoot?.querySelector('style');
    expect(styles?.textContent).toContain('prefers-reduced-motion');
    expect(styles?.textContent).toContain(':host([indeterminate]) .bar { animation: none; width: 40% !important; opacity: 0.7; }');
  });

  it('should include prefers-reduced-motion media query in skeleton styles', () => {
    const el = doc.createElement('bq-skeleton');
    doc.body.appendChild(el);

    const styles = el.shadowRoot?.querySelector('style');
    expect(styles?.textContent).toContain('prefers-reduced-motion');
  });

  // --- Chip keyboard navigation ---
  it('should have tabindex on chip for keyboard accessibility', () => {
    const el = doc.createElement('bq-chip');
    doc.body.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.getAttribute('tabindex')).toBe('0');
    expect(chip?.getAttribute('role')).toBe('button');
  });

  it('should set tabindex -1 on disabled chip', () => {
    const el = doc.createElement('bq-chip');
    el.setAttribute('disabled', '');
    doc.body.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.getAttribute('tabindex')).toBe('-1');
  });

  it('should dispatch bq-click once for Enter keydown and Space keyup on the chip surface', () => {
    const el = doc.createElement('bq-chip');
    doc.body.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip') as HTMLElement | null;
    expect(chip).toBeTruthy();

    let clicks = 0;
    el.addEventListener('bq-click', () => {
      clicks += 1;
    });

    chip?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    chip?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    chip?.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));

    expect(clicks).toBe(2);
  });

  it('should ignore repeated Enter keydown events on the chip surface', () => {
    const el = doc.createElement('bq-chip');
    doc.body.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip') as HTMLElement | null;
    expect(chip).toBeTruthy();

    let clicks = 0;
    el.addEventListener('bq-click', () => {
      clicks += 1;
    });

    chip?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    chip?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, repeat: true }));
    chip?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, repeat: true }));

    expect(clicks).toBe(1);
  });

  it('should ignore repeated Space keydown events on the chip surface', () => {
    const el = doc.createElement('bq-chip');
    doc.body.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip') as HTMLElement | null;
    expect(chip).toBeTruthy();

    let clicks = 0;
    el.addEventListener('bq-click', () => {
      clicks += 1;
    });

    chip?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, repeat: true }));
    chip?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, repeat: true }));
    chip?.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));

    expect(clicks).toBe(1);
  });

  it('should prevent default on Space keydown for the chip surface without activating until keyup', () => {
    const el = doc.createElement('bq-chip');
    doc.body.appendChild(el);

    const chip = el.shadowRoot?.querySelector('.chip') as HTMLElement | null;
    expect(chip).toBeTruthy();

    let clicks = 0;
    el.addEventListener('bq-click', () => {
      clicks += 1;
    });

    const keydown = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    const keyup = new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true });

    expect(chip?.dispatchEvent(keydown)).toBe(false);
    expect(keydown.defaultPrevented).toBe(true);
    expect(clicks).toBe(0);

    chip?.dispatchEvent(keyup);
    expect(keyup.defaultPrevented).toBe(true);
    expect(clicks).toBe(1);
  });

  it('should let the native remove button click dispatch bq-remove only once', () => {
    const el = doc.createElement('bq-chip');
    el.setAttribute('removable', '');
    doc.body.appendChild(el);

    const removeButton = el.shadowRoot?.querySelector('.remove-btn') as HTMLButtonElement | null;
    expect(removeButton).toBeTruthy();

    let removes = 0;
    el.addEventListener('bq-remove', () => {
      removes += 1;
    });

    removeButton?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(removes).toBe(0);

    removeButton?.click();
    expect(removes).toBe(1);
  });

  // --- Table sortable keyboard ---
  it('should render sortable table headers with tabindex for keyboard access', () => {
    const el = doc.createElement('bq-table');
    el.setAttribute('columns', JSON.stringify([
      { key: 'name', label: 'Name', sortable: true },
      { key: 'age', label: 'Age' },
    ]));
    el.setAttribute('rows', '[]');
    doc.body.appendChild(el);

    const headers = el.shadowRoot?.querySelectorAll('th');
    expect(headers?.[0]?.getAttribute('tabindex')).toBe('0');
    expect(headers?.[0]?.classList.contains('sortable')).toBe(true);
    // Non-sortable header should not have tabindex
    expect(headers?.[1]?.hasAttribute('tabindex')).toBe(false);
  });

  it('should apply columnheader role to sortable and non-sortable headers', () => {
    const el = doc.createElement('bq-table');
    el.setAttribute('columns', JSON.stringify([
      { key: 'name', label: 'Name', sortable: true },
      { key: 'age', label: 'Age' },
    ]));
    el.setAttribute('rows', '[]');
    doc.body.appendChild(el);

    const headers = Array.from(el.shadowRoot?.querySelectorAll('th') ?? []);
    expect(headers).toHaveLength(2);
    expect(headers[0]?.getAttribute('role')).toBe('columnheader');
    expect(headers[1]?.getAttribute('role')).toBe('columnheader');
  });

  it('should sort the table on Enter keydown and Space keyup for a sortable header', () => {
    const el = doc.createElement('bq-table');
    el.setAttribute('columns', JSON.stringify([
      { key: 'name', label: 'Name', sortable: true },
    ]));
    el.setAttribute('rows', JSON.stringify([{ name: 'Ada' }]));
    doc.body.appendChild(el);

    let header = el.shadowRoot?.querySelector('th.sortable') as HTMLElement | null;
    expect(header).toBeTruthy();

    const sorts: Array<{ key: string; dir: string }> = [];
    el.addEventListener('bq-sort', (event) => {
      const detail = (event as CustomEvent<{ key: string; dir: string }>).detail;
      sorts.push(detail);
    });

    header?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(el.getAttribute('sort-key')).toBe('name');
    expect(el.getAttribute('sort-dir')).toBe('asc');

    header = el.shadowRoot?.querySelector('th.sortable') as HTMLElement | null;
    header?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(sorts).toEqual([{ key: 'name', dir: 'asc' }]);
    header?.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
    expect(el.getAttribute('sort-dir')).toBe('desc');
    expect(sorts).toEqual([
      { key: 'name', dir: 'asc' },
      { key: 'name', dir: 'desc' },
    ]);
  });

  it('should ignore repeated Enter keydown events on a sortable header', () => {
    const el = doc.createElement('bq-table');
    el.setAttribute('columns', JSON.stringify([
      { key: 'name', label: 'Name', sortable: true },
    ]));
    el.setAttribute('rows', JSON.stringify([{ name: 'Ada' }]));
    doc.body.appendChild(el);

    const header = el.shadowRoot?.querySelector('th.sortable') as HTMLElement | null;
    expect(header).toBeTruthy();

    const sorts: Array<{ key: string; dir: string }> = [];
    el.addEventListener('bq-sort', (event) => {
      const detail = (event as CustomEvent<{ key: string; dir: string }>).detail;
      sorts.push(detail);
    });

    header?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    header?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, repeat: true }));
    header?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, repeat: true }));

    expect(sorts).toEqual([{ key: 'name', dir: 'asc' }]);
  });

  it('should ignore repeated Space keydown events on a sortable header', () => {
    const el = doc.createElement('bq-table');
    el.setAttribute('columns', JSON.stringify([
      { key: 'name', label: 'Name', sortable: true },
    ]));
    el.setAttribute('rows', JSON.stringify([{ name: 'Ada' }]));
    doc.body.appendChild(el);

    const header = el.shadowRoot?.querySelector('th.sortable') as HTMLElement | null;
    expect(header).toBeTruthy();

    const sorts: Array<{ key: string; dir: string }> = [];
    el.addEventListener('bq-sort', (event) => {
      const detail = (event as CustomEvent<{ key: string; dir: string }>).detail;
      sorts.push(detail);
    });

    header?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, repeat: true }));
    header?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, repeat: true }));
    expect(sorts).toEqual([]);

    header?.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
    expect(sorts).toEqual([{ key: 'name', dir: 'asc' }]);
  });

  it('should prevent default on Space keydown for a sortable header without sorting until keyup', () => {
    const el = doc.createElement('bq-table');
    el.setAttribute('columns', JSON.stringify([
      { key: 'name', label: 'Name', sortable: true },
    ]));
    el.setAttribute('rows', JSON.stringify([{ name: 'Ada' }]));
    doc.body.appendChild(el);

    const header = el.shadowRoot?.querySelector('th.sortable') as HTMLElement | null;
    expect(header).toBeTruthy();

    const sorts: Array<{ key: string; dir: string }> = [];
    el.addEventListener('bq-sort', (event) => {
      const detail = (event as CustomEvent<{ key: string; dir: string }>).detail;
      sorts.push(detail);
    });

    const keydown = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    const keyup = new KeyboardEvent('keyup', { key: ' ', bubbles: true, cancelable: true });

    expect(header?.dispatchEvent(keydown)).toBe(false);
    expect(keydown.defaultPrevented).toBe(true);
    expect(sorts).toEqual([]);

    header?.dispatchEvent(keyup);
    expect(keyup.defaultPrevented).toBe(true);
    expect(sorts).toEqual([{ key: 'name', dir: 'asc' }]);
  });
});
