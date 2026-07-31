import { beforeAll, describe, expect, it } from 'bun:test';
import { bind, host, release, store } from '../src/utils/component.js';
import { waitForFrame } from './helpers.js';

const win = (globalThis as unknown as Record<string, unknown>)[
  'window'
] as Window & typeof globalThis;
const doc = win.document as unknown as Document;

describe('component scope', () => {
  it('removes listeners registered through the scope on release', () => {
    const owner = {};
    const target = doc.createElement('div');
    let calls = 0;
    bind(owner).on(target, 'click', () => {
      calls += 1;
    });

    target.dispatchEvent(new win.Event('click'));
    expect(calls).toBe(1);

    release(owner);
    target.dispatchEvent(new win.Event('click'));
    expect(calls).toBe(1);
  });

  it('ignores a nullish listener target', () => {
    const owner = {};
    expect(() => bind(owner).on(null, 'click', () => {})).not.toThrow();
    expect(() => bind(owner).on(undefined, 'click', () => {})).not.toThrow();
    release(owner);
  });

  it('runs registered disposers exactly once', () => {
    const owner = {};
    let disposed = 0;
    bind(owner).add(() => {
      disposed += 1;
    });

    release(owner);
    release(owner);
    expect(disposed).toBe(1);
  });

  it('lets a returned disposer deregister itself early', () => {
    const owner = {};
    let disposed = 0;
    const dispose = bind(owner).add(() => {
      disposed += 1;
    });

    dispose();
    expect(disposed).toBe(1);
    release(owner);
    expect(disposed).toBe(1);
  });

  it('keeps unwinding after a disposer throws', () => {
    const owner = {};
    const scope = bind(owner);
    let reached = false;
    scope.add(() => {
      throw new Error('boom');
    });
    scope.add(() => {
      reached = true;
    });

    expect(() => release(owner)).not.toThrow();
    expect(reached).toBe(true);
  });

  it('cancels pending timeouts on release', async () => {
    const owner = {};
    let fired = false;
    bind(owner).timeout(() => {
      fired = true;
    }, 1);

    release(owner);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fired).toBe(false);
  });

  it('cancels pending frames on release', async () => {
    const owner = {};
    let fired = false;
    bind(owner).frame(() => {
      fired = true;
    });

    release(owner);
    await waitForFrame(2);
    expect(fired).toBe(false);
  });

  it('drops a fired timeout from the scope so release stays cheap', async () => {
    const owner = {};
    let fired = false;
    bind(owner).timeout(() => {
      fired = true;
    }, 1);

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fired).toBe(true);
    expect(() => release(owner)).not.toThrow();
  });

  it('is safe to release an owner that never bound a scope', () => {
    expect(() => release({})).not.toThrow();
  });
});

describe('component store', () => {
  it('returns a stable per-owner record', () => {
    const owner = {};
    const first = store<{ n: number }>(owner, () => ({ n: 1 }));
    first.n = 5;
    const second = store<{ n: number }>(owner, () => ({ n: 1 }));
    expect(second).toBe(first);
    expect(second.n).toBe(5);
  });

  it('keeps separate owners isolated', () => {
    const a = store<{ n: number }>({}, () => ({ n: 1 }));
    const b = store<{ n: number }>({}, () => ({ n: 1 }));
    a.n = 9;
    expect(b.n).toBe(1);
  });
});

describe('host()', () => {
  it('exposes the component element state API', async () => {
    await import('../src/components/tooltip/index.js');
    const el = doc.createElement('bq-tooltip');
    doc.body.appendChild(el);
    expect(typeof host(el).getState).toBe('function');
    expect(typeof host(el).setState).toBe('function');
    el.remove();
  });
});

describe('overlay teardown', () => {
  beforeAll(async () => {
    await import('../src/components/dialog/index.js');
    await import('../src/components/drawer/index.js');
    await import('../src/components/dropdown-menu/index.js');
    await import('../src/components/tooltip/index.js');
  });

  // These components attach keydown/click listeners to `document`, which
  // outlives the element. A missed removal keeps the whole element alive.
  for (const tag of [
    'bq-dialog',
    'bq-drawer',
    'bq-dropdown-menu',
    'bq-tooltip',
  ]) {
    it(`${tag} removes its document listeners when disconnected`, async () => {
      const added: string[] = [];
      const removed: string[] = [];
      const realAdd = doc.addEventListener.bind(doc);
      const realRemove = doc.removeEventListener.bind(doc);
      doc.addEventListener = ((type: string, ...rest: unknown[]) => {
        added.push(type);
        return (realAdd as (...a: unknown[]) => void)(type, ...rest);
      }) as typeof doc.addEventListener;
      doc.removeEventListener = ((type: string, ...rest: unknown[]) => {
        removed.push(type);
        return (realRemove as (...a: unknown[]) => void)(type, ...rest);
      }) as typeof doc.removeEventListener;

      try {
        const el = doc.createElement(tag);
        if (tag === 'bq-dropdown-menu') el.setAttribute('open', '');
        doc.body.appendChild(el);
        await waitForFrame(2);
        el.remove();
        await waitForFrame();

        for (const type of new Set(added)) {
          expect(removed).toContain(type);
        }
      } finally {
        doc.addEventListener = realAdd;
        doc.removeEventListener = realRemove;
      }
    });
  }
});
