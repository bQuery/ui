/**
 * ARIA helper utilities for @bquery/ui components.
 */

/** Sets or removes an aria attribute based on a boolean condition. */
export function ariaBoolean(
  el: Element,
  attribute: string,
  value: boolean,
): void {
  if (value) {
    el.setAttribute(attribute, 'true');
  } else {
    el.setAttribute(attribute, 'false');
  }
}

/** Links an element as described-by another element's id. */
export function linkDescribedBy(el: Element, ...ids: string[]): void {
  const existing = el.getAttribute('aria-describedby');
  const existingIds = existing ? existing.split(' ').filter(Boolean) : [];
  const merged = [...new Set([...existingIds, ...ids.filter(Boolean)])];
  if (merged.length > 0) {
    el.setAttribute('aria-describedby', merged.join(' '));
  }
}

/** Remove ids from aria-describedby. */
export function unlinkDescribedBy(el: Element, ...ids: string[]): void {
  const existing = el.getAttribute('aria-describedby');
  if (!existing) return;
  const remaining = existing
    .split(' ')
    .filter((id) => !ids.includes(id))
    .join(' ');
  if (remaining) {
    el.setAttribute('aria-describedby', remaining);
  } else {
    el.removeAttribute('aria-describedby');
  }
}

/** Sets aria-labelledby. */
export function setLabelledBy(el: Element, ...ids: string[]): void {
  const valid = ids.filter(Boolean);
  if (valid.length > 0) {
    el.setAttribute('aria-labelledby', valid.join(' '));
  } else {
    el.removeAttribute('aria-labelledby');
  }
}

/** Announce a message via an ARIA live region. */
export function announce(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite',
): void {
  const existing = document.getElementById('bq-aria-live');
  const el: HTMLElement = (existing as HTMLElement | null) ?? (() => {
    const div = document.createElement('div');
    div.id = 'bq-aria-live';
    div.setAttribute('aria-live', politeness);
    div.setAttribute('aria-relevant', 'additions');
    div.setAttribute('aria-atomic', 'true');
    Object.assign(div.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      overflow: 'hidden',
      clip: 'rect(0,0,0,0)',
      whiteSpace: 'nowrap',
      border: '0',
    });
    document.body.appendChild(div);
    return div;
  })();
  el.setAttribute('aria-live', politeness);
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = message; });
}
