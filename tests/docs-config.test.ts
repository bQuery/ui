import { describe, expect, it } from 'bun:test';
import config from '../docs/.vitepress/config.ts';

describe('docs config', () => {
  it('uses the repository base path for GitHub Pages assets', () => {
    expect(config.base).toBe('/ui/');
  });

  it('does not reference a missing docs logo asset', () => {
    expect((config.themeConfig as { logo?: string }).logo).toBeUndefined();
  });
});
