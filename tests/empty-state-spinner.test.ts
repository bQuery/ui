import { beforeAll, describe, expect, it } from 'bun:test';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('BqEmptyState', () => {
  beforeAll(async () => {
    await import('../src/components/empty-state/index.js');
  });

  it('should define bq-empty-state as a custom element', () => {
    expect(win.customElements.get('bq-empty-state')).toBeDefined();
  });

  it('should render icon, title, description, and slotted actions', async () => {
    const el = doc.createElement('bq-empty-state');
    el.setAttribute('icon', '📭');
    el.setAttribute('title', 'No messages');
    el.setAttribute('description', 'Inbox zero is real.');
    el.innerHTML = '<button type="button">Refresh</button>';
    doc.body.appendChild(el);

    await Promise.resolve();

    const icon = el.shadowRoot?.querySelector('.icon');
    const title = el.shadowRoot?.querySelector('.title');
    const description = el.shadowRoot?.querySelector('.description');
    const actionsSlot = el.shadowRoot?.querySelector(
      '.actions slot'
    ) as HTMLSlotElement | null;
    const assignedActions =
      actionsSlot?.assignedElements({ flatten: true }) ?? [];

    expect(icon?.textContent).toBe('📭');
    expect(title?.textContent).toBe('No messages');
    expect(description?.textContent).toBe('Inbox zero is real.');
    expect(assignedActions).toHaveLength(1);
    expect(assignedActions[0]?.textContent).toContain('Refresh');
  });
});

describe('BqSpinner', () => {
  beforeAll(async () => {
    await import('../src/components/spinner/index.js');
  });

  it('should define bq-spinner as a custom element', () => {
    expect(win.customElements.get('bq-spinner')).toBeDefined();
  });

  it('should render the requested size and variant', () => {
    const el = doc.createElement('bq-spinner');
    el.setAttribute('size', 'lg');
    el.setAttribute('variant', 'success');
    doc.body.appendChild(el);

    const spinner = el.shadowRoot?.querySelector('.spinner');
    expect(spinner?.getAttribute('data-size')).toBe('lg');
    expect(spinner?.getAttribute('data-variant')).toBe('success');
  });

  it('should expose the accessible label in both aria-label and sr-only text', () => {
    const el = doc.createElement('bq-spinner');
    el.setAttribute('label', 'Loading reports');
    doc.body.appendChild(el);

    const root = el.shadowRoot?.querySelector('.spinner-root');
    const srOnly = el.shadowRoot?.querySelector('.sr-only');
    expect(root?.getAttribute('aria-label')).toBe('Loading reports');
    expect(srOnly?.textContent).toBe('Loading reports');
  });
});
