// DOM environment is provided by tests/setup.ts (preloaded via bunfig.toml)
import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { resetLocale, setLocale } from '../src/i18n/index.js';
import {
  validateValue,
  validationMessageFor,
} from '../src/utils/validation.js';
import { waitForFrame } from './helpers.ts';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('validateValue — required', () => {
  it('flags an empty required value', () => {
    const flags = validateValue('', { required: true });
    expect(flags.valueMissing).toBe(true);
    expect(flags.valid).toBe(false);
  });

  it('treats whitespace-only input as missing', () => {
    expect(validateValue('   ', { required: true }).valueMissing).toBe(true);
  });

  it('accepts a filled required value', () => {
    expect(validateValue('hi', { required: true }).valid).toBe(true);
  });

  it('reports only valueMissing for an empty required field', () => {
    // The platform does not apply format constraints to a field the user has
    // not filled in; only the "fill this in" message should surface.
    const flags = validateValue('', {
      required: true,
      minLength: 5,
      type: 'email',
    });
    expect(flags.valueMissing).toBe(true);
    expect(flags.tooShort).toBe(false);
    expect(flags.typeMismatch).toBe(false);
  });

  it('leaves an empty optional field valid despite other constraints', () => {
    const flags = validateValue('', { minLength: 5, type: 'email' });
    expect(flags.valid).toBe(true);
  });
});

describe('validateValue — type', () => {
  it('validates email addresses', () => {
    expect(validateValue('user@example.com', { type: 'email' }).valid).toBe(
      true
    );
    expect(validateValue('user@sub.example.co', { type: 'email' }).valid).toBe(
      true
    );
    expect(validateValue('nope', { type: 'email' }).typeMismatch).toBe(true);
    expect(validateValue('a@b', { type: 'email' }).typeMismatch).toBe(true);
    expect(validateValue('a b@c.de', { type: 'email' }).typeMismatch).toBe(
      true
    );
  });

  it('validates URLs', () => {
    expect(validateValue('https://example.com', { type: 'url' }).valid).toBe(
      true
    );
    expect(validateValue('example.com', { type: 'url' }).typeMismatch).toBe(
      true
    );
  });

  it('validates numbers', () => {
    expect(validateValue('42', { type: 'number' }).valid).toBe(true);
    expect(validateValue('4x2', { type: 'number' }).typeMismatch).toBe(true);
  });

  it('ignores unknown types', () => {
    expect(validateValue('anything', { type: 'text' }).valid).toBe(true);
  });
});

describe('validateValue — length and range', () => {
  it('enforces minLength and maxLength', () => {
    expect(validateValue('ab', { minLength: 3 }).tooShort).toBe(true);
    expect(validateValue('abc', { minLength: 3 }).valid).toBe(true);
    expect(validateValue('abcd', { maxLength: 3 }).tooLong).toBe(true);
  });

  it('enforces min and max', () => {
    expect(validateValue('4', { min: 5 }).rangeUnderflow).toBe(true);
    expect(validateValue('5', { min: 5 }).valid).toBe(true);
    expect(validateValue('11', { max: 10 }).rangeOverflow).toBe(true);
  });

  it('enforces step relative to min', () => {
    expect(validateValue('4', { min: 0, step: 2 }).stepMismatch).toBe(false);
    expect(validateValue('5', { min: 0, step: 2 }).stepMismatch).toBe(true);
    expect(validateValue('7', { min: 1, step: 2 }).stepMismatch).toBe(false);
  });

  it('tolerates decimal steps without floating-point false positives', () => {
    // 0.3 / 0.1 is 2.9999999999999996 in IEEE 754; a naive modulo would
    // report this exact, user-typed value as off-grid.
    expect(validateValue('0.3', { min: 0, step: 0.1 }).stepMismatch).toBe(
      false
    );
  });

  it('ignores a non-positive step', () => {
    expect(validateValue('5', { min: 0, step: 0 }).stepMismatch).toBe(false);
  });
});

