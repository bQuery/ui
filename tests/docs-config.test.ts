import { describe, expect, it } from 'bun:test';
import config, { resolveDocsBase } from '../docs/.vitepress/config.ts';

describe('docs config', () => {
  it('defaults to the site root outside GitHub Pages builds', () => {
    expect(resolveDocsBase({})).toBe('/');
  });

  it('uses the repository base path for GitHub Pages assets in GitHub Actions', () => {
    expect(
      resolveDocsBase({
        GITHUB_ACTIONS: 'true',
        GITHUB_REPOSITORY: 'bQuery/ui',
      })
    ).toBe('/ui/');
  });

  it('allows overriding the docs base explicitly', () => {
    expect(resolveDocsBase({ DOCS_BASE: '/preview/' })).toBe('/preview/');
  });

  it('wires the exported config to the resolved docs base', () => {
    expect(config.base).toBe(resolveDocsBase());
  });

  it('does not reference a missing docs logo asset', () => {
    expect((config.themeConfig as { logo?: string }).logo).toBeUndefined();
  });
});
