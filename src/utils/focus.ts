/**
 * Focus and caret preservation across re-renders.
 *
 * bQuery 1.15–1.17 render by assigning `shadowRoot.innerHTML`, which
 * discards every node in the shadow tree and builds new ones. For a purely
 * presentational component that is invisible. For a component containing a
 * focused text field it is not: the focused node is destroyed, focus falls
 * back to the document body, and the caret position is gone.
 *
 * bQuery 1.18 morphs the existing tree instead, so the focused node usually
 * survives and these helpers find focus still in place and do nothing. They
 * stay because the peer range still includes the replacing releases, and
 * because a morph can still recreate a node whose tag changes.
 *
 * Concretely, a control that reflects its value to an attribute on every
 * keystroke re-renders on every keystroke, so the user can type exactly one
 * character before losing the field.
 *
 * These helpers bracket a render and put focus and selection back on the node
 * that replaced the one the user was in. Most components want the packaged
 * form — {@link trackFocus} plus {@link restorePreservedFocus} — rather than
 * the {@link captureFocus} / {@link restoreFocus} primitives underneath it:
 *
 * ```ts
 * connected()    { trackFocus(host(this), bind(this)); },
 * beforeUpdate() { markFocus(this); },
 * updated()      { restorePreservedFocus(this); },
 * ```
 */

/** Where focus and the text selection were before a render. */
export interface FocusSnapshot {
  /** Selector that re-finds the equivalent node in the new shadow tree. */
  selector: string;
  /** Caret/selection start, for text-entry elements. */
  selectionStart: number | null;
  /** Caret/selection end, for text-entry elements. */
  selectionEnd: number | null;
  /** Selection direction, for text-entry elements. */
  selectionDirection: 'forward' | 'backward' | 'none' | null;
}

/** Elements whose selection range is worth preserving. */
function isTextEntry(
  el: Element
): el is HTMLInputElement | HTMLTextAreaElement {
  const tag = el.tagName;
  if (tag === 'TEXTAREA') return true;
  if (tag !== 'INPUT') return false;
  // `selectionStart` throws on input types that have no text selection
  // (number, email, checkbox, …), so only the text-like ones qualify.
  const type = (el as HTMLInputElement).type;
  return (
    type === 'text' ||
    type === 'search' ||
    type === 'url' ||
    type === 'tel' ||
    type === 'password'
  );
}