describe('validateValue — pattern', () => {
  it('anchors the pattern', () => {
    // Unanchored, "abc123" would match /[a-z]+/ — the platform requires the
    // whole value to match.
    expect(validateValue('abc123', { pattern: '[a-z]+' }).patternMismatch).toBe(
      true
    );
    expect(validateValue('abc', { pattern: '[a-z]+' }).patternMismatch).toBe(
      false
    );
  });

  it('ignores an unparseable pattern instead of failing the field', () => {
    expect(validateValue('abc', { pattern: '([' }).valid).toBe(true);
  });
});

describe('validateValue — custom errors', () => {
  it('invalidates a field carrying a custom error', () => {
    const flags = validateValue('fine', { customError: 'Already taken' });
    expect(flags.customError).toBe(true);
    expect(flags.valid).toBe(false);
  });

  it('keeps the custom error on an empty optional field', () => {
    const flags = validateValue('', { customError: 'Nope' });
    expect(flags.valid).toBe(false);
  });
});

describe('validationMessageFor', () => {
  afterEach(() => resetLocale());

  it('returns an empty message for a valid field', () => {
    expect(validationMessageFor(validateValue('ok', {}), {})).toBe('');
  });

  it('prefers the custom error over constraint messages', () => {
    const rules = { required: true, customError: 'Already taken' };
    expect(validationMessageFor(validateValue('', rules), rules)).toBe(
      'Already taken'
    );
  });

  it('interpolates the offending bound', () => {
    const rules = { minLength: 8 };
    expect(validationMessageFor(validateValue('short', rules), rules)).toBe(
      'Please use at least 8 characters.'
    );
  });

  it('is localizable', () => {
    setLocale({ validation: { valueMissing: 'Bitte ausfüllen.' } });
    const rules = { required: true };
    expect(validationMessageFor(validateValue('', rules), rules)).toBe(
      'Bitte ausfüllen.'
    );
  });

  it('picks a type-specific message', () => {
    const rules = { type: 'email' };
    expect(validationMessageFor(validateValue('nope', rules), rules)).toBe(
      'Please enter a valid email address.'
    );
  });
});

