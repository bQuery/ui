/**
 * DOM utility helpers for @bquery/ui components.
 */

/** Dispatch a custom event from a host element with bubbles + composed. */
export function dispatch<T = unknown>(
  element: HTMLElement,
  name: string,
  detail?: T,
  options?: Partial<CustomEventInit<T>>
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
export function getSlotted(shadow: ShadowRoot, slotName?: string): Element[] {
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
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), details > summary'
    )
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

function parseTimeValueToMs(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed);
  if (trimmed.endsWith('s')) return Number.parseFloat(trimmed) * 1000;
  return Number.parseFloat(trimmed) || 0;
}

export function getAnimationTimeoutMs(
  el: Element,
  fallbackDuration = '0ms'
): number {
  const fallbackMs = parseTimeValueToMs(fallbackDuration);
  const view = el.ownerDocument.defaultView;
  if (!view?.getComputedStyle) return fallbackMs;

  const styles = view.getComputedStyle(el);
  const animationDuration = styles.animationDuration || '';
  const animationDelay = styles.animationDelay || '';
  const animationName = styles.animationName || '';
  const durationValues = animationDuration.split(',');
  const delayValues = animationDelay.split(',');
  const hasTimingValues =
    durationValues.some((value) => value.trim() !== '') ||
    delayValues.some((value) => value.trim() !== '');
  const hasRealAnimationName = animationName.split(',').some((name) => {
    const trimmed = name.trim();
    return trimmed !== '' && trimmed !== 'none';
  });

  if (!hasTimingValues) return fallbackMs;

  const durations = durationValues.map((value) => parseTimeValueToMs(value));
  const delays = delayValues.map((value) => parseTimeValueToMs(value));
  const count = Math.max(durations.length, delays.length);

  let longest = 0;
  for (let i = 0; i < count; i += 1) {
    const duration = durations[i] ?? durations[durations.length - 1] ?? 0;
    const delay = delays[i] ?? delays[delays.length - 1] ?? 0;
    longest = Math.max(longest, duration + delay);
  }

  return longest > 0 || hasRealAnimationName ? longest : fallbackMs;
}

/**
 * Manages focus trapping, initial focus, and focus restoration for overlay
 * components (Dialog, Drawer). Call from `updated()`.
 */
export interface OverlayFocusState {
  _wasOpen?: boolean;
  _previousFocus?: HTMLElement | null;
  _focusRaf?: number;
  _releaseFocus?: () => void;
}

export function updateOverlayFocus(
  host: HTMLElement,
  state: OverlayFocusState,
  panelSelector: string
): void {
  const wasOpen = state._wasOpen === true;
  const isOpen = host.hasAttribute('open');

  if (isOpen && !wasOpen) {
    state._wasOpen = true;
    if (!state._previousFocus) {
      state._previousFocus = document.activeElement as HTMLElement | null;
    }
    const panel = host.shadowRoot?.querySelector(
      panelSelector
    ) as HTMLElement | null;
    if (panel) {
      state._releaseFocus?.();
      state._releaseFocus = trapFocus(panel);
      if (state._focusRaf !== undefined) cancelAnimationFrame(state._focusRaf);
      state._focusRaf = requestAnimationFrame(() => {
        delete state._focusRaf;
        if (!host.hasAttribute('open') || !host.isConnected) return;
        const focusable = panel.querySelector<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        (focusable ?? panel).focus();
      });
    }
  } else if (!isOpen && wasOpen) {
    state._wasOpen = false;
    if (state._focusRaf !== undefined) cancelAnimationFrame(state._focusRaf);
    delete state._focusRaf;
    state._releaseFocus?.();
    delete state._releaseFocus;
    const prev = state._previousFocus;
    if (prev && typeof prev.focus === 'function') {
      prev.focus();
    }
    delete state._previousFocus;
  } else if (!isOpen) {
    state._wasOpen = false;
  }
}

export function cleanupOverlayFocus(state: OverlayFocusState): void {
  if (state._focusRaf !== undefined) cancelAnimationFrame(state._focusRaf);
  state._releaseFocus?.();
  const prev = state._previousFocus;
  if (prev && typeof prev.focus === 'function') prev.focus();
  delete state._previousFocus;
  delete state._wasOpen;
  delete state._focusRaf;
  delete state._releaseFocus;
}