function cssEscape(value: string): string {
  // Attribute values go inside a quoted selector, so only the quote and
  // backslash need escaping.
  return value.replace(/["\\]/g, '\\$&');
}

/**
 * Attributes that tell two otherwise identical nodes apart.
 *
 * A shadow tree usually contains several elements sharing one `part` — every
 * page button in a pagination bar, every remove button in a tag list. Matching
 * on `part` alone would put focus back on the first of them, so the selector
 * also pins whichever of these the element carries.
 */
const DISCRIMINATORS = ['data-value', 'data-index', 'data-page', 'name'];

function discriminatorSelector(el: Element): string {
  for (const attribute of DISCRIMINATORS) {
    const value = el.getAttribute(attribute);
    if (value !== null) return `[${attribute}="${cssEscape(value)}"]`;
  }
  return '';
}

/**
 * Derives a selector that will match the equivalent node after a re-render.
 *
 * `id` first: components in this library derive ids from a per-instance uid,
 * so an id is both stable across renders and unique within the shadow tree.
 * Falls back to `part` — the convention for naming the meaningful elements of
 * a shadow tree — and then to a tag/class shape, in both cases narrowed by a
 * {@link DISCRIMINATORS} attribute when the element carries one.
 */
function describeElement(el: Element): string | null {
  const id = el.getAttribute('id');
  if (id) return `[id="${cssEscape(id)}"]`;

  const extra = discriminatorSelector(el);

  const part = el.getAttribute('part');
  if (part) {
    const first = part.trim().split(/\s+/)[0];
    if (first) return `[part~="${cssEscape(first)}"]${extra}`;
  }

  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList);
  if (classes.length > 0) {
    return `${tag}.${classes.map((c) => CSS_ESCAPE(c)).join('.')}${extra}`;
  }
  return `${tag}${extra}`;
}

// Class names may contain characters that are invalid bare in a selector.
function CSS_ESCAPE(value: string): string {
  return value.replace(/[^\w-]/g, (ch) => `\\${ch}`);
}

/**
 * Records the focused element inside a shadow root, if any.
 * Returns `null` when nothing in the tree holds focus, which is the common
 * case and costs a single property read.
 */
export function captureFocus(root: ShadowRoot | null): FocusSnapshot | null {
  const active = root?.activeElement as HTMLElement | null;
  if (!active) return null;

  const selector = describeElement(active);
  if (!selector) return null;

  const snapshot: FocusSnapshot = {
    selector,
    selectionStart: null,
    selectionEnd: null,
    selectionDirection: null,
  };

  if (isTextEntry(active)) {
    try {
      snapshot.selectionStart = active.selectionStart;
      snapshot.selectionEnd = active.selectionEnd;
      snapshot.selectionDirection = active.selectionDirection ?? null;
    } catch {
      /* selection unavailable for this input type — focus alone is enough */
    }
  }

  return snapshot;
}

/**
 * Restores a snapshot taken by {@link captureFocus}.
 *
 * Does nothing when something in the tree already has focus: that means the
 * render did not disturb it, or the user has moved on, and stealing focus back
 * would be worse than leaving it.
 *
 * @returns whether focus was actually restored.
 */
export function restoreFocus(
  root: ShadowRoot | null,
  snapshot: FocusSnapshot | null | undefined
): boolean {
  if (!root || !snapshot) return false;
  if (root.activeElement) return false;

  let next: HTMLElement | null = null;
  try {
    next = root.querySelector<HTMLElement>(snapshot.selector);
  } catch {
    return false;
  }
  if (!next || typeof next.focus !== 'function') return false;

  next.focus();

  if (snapshot.selectionStart !== null && isTextEntry(next)) {
    try {
      next.setSelectionRange(
        snapshot.selectionStart,
        snapshot.selectionEnd ?? snapshot.selectionStart,
        snapshot.selectionDirection ?? undefined
      );
    } catch {
      /* caret restore is best-effort */
    }
  }

  return true;
}

// ─── Element-keyed convenience layer ─────────────────────────────────────────

/**
 * `beforeUpdate()` only runs for attribute-driven renders. A component that
 * keeps draft text in component *state* re-renders through `setState`, which
 * skips that hook entirely — so those components record the focus position
 * from the event that is about to change state instead. See {@link trackFocus}.
 */
const pendingSnapshots = new WeakMap<object, FocusSnapshot | null>();
const scheduledClears = new WeakSet<object>();

function scheduleClear(el: HTMLElement): void {
  if (scheduledClears.has(el)) return;
  scheduledClears.add(el);
  const clear = () => {
    scheduledClears.delete(el);
    pendingSnapshots.delete(el);
  };
  if (typeof queueMicrotask === 'function') queueMicrotask(clear);
  else Promise.resolve().then(clear);
}

/**
 * Records where focus is, to be restored by the next
 * {@link restorePreservedFocus} call.
 *
 * The snapshot expires at the end of the current task. That is the whole
 * guarantee: a render caused by whatever is running *now* repairs focus, while
 * an unrelated render minutes later — an attribute set by application code
 * while the user is somewhere else entirely — does not yank focus back.
 */
export function markFocus(el: HTMLElement): void {
  pendingSnapshots.set(el, captureFocus(el.shadowRoot));
  scheduleClear(el);
}

/**
 * Restores the position recorded by {@link markFocus}. Call from `updated()`.
 *
 * The snapshot is deliberately not consumed by the first restore: one event
 * handler often calls `setState` several times, each render destroys the field
 * again, and only the first of them would otherwise be repaired.
 *
 * @returns whether focus was actually restored.
 */
export function restorePreservedFocus(el: HTMLElement): boolean {
  const snapshot = pendingSnapshots.get(el);
  if (snapshot === undefined) return false;
  return restoreFocus(el.shadowRoot, snapshot);
}

/**
 * Events after which the focus position is worth recording.
 *
 * These are the events a component acts on. Listening in the **capture** phase
 * on the shadow root means the snapshot is taken before the component's own
 * (bubble-phase) handler runs, so it describes the tree as the user left it —
 * caret included, since `input` capture already sees the inserted character.
 */
const TRACKED_EVENTS = [
  'focusin',
  'input',
  'keydown',
  'mousedown',
  'click',
  'select',
] as const;

/** Minimal view of the disposer scope from `./component.js`. */
interface FocusScope {
  on(
    target: EventTarget | null | undefined,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions | boolean
  ): unknown;
}

/**
 * Keeps focus and the caret pinned across re-renders, for the whole lifetime
 * of a component.
 *
 * Rendering assigns `shadowRoot.innerHTML`, so every render destroys the node
 * the user is in. Components used to work around that by marking the focus
 * position by hand before each `setState` — easy to forget, and it missed the
 * renders triggered from `focusin`, which is how a field loses focus the very
 * moment it is clicked.
 *
 * One call in `connected()` covers the component instead:
 *
 * ```ts
 * connected() { trackFocus(host(this), bind(this)); },
 * beforeUpdate() { markFocus(this); },
 * updated() { restorePreservedFocus(this); },
 * ```
 */
export function trackFocus(el: HTMLElement, scope: FocusScope): void {
  const root = el.shadowRoot;
  if (!root) return;
  const record: EventListener = () => markFocus(el);
  for (const type of TRACKED_EVENTS) scope.on(root, type, record, true);
}
