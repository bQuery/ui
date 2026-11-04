/**
 * Native-style `value` / `checked` properties and `input` / `change` events
 * for the form components.
 *
 * bQuery components keep their state in attributes and report changes with
 * `bq-input` / `bq-change`. Two-way bindings — bQuery's `bq-model`, Vue's
 * `v-model`, Alpine's `x-model`, plain `el.value` — expect what a native
 * control offers instead: a `value` (or `checked`) property and `input` /
 * `change` events on the element itself. {@link defineFormControl} adds both
 * to a registered component:
 *
 * - `value` reads and writes the `value` attribute (`checked` the `checked`
 *   attribute). Setting a property never fires an event, as on a native
 *   control.
 * - Every user change fires a bubbling, composed `input` event on the host,
 *   and every committed change a `change` event, after the component's own
 *   `bq-input` / `bq-change`. A native `input` event that already leaves the
 *   shadow root for the same keystroke is not duplicated.
 * - `type` is `'checkbox'` or `'radio'` for the checkable controls, which is
 *   how `bq-model` tells them apart.
 *
 * @module
 */

type Checkable = 'checkbox' | 'radio';

export interface FormControlOptions {
  /**
   * `'checkbox'` / `'radio'` adds `checked` and a read-only `type`; the
   * default `'value'` adds only `value`.
   */
  kind?: 'value' | Checkable;
  /** What `value` returns when the attribute is absent. @default '' */
  defaultValue?: string;
  /**
   * Reads the live value, for a component whose attribute lags behind what
   * the user typed (e.g. a number field that only commits on change).
   * Return `null` to fall back to the attribute.
   */
  live?: (host: HTMLElement) => string | null;
}

const installed = Symbol.for('bquery-ui.formControl');
const wired = new WeakSet<HTMLElement>();

/** A control's state, compared to decide whether a change was reported. */
function snapshot(el: HTMLElement): string {
  const type = (el as unknown as { type?: unknown }).type;
  return type === 'checkbox' || type === 'radio'
    ? String(el.hasAttribute('checked'))
    : String((el as unknown as { value?: unknown }).value);
}

function wire(el: HTMLElement): void {
  if (wired.has(el)) return;
  wired.add(el);

  // Native `input` events are composed: one dispatched inside the shadow root
  // (typing in the inner field) reaches the host on its own. It is still in
  // flight when the component's `bq-input` fires, so it is noted here, in
  // the capture phase, before the component's handlers run.
  // The check reads the event's phase rather than resetting a flag later: a
  // microtask would already run between two listeners of a user event.
  let native: Event | null = null;
  const nativeInFlight = () =>
    native !== null && native.eventPhase !== Event.NONE && !native.cancelBubble;
  el.shadowRoot?.addEventListener(
    'input',
    (event) => {
      if (event.composed) native = event;
    },
    true,
  );

  // What the last `input` event on the host reported, so a `bq-change` that
  // was not preceded by one (a click on a checkbox, a step button, a picked
  // date) still produces `input` before `change`.
  let reported = snapshot(el);
  el.addEventListener('input', (event) => {
    if (event.target !== el) return;
    native = null;
    reported = snapshot(el);
  });

  const fire = (type: 'input' | 'change') =>
    el.dispatchEvent(new Event(type, { bubbles: true, composed: true }));

  el.addEventListener('bq-input', (event) => {
    if (event.target !== el || nativeInFlight()) return;
    fire('input');
  });
  el.addEventListener('bq-change', (event) => {
    if (event.target !== el) return;
    if (snapshot(el) !== reported) fire('input');
    fire('change');
  });
}

const MODEL_PROPS = ['value', 'checked'] as const;

/**
 * Wraps a component definition so each instance fires native `input` /
 * `change` events. Pass the result to `component()`, then call
 * {@link defineFormControl} for the properties:
 *
 * ```ts
 * component('bq-switch', formControl(definition));
 * defineFormControl('bq-switch', { kind: 'checkbox' });
 * ```
 *
 * The hook has to be part of the definition: the platform reads an element's
 * lifecycle callbacks once, when the element is defined.
 */
export function formControl<T extends object>(definition: T): T {
  const connected = (definition as { connected?: (this: HTMLElement) => void }).connected;
  return {
    ...definition,
    connected(this: HTMLElement) {
      // A property set before the element upgraded is an own data property
      // that shadows the accessor; re-apply it through the setter.
      for (const prop of MODEL_PROPS) {
        if (Object.prototype.hasOwnProperty.call(this, prop)) {
          const record = this as unknown as Record<string, unknown>;
          const pending = record[prop];
          delete record[prop];
          record[prop] = pending;
        }
      }
      wire(this);
      connected?.call(this);
    },
  };
}

/**
 * Adds `value` (and, for checkable controls, `checked` and `type`) to the
 * registered element `tag`. Safe to call more than once.
 */
export function defineFormControl(tag: string, options: FormControlOptions = {}): void {
  const ctor = customElements.get(tag);
  if (!ctor) return;
  const proto = ctor.prototype as HTMLElement & { [installed]?: true };
  if (proto[installed]) return;
  Object.defineProperty(proto, installed, { value: true });

  const kind = options.kind ?? 'value';
  const fallback = options.defaultValue ?? '';

  Object.defineProperty(proto, 'value', {
    configurable: true,
    enumerable: true,
    get(this: HTMLElement): string {
      const live = options.live?.(this);
      if (live != null) return live;
      return this.getAttribute('value') ?? fallback;
    },
    set(this: HTMLElement, next: unknown) {
      this.setAttribute('value', next == null ? '' : String(next));
    },
  });

  if (kind !== 'value') {
    Object.defineProperty(proto, 'checked', {
      configurable: true,
      enumerable: true,
      get(this: HTMLElement): boolean {
        return this.hasAttribute('checked');
      },
      set(this: HTMLElement, next: unknown) {
        this.toggleAttribute('checked', Boolean(next));
      },
    });
    Object.defineProperty(proto, 'type', {
      configurable: true,
      enumerable: true,
      get: () => kind,
    });
  }
}

/**
 * A {@link FormControlOptions.live} reader for the shadow field matching
 * `selector`, ignoring it while empty.
 */
export function liveField(selector: string): (host: HTMLElement) => string | null {
  return (host) => {
    const field = host.shadowRoot?.querySelector(selector) as HTMLInputElement | null;
    return field && field.value !== '' ? field.value : null;
  };
}
