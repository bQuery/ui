/**
 * Test environment setup for @bquery/ui.
 *
 * Provides DOM globals via happy-dom so that native Custom Elements and Shadow
 * DOM can be exercised in a Node/Bun process. Loaded via bunfig.toml [test] preload.
 *
 * Key happy-dom 20.x requirement: `SyntaxError` must be patched onto the Window
 * instance so that SelectorParser can construct errors correctly when an invalid
 * CSS selector is encountered. Without this the selector engine throws
 * "undefined is not a constructor (evaluating 'new this.window.SyntaxError(...)')".
 */
import { Window } from 'happy-dom';

// ---------------------------------------------------------------------------
// Create a single shared happy-dom Window for the whole test suite
// ---------------------------------------------------------------------------
const win = new Window();

// happy-dom 20.x: SelectorParser looks up `this.window.SyntaxError`; patch it.
(win as unknown as Record<string, unknown>).SyntaxError = SyntaxError;

// ---------------------------------------------------------------------------
// Expose browser globals on globalThis so that component modules that reference
// window / document / HTMLElement etc. at module evaluation time work correctly.
// ---------------------------------------------------------------------------
const g = globalThis as unknown as Record<string, unknown>;

g['window']            = win;
g['document']          = win.document;
g['Document']          = win.Document;
g['HTMLElement']       = win.HTMLElement;
g['Element']           = win.Element;
g['Node']              = win.Node;
g['NodeFilter']        = win.NodeFilter;
g['ShadowRoot']        = win.ShadowRoot;
g['Event']             = win.Event;
g['CustomEvent']       = win.CustomEvent;
g['MouseEvent']        = (win as unknown as Record<string, unknown>)['MouseEvent'];
g['KeyboardEvent']     = (win as unknown as Record<string, unknown>)['KeyboardEvent'];
g['FocusEvent']        = (win as unknown as Record<string, unknown>)['FocusEvent'];
g['MutationObserver']  = win.MutationObserver;
g['NodeList']          = win.NodeList;
g['customElements']    = win.customElements;
g['DOMParser']         = win.DOMParser;
g['SyntaxError']       = SyntaxError;
g['getComputedStyle']  = win.getComputedStyle.bind(win);

// requestAnimationFrame / cancelAnimationFrame polyfill
g['requestAnimationFrame'] = (cb: FrameRequestCallback): number =>
  setTimeout(() => cb(Date.now()), 16) as unknown as number;
g['cancelAnimationFrame'] = (handle: number): void => clearTimeout(handle);
