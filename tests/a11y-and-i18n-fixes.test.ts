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
});
