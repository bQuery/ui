/**
 * Focus and caret preservation across re-renders.
 *
 * The component runtime renders by assigning `shadowRoot.innerHTML`, which
 * discards every node in the shadow tree and builds new ones. For a purely
 * presentational component that is invisible. For a component containing a
 * focused text field it is not: the focused node is destroyed, focus falls
 * back to the document body, and the caret position is gone.
 *
 * Concretely, a control that reflects its value to an attribute on every
 * keystroke re-renders on every keystroke, so the user can type exactly one
 * character before losing the field.
 *
 * These helpers bracket a render — capture in `beforeUpdate()`, restore in
 * `updated()` — and put focus and selection back on the node that replaced
 * the one the user was in.
 *
 * ```ts
 * beforeUpdate() { focusStore(this).snapshot = captureFocus(this.shadowRoot); },
 * updated() { restoreFocus(this.shadowRoot, focusStore(this).snapshot); },
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
 * Derives a selector that will match the equivalent node after a re-render.
 *
 * `part` first: it is this library's convention for naming the meaningful
 * elements of a shadow tree, it is stable across renders, and it is unique
 * per component. Falls back to `id`, then to a tag/class shape.
 */
function describeElement(el: Element): string | null {
  const part = el.getAttribute('part');
  if (part) {
    const first = part.trim().split(/\s+/)[0];
    if (first) return `[part~="${cssEscape(first)}"]`;
  }
  const id = el.getAttribute('id');
  if (id) return `[id="${cssEscape(id)}"]`;

  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList);
  if (classes.length > 0) {
    return `${tag}.${classes.map((c) => CSS_ESCAPE(c)).join('.')}`;
  }
  return tag;
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
