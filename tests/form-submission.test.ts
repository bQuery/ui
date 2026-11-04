import { afterEach, beforeAll, describe, expect, it } from 'bun:test';

/**
 * Issue #25: a native control inside a shadow root has no form owner, so
 * `bq-button type="submit"` and Enter in `bq-input` must reach the host's
 * `<form>` on their own.
 */
const doc = (globalThis as unknown as { document: Document }).document;

async function settle() {
  await new Promise((r) => setTimeout(r, 0));
}

function mount(markup: string) {
  const wrap = doc.createElement('div');
  wrap.innerHTML = markup;
  doc.body.appendChild(wrap);
  const form = wrap.querySelector('form') as HTMLFormElement;
  let submits = 0;
  let resets = 0;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submits++;
  });
  form.addEventListener('reset', () => resets++);
  return { wrap, form, counts: () => ({ submits, resets }) };
}

function enter(target: Element, init: KeyboardEventInit = {}) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true, cancelable: true, ...init }),
  );
}

describe('form submission from shadow controls', () => {
  beforeAll(async () => {
    await import('../src/components/button/index.js');
    await import('../src/components/input/index.js');
    await import('../src/components/number-input/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('bq-button type="submit" submits the surrounding form', async () => {
    const { wrap, counts } = mount('<form><bq-button type="submit">Go</bq-button></form>');
    await settle();
    wrap.querySelector('bq-button')!.shadowRoot!.querySelector('button')!.click();
    expect(counts().submits).toBe(1);
  });

  it('bq-button type="reset" resets the surrounding form', async () => {
    const { wrap, counts } = mount('<form><bq-button type="reset">Reset</bq-button></form>');
    await settle();
    wrap.querySelector('bq-button')!.shadowRoot!.querySelector('button')!.click();
    expect(counts()).toEqual({ submits: 0, resets: 1 });
  });

  it('a default (type="button") bq-button does not submit', async () => {
    const { wrap, counts } = mount('<form><bq-button>Plain</bq-button></form>');
    await settle();
    wrap.querySelector('bq-button')!.shadowRoot!.querySelector('button')!.click();
    expect(counts().submits).toBe(0);
  });

  it('a disabled or loading submit button does not submit', async () => {
    const { wrap, counts } = mount(
      '<form><bq-button type="submit" disabled>A</bq-button><bq-button type="submit" loading>B</bq-button></form>',
    );
    await settle();
    for (const b of wrap.querySelectorAll('bq-button')) {
      b.shadowRoot!.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    }
    expect(counts().submits).toBe(0);
  });

  it('preventDefault() on bq-click cancels the submission', async () => {
    const { wrap, counts } = mount('<form><bq-button type="submit">Go</bq-button></form>');
    await settle();
    const button = wrap.querySelector('bq-button')!;
    button.addEventListener('bq-click', (e) => e.preventDefault());
    button.shadowRoot!.querySelector('button')!.click();
    expect(counts().submits).toBe(0);
  });

  it('the form attribute targets a form elsewhere in the document', async () => {
    const { wrap, counts } = mount('<form id="f-remote"></form><bq-button type="submit" form="f-remote">Go</bq-button>');
    await settle();
    wrap.querySelector('bq-button')!.shadowRoot!.querySelector('button')!.click();
    expect(counts().submits).toBe(1);
  });

  it('Enter in bq-input submits the form', async () => {
    const { wrap, counts } = mount('<form><bq-input name="q"></bq-input><bq-button type="submit">Go</bq-button></form>');
    await settle();
    enter(wrap.querySelector('bq-input')!.shadowRoot!.querySelector('input')!);
    expect(counts().submits).toBe(1);
  });

  it('Enter in bq-input submits a form without any submit button', async () => {
    const { wrap, counts } = mount('<form><bq-input name="q"></bq-input></form>');
    await settle();
    enter(wrap.querySelector('bq-input')!.shadowRoot!.querySelector('input')!);
    expect(counts().submits).toBe(1);
  });

  it('Enter does not submit when the default button is disabled, during IME composition, or with a modifier', async () => {
    const { wrap, counts } = mount(
      '<form><bq-input name="q"></bq-input><bq-button type="submit" disabled>Go</bq-button></form>',
    );
    await settle();
    const field = wrap.querySelector('bq-input')!.shadowRoot!.querySelector('input')!;
    enter(field);
    wrap.querySelector('bq-button')!.removeAttribute('disabled');
    await settle();
    enter(field, { isComposing: true });
    enter(field, { shiftKey: true });
    expect(counts().submits).toBe(0);
    enter(field);
    expect(counts().submits).toBe(1);
  });

  it('Enter in bq-number-input commits the typed value, then submits', async () => {
    const { wrap, form, counts } = mount(
      '<form><bq-number-input name="n" value="1" max="10"></bq-number-input></form>',
    );
    await settle();
    const host = wrap.querySelector('bq-number-input')!;
    const field = host.shadowRoot!.querySelector('input[type="number"]') as HTMLInputElement;
    field.value = '42';
    enter(field);
    expect(host.getAttribute('value')).toBe('10');
    expect(counts().submits).toBe(1);
    const proxy = form.querySelector('input[data-bq-form-proxy]') as HTMLInputElement;
    expect(proxy.value).toBe('10');
  });
});
