/**
 * Installs the document-level half of the theme.
 *
 * Components carry their own tokens, so nothing here is needed for them to
 * render correctly. What it adds is the ability to *switch* them from outside
 * the shadow boundary: the rules below define the `--bq-scheme-*` channel that
 * every component resolves its semantic tokens through, keyed off `data-theme`.
 *
 * Installation is automatic — importing any component pulls in the shared
 * stylesheet module, which calls {@link installThemeStyles} once per document.
 * The rules are inert until something in the page actually carries
 * `data-theme`, so an application that never opts in is unaffected.
 */
import { getSchemeRootCSS } from './scheme.js';

const MARKER = 'bq-theme-root';

const installed = new WeakSet<Document>();

type AdoptingDocument = Document & {
  adoptedStyleSheets?: CSSStyleSheet[];
};

/**
 * Adds the theme stylesheet to a document, once.
 *
 * Prefers a constructed stylesheet: it needs no `<style>` element, so it works
 * under a Content-Security-Policy that forbids inline styles, and it cannot be
 * knocked out by a framework that re-renders `<head>`.
 *
 * @param doc - Target document; defaults to the ambient one. Pass a document
 *   explicitly when rendering into an iframe or a popup window.
 * @returns whether the stylesheet is now present.
 */
export function installThemeStyles(doc?: Document): boolean {
  const target = doc ?? (typeof document === 'undefined' ? null : document);
  if (!target) return false;
  if (installed.has(target)) return true;

  const css = getSchemeRootCSS();
  const adopting = target as AdoptingDocument;

  if (
    typeof CSSStyleSheet === 'function' &&
    Array.isArray(adopting.adoptedStyleSheets)
  ) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      adopting.adoptedStyleSheets = [...adopting.adoptedStyleSheets, sheet];
      installed.add(target);
      return true;
    } catch {
      /* Constructable stylesheets unavailable — fall through to <style>. */
    }
  }

  const head = target.head ?? target.documentElement;
  if (!head) return false;
  if (target.querySelector(`style[data-${MARKER}]`)) {
    installed.add(target);
    return true;
  }

  const style = target.createElement('style');
  style.setAttribute(`data-${MARKER}`, '');
  style.textContent = css;
  head.prepend(style);
  installed.add(target);
  return true;
}