describe('bindValidation — on components', () => {
  beforeAll(async () => {
    await import('../src/components/input/index.js');
    await import('../src/components/select/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
    resetLocale();
  });

  type Validatable = HTMLElement & {
    checkValidity(): boolean;
    reportValidity(): boolean;
    setCustomValidity(message: string): void;
    readonly validity: { valid: boolean; valueMissing: boolean };
    readonly validationMessage: string;
  };

  const makeInput = (attrs: Record<string, string>): Validatable => {
    const el = doc.createElement('bq-input') as Validatable;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    doc.body.appendChild(el);
    return el;
  };

  it('exposes the constraint validation surface on the host', async () => {
    const el = makeInput({ required: '', value: '' });
    await waitForFrame();

    expect(typeof el.checkValidity).toBe('function');
    expect(typeof el.reportValidity).toBe('function');
    expect(typeof el.setCustomValidity).toBe('function');
    expect(el.validity.valueMissing).toBe(true);
    expect(el.validationMessage).toBe('Please fill out this field.');
  });

  it('reflects validity through aria-invalid', async () => {
    const el = makeInput({ required: '', value: '' });
    await waitForFrame();

    expect(el.checkValidity()).toBe(false);
    expect(el.getAttribute('aria-invalid')).toBe('true');

    el.setAttribute('value', 'filled');
    await waitForFrame();

    expect(el.checkValidity()).toBe(true);
    expect(el.getAttribute('aria-invalid')).toBe('false');
  });

  it('surfaces the message only on reportValidity', async () => {
    const el = makeInput({ required: '', value: '' });
    await waitForFrame();

    el.checkValidity();
    expect(el.hasAttribute('error')).toBe(false);

    el.reportValidity();
    expect(el.getAttribute('error')).toBe('Please fill out this field.');
  });

  it('clears the reported message once the field becomes valid', async () => {
    const el = makeInput({ required: '', value: '' });
    await waitForFrame();
    el.reportValidity();
    expect(el.hasAttribute('error')).toBe(true);

    el.setAttribute('value', 'filled');
    await waitForFrame();
    expect(el.reportValidity()).toBe(true);
    expect(el.hasAttribute('error')).toBe(false);
  });

  it('emits a cancelable bq-invalid event that suppresses reporting', async () => {
    const el = makeInput({ required: '', value: '' });
    await waitForFrame();

    let seen = '';
    el.addEventListener('bq-invalid', (event) => {
      seen = (event as CustomEvent<{ message: string }>).detail.message;
      event.preventDefault();
    });

    expect(el.reportValidity()).toBe(false);
    expect(seen).toBe('Please fill out this field.');
    // Cancelled: the component must not paint its own error message.
    expect(el.hasAttribute('error')).toBe(false);
  });

  it('honours setCustomValidity and clears it with an empty string', async () => {
    const el = makeInput({ value: 'taken' });
    await waitForFrame();

    el.setCustomValidity('Already taken');
    expect(el.checkValidity()).toBe(false);
    expect(el.validationMessage).toBe('Already taken');

    el.setCustomValidity('');
    expect(el.checkValidity()).toBe(true);
  });

  it('reads constraints from attributes at check time', async () => {
    const el = makeInput({ value: 'ab' });
    await waitForFrame();
    expect(el.checkValidity()).toBe(true);

    el.setAttribute('minlength', '5');
    expect(el.checkValidity()).toBe(false);
  });
});

describe('bindValidation — form submission guard', () => {
  beforeAll(async () => {
    await import('../src/components/input/index.js');
  });

  afterEach(() => {
    doc.body.innerHTML = '';
  });

  const submitForm = (form: HTMLFormElement): boolean =>
    form.dispatchEvent(
      new win.Event('submit', { bubbles: true, cancelable: true })
    );

  it('blocks submission while a control is invalid', async () => {
    const form = doc.createElement('form');
    const el = doc.createElement('bq-input');
    el.setAttribute('required', '');
    el.setAttribute('name', 'email');
    form.appendChild(el);
    doc.body.appendChild(form);
    await waitForFrame();

    let submitted = false;
    form.addEventListener('submit', () => {
      submitted = true;
    });

    const notPrevented = submitForm(form);

    expect(notPrevented).toBe(false);
    // The guard runs in the capture phase, so application handlers never fire.
    expect(submitted).toBe(false);
    expect(el.getAttribute('error')).toBe('Please fill out this field.');
  });

  it('allows submission once every control is valid', async () => {
    const form = doc.createElement('form');
    const el = doc.createElement('bq-input');
    el.setAttribute('required', '');
    el.setAttribute('value', 'someone@example.com');
    form.appendChild(el);
    doc.body.appendChild(form);
    await waitForFrame();

    let submitted = false;
    form.addEventListener('submit', (event) => {
      submitted = true;
      event.preventDefault();
    });

    submitForm(form);
    expect(submitted).toBe(true);
  });

  it('respects novalidate on the form', async () => {
    const form = doc.createElement('form');
    form.setAttribute('novalidate', '');
    const el = doc.createElement('bq-input');
    el.setAttribute('required', '');
    form.appendChild(el);
    doc.body.appendChild(form);
    await waitForFrame();

    let submitted = false;
    form.addEventListener('submit', (event) => {
      submitted = true;
      event.preventDefault();
    });

    submitForm(form);
    expect(submitted).toBe(true);
  });

  it('stops guarding a control that was removed from the form', async () => {
    const form = doc.createElement('form');
    const good = doc.createElement('bq-input');
    good.setAttribute('value', 'fine');
    const bad = doc.createElement('bq-input');
    bad.setAttribute('required', '');
    form.append(good, bad);
    doc.body.appendChild(form);
    await waitForFrame();

    expect(submitForm(form)).toBe(false);

    bad.remove();
    await waitForFrame();

    let submitted = false;
    form.addEventListener('submit', (event) => {
      submitted = true;
      event.preventDefault();
    });
    submitForm(form);
    expect(submitted).toBe(true);
  });
});
