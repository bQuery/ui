import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { mount, signal } from '@bquery/bquery/view';

/**
 * Issue #26: form components expose `value` / `checked` properties and fire
 * native-named `input` / `change` events, so `bq-model` (and other
 * frameworks' two-way bindings) work on them unchanged.
 */
const doc = (globalThis as unknown as { document: Document }).document;

const settle = () => new Promise((r) => setTimeout(r, 0));

function place(markup: string): HTMLElement {
  const root = doc.createElement('div');
  root.innerHTML = markup;
  doc.body.appendChild(root);
  return root;
}

/** Simulates typing: a composed native input event, as browsers fire it. */
function type(field: HTMLInputElement | HTMLTextAreaElement, text: string) {
  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

describe('form controls as native-style properties and events', () => {
  beforeAll(async () => {
    await import('../src/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  it('value reads and writes the attribute, without firing events', async () => {
    const root = place('<bq-input value="a"></bq-input><bq-slider></bq-slider><bq-number-input></bq-number-input>');
    await settle();
    const input = root.querySelector('bq-input') as HTMLElement & { value: string };
    let events = 0;
    input.addEventListener('input', () => events++);
    input.addEventListener('change', () => events++);
    expect(input.value).toBe('a');
    input.value = 'b';
    expect(input.getAttribute('value')).toBe('b');
    expect(events).toBe(0);
    expect((root.querySelector('bq-slider') as HTMLElement & { value: string }).value).toBe('50');
    expect((root.querySelector('bq-number-input') as HTMLElement & { value: string }).value).toBe('0');
  });

  it('checkable controls expose checked and type', async () => {
    const root = place('<bq-checkbox checked></bq-checkbox><bq-switch></bq-switch><bq-radio value="x"></bq-radio>');
    await settle();
    const [cb, sw, radio] = Array.from(root.querySelectorAll('bq-checkbox, bq-switch, bq-radio')) as Array<HTMLElement & { checked: boolean; type: string; value: string }>;
    expect(cb!.checked).toBe(true);
    expect(cb!.type).toBe('checkbox');
    expect(sw!.type).toBe('checkbox');
    expect(radio!.type).toBe('radio');
    expect(radio!.value).toBe('x');
    sw!.checked = true;
    expect(sw!.hasAttribute('checked')).toBe(true);
    cb!.checked = false;
    expect(cb!.hasAttribute('checked')).toBe(false);
  });

  it('a property set before upgrade is applied once the element connects', async () => {
    const pre = doc.createElement('div');
    pre.innerHTML = '<bq-input></bq-input>';
    const field = pre.firstElementChild as HTMLElement & { value: string };
    // Simulate an own data property shadowing the accessor (pre-upgrade write).
    Object.defineProperty(field, 'value', { value: 'early', writable: true, configurable: true, enumerable: true });
    doc.body.appendChild(pre);
    await settle();
    expect(field.getAttribute('value')).toBe('early');
    expect(field.value).toBe('early');
  });

  it('typing fires exactly one input event on the host', async () => {
    const root = place('<bq-input></bq-input>');
    await settle();
    const host = root.querySelector('bq-input') as HTMLElement & { value: string };
    const seen: string[] = [];
    host.addEventListener('input', () => seen.push(host.value));
    type(host.shadowRoot!.querySelector('input')!, 'hi');
    expect(seen).toEqual(['hi']);
  });

  it('an element connected before its tag is defined keeps its pending value working', async () => {
    const { registerFormControl } = await import('../src/utils/model.js');
    const tag = 'bq-late-field';
    const el = doc.createElement(tag) as HTMLElement & { value: string };
    doc.body.appendChild(el);
    el.value = 'early';
    // Defining upgrades the connected element synchronously, before the
    // accessor installation that follows component() in the old order.
    registerFormControl<{ value: string }>(tag, {
      props: { value: { type: String, default: '' } },
      render: () => '<span></span>',
    });
    expect(el.getAttribute('value')).toBe('early');
    el.value = 'later';
    expect(el.getAttribute('value')).toBe('later');
    expect(Object.prototype.hasOwnProperty.call(el, 'value')).toBe(false);
  });

  it('a checkbox click fires exactly one input event, with the new state', async () => {
    const root = place('<bq-checkbox></bq-checkbox>');
    await settle();
    const host = root.querySelector('bq-checkbox') as HTMLElement & { checked: boolean };
    const seen: string[] = [];
    host.addEventListener('input', () => seen.push(`input:${host.checked}`));
    host.addEventListener('change', () => seen.push(`change:${host.checked}`));
    host.shadowRoot!.querySelector('input')!.click();
    expect(seen).toEqual(['input:true', 'change:true']);
  });

  it('an emptied number field reads as an empty value', async () => {
    const root = place('<bq-number-input value="4"></bq-number-input>');
    await settle();
    const host = root.querySelector('bq-number-input') as HTMLElement & { value: string };
    const field = host.shadowRoot!.querySelector('input[type="number"]') as HTMLInputElement;
    field.value = '';
    expect(host.value).toBe('');
  });

  it('clicking a checkbox fires input then change on the host with the new state', async () => {
    const root = place('<bq-checkbox></bq-checkbox>');
    await settle();
    const host = root.querySelector('bq-checkbox') as HTMLElement & { checked: boolean };
    const seen: string[] = [];
    host.addEventListener('input', () => seen.push(`input:${host.checked}`));
    host.addEventListener('change', () => seen.push(`change:${host.checked}`));
    host.shadowRoot!.querySelector('input')!.click();
    expect(seen.at(-2)).toBe('input:true');
    expect(seen.at(-1)).toBe('change:true');
  });

  it('a number-input step button fires input and change', async () => {
    const root = place('<bq-number-input value="1"></bq-number-input>');
    await settle();
    const host = root.querySelector('bq-number-input') as HTMLElement & { value: string };
    const seen: string[] = [];
    host.addEventListener('input', () => seen.push(`input:${host.value}`));
    host.addEventListener('change', () => seen.push(`change:${host.value}`));
    (host.shadowRoot!.querySelector('[data-action="increment"]') as HTMLButtonElement).click();
    expect(seen).toEqual(['input:2', 'change:2']);
  });

  describe('bq-model', () => {
    it('binds bq-input both ways', async () => {
      const root = place('<bq-input bq-model="name"></bq-input>');
      const name = signal('Ada');
      const view = mount(root, { name });
      await settle();
      const host = root.querySelector('bq-input') as HTMLElement;
      expect(host.getAttribute('value')).toBe('Ada');
      await settle();
      type(host.shadowRoot!.querySelector('input')!, 'Grace');
      expect(name.value).toBe('Grace');
      name.value = 'Linus';
      expect(host.getAttribute('value')).toBe('Linus');
      view.destroy();
    });

    it('binds bq-textarea and bq-select', async () => {
      const root = place(`
        <bq-textarea bq-model="bio"></bq-textarea>
        <bq-select bq-model="pick"><option value="a">A</option><option value="b">B</option></bq-select>`);
      const bio = signal('x');
      const pick = signal('a');
      const view = mount(root, { bio, pick });
      await settle();
      const area = root.querySelector('bq-textarea') as HTMLElement;
      type(area.shadowRoot!.querySelector('textarea')!, 'hello');
      expect(bio.value).toBe('hello');

      const select = root.querySelector('bq-select') as HTMLElement;
      await settle();
      const native = select.shadowRoot!.querySelector('select') as HTMLSelectElement;
      native.value = 'b';
      native.dispatchEvent(new Event('change', { bubbles: true }));
      expect(pick.value).toBe('b');
      pick.value = 'a';
      expect(select.getAttribute('value')).toBe('a');
      view.destroy();
    });

    it('binds bq-switch / bq-checkbox to booleans', async () => {
      const root = place('<bq-switch bq-model="on"></bq-switch>');
      const on = signal(false);
      const view = mount(root, { on });
      await settle();
      const host = root.querySelector('bq-switch') as HTMLElement;
      expect(host.hasAttribute('checked')).toBe(false);
      host.shadowRoot!.querySelector('input')!.click();
      expect(on.value).toBe(true);
      on.value = false;
      expect(host.hasAttribute('checked')).toBe(false);
      view.destroy();
    });

    it('binds a bq-radio group to the selected value', async () => {
      const root = place(`
        <bq-radio name="size" value="s" bq-model="size"></bq-radio>
        <bq-radio name="size" value="m" bq-model="size"></bq-radio>`);
      const size = signal('s');
      const view = mount(root, { size });
      await settle();
      const [s, m] = Array.from(root.querySelectorAll('bq-radio')) as HTMLElement[];
      expect(s!.hasAttribute('checked')).toBe(true);
      expect(m!.hasAttribute('checked')).toBe(false);
      m!.shadowRoot!.querySelector('input')!.click();
      expect(size.value).toBe('m');
      size.value = 's';
      expect(s!.hasAttribute('checked')).toBe(true);
      expect(m!.hasAttribute('checked')).toBe(false);
      view.destroy();
    });
  });
});
