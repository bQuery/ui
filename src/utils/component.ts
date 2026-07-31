/**
 * Lifecycle helpers for @bquery/ui components.
 *
 * Components repeatedly stashed listener references on the host element
 * (`self['_keyHandler'] = ...`) in `connected()` and unwound them by hand in
 * `disconnected()`. That pattern is verbose and easy to get wrong — every new
 * listener needs a matching, correctly-typed removal, and a forgotten one is a
 * leak that survives the element.
 *
 * `bind()` gives a component a disposer scope instead: register teardown at
 * the same place the resource is created, then `release()` unwinds everything
 * in one call.
 *
 * ```ts
 * connected() {
 *   const el = host(this);
 *   const scope = bind(el);
 *   scope.on(document, 'keydown', onKeyDown);
 *   scope.on(el.shadowRoot, 'click', onClick);
 * },
 * disconnected() {
 *   release(this);
 * },
 * ```
 */
import type { ComponentElement } from '@bquery/bquery/component';

/** A teardown function registered on a component scope. */
export type Disposer = () => void;

/**
 * Typed view of `this` inside a component lifecycle hook.
 *
 * The `ComponentDefinition` hooks are declared with overloads (`(this: ...)`
 * and `()`), so TypeScript contextually types `this` as the bare signature.
 * This helper restores the `setState`/`getState`/`setProp` surface without
 * each component redeclaring its own local cast type.
 */
export function host<
  TState extends Record<string, unknown> | undefined = undefined,
>(ctx: unknown): ComponentElement<TState> {
  return ctx as ComponentElement<TState>;
}

const stores = new WeakMap<object, object>();

/**
 * Per-instance mutable store, created on first access.
 *
 * Replaces stashing loose `_foo` properties on the host element when a value
 * created in `connected()` has to stay reachable from `updated()` or a later
 * hook. The store is typed, invisible to consumers of the element, and
 * garbage-collected with the instance.
 */
export function store<T extends object>(owner: object, init: () => T): T {
  const existing = stores.get(owner);
  if (existing) return existing as T;
  const created = init();
  stores.set(owner, created);
  return created;
}

/** Disposer scope attached to a single component instance. */
export interface ComponentScope {
  /**
   * Adds an event listener and registers its removal.
   * A nullish target is ignored, so optional shadow-root queries can be
   * passed directly. Returns a disposer that also deregisters itself.
   */
  on(
    target: EventTarget | null | undefined,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions | boolean,
  ): Disposer;
  /** Registers an arbitrary teardown function. Returns a self-deregistering disposer. */
  add(dispose: Disposer): Disposer;
  /** `setTimeout` whose pending timer is cleared on release. */
  timeout(handler: () => void, ms: number): Disposer;
  /** `requestAnimationFrame` whose pending frame is cancelled on release. */
  frame(handler: () => void): Disposer;
  /** Runs every registered disposer and empties the scope. */
  dispose(): void;
}

const scopes = new WeakMap<object, Set<Disposer>>();

function scopeSet(owner: object): Set<Disposer> {
  let set = scopes.get(owner);
  if (!set) {
    set = new Set<Disposer>();
    scopes.set(owner, set);
  }
  return set;
}

/**
 * Returns the disposer scope for a component instance, creating it on first
 * use. Calling `bind()` twice returns a scope backed by the same registry, so
 * it is safe to call from any hook.
 */
export function bind(owner: object): ComponentScope {
  const set = scopeSet(owner);

  const add = (dispose: Disposer): Disposer => {
    set.add(dispose);
    return () => {
      if (!set.delete(dispose)) return;
      dispose();
    };
  };

  return {
    add,
    on(target, type, handler, options) {
      if (!target) return () => {};
      target.addEventListener(type, handler, options);
      return add(() => target.removeEventListener(type, handler, options));
    },
    timeout(handler, ms) {
      let done = false;
      const id = setTimeout(() => {
        done = true;
        remove();
        handler();
      }, ms);
      const remove = add(() => {
        if (!done) clearTimeout(id);
      });
      return remove;
    },
    frame(handler) {
      let done = false;
      const id = requestAnimationFrame(() => {
        done = true;
        remove();
        handler();
      });
      const remove = add(() => {
        if (!done) cancelAnimationFrame(id);
      });
      return remove;
    },
    dispose() {
      // Snapshot first: a disposer may register or remove others while running.
      const pending = Array.from(set);
      set.clear();
      for (const dispose of pending) {
        try {
          dispose();
        } catch {
          /* teardown must never block the rest of the unwind */
        }
      }
    },
  };
}

/**
 * Runs every teardown registered on the component instance. Safe to call for
 * an element that never created a scope, and safe to call repeatedly.
 */
export function release(owner: object): void {
  const set = scopes.get(owner);
  if (!set || set.size === 0) return;
  bind(owner).dispose();
}
