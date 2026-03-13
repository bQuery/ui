/**
 * DOM utility helpers for @bquery/ui components.
 */

/** Dispatch a custom event from a host element with bubbles + composed. */
export function dispatch<T = unknown>(
  element: HTMLElement,
  name: string,
  detail?: T,
  options?: Partial<CustomEventInit<T>>,
): boolean {
  const init: CustomEventInit<T> = {
    bubbles: true,
    composed: true,
    cancelable: true,
    ...options,
  };
  // Only set detail when provided to respect exactOptionalPropertyTypes
  if (detail !== undefined) {
    init.detail = detail;
  }
  return element.dispatchEvent(new CustomEvent<T>(name, init));
}

/** Query a slot's assigned elements (flattened). */
export function getSlotted(
  shadow: ShadowRoot,
  slotName?: string,
): Element[] {
  const selector = slotName ? `slot[name="${slotName}"]` : 'slot:not([name])';
  const slot = shadow.querySelector<HTMLSlotElement>(selector);
  return slot ? slot.assignedElements({ flatten: true }) : [];
}

/** Returns true if element is focusable. */
export function isFocusable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if ((el as HTMLElement & { disabled?: boolean }).disabled) return false;
  if (el.getAttribute('tabindex') === '-1') return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  return true;
}

/** Get all focusable descendants within a container. */
export function getFocusableElements(container: Element): HTMLElement[] {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), details > summary',
    ),
  );
  return candidates.filter(isFocusable);
}

/** Trap focus within a container element. Returns a cleanup function. */
export function trapFocus(container: HTMLElement): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
}

/** Generate a unique element ID. */
let _counter = 0;
export function uniqueId(prefix = 'bq'): string {
  return `${prefix}-${++_counter}`;
}
