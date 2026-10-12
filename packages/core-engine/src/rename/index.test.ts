import { describe, expect, it } from 'vitest';

import { rename, renameBatch } from './index.js';
import { InvalidPatternError, InvalidTemplateError, UnsafeRegexError } from './errors.js';

describe('rename — single asset', () => {
  it('returns the original name with extension when pattern is empty', () => {
    const result = rename({ name: 'Hero', extension: 'png', index: 1 }, {});
    expect(result.original).toBe('Hero.png');
    expect(result.renamed).toBe('Hero.png');
    expect(result.operations).toEqual([]);
  });

  it('applies casing then template', () => {
    const result = rename(
      { name: 'HelloWorld', extension: 'svg', index: 1 },
      { casing: 'kebab', template: '{name}' },
    );
    expect(result.renamed).toBe('hello-world.svg');
  });

  it('applies sanitize then regex then casing in order', () => {
    const result = rename(
      { name: 'Hello   World', extension: 'png', index: 1 },
      {
        sanitize: true,
        regex: { pattern: 'world', flags: 'i', replacement: 'planet' },
        casing: 'snake',
      },
    );
    expect(result.renamed).toBe('hello_planet.png');
    expect(result.operations).toContain('sanitize');
    expect(result.operations).toContain('regex');
    expect(result.operations).toContain('casing');
  });

  it('applies placeholders for {index} zero-padded', () => {
    const result = rename(
      { name: 'icon', extension: 'webp', index: 7 },
      { indexPadding: 4, template: '{name}-{index:04}.{ext}' },
    );
    expect(result.renamed).toBe('icon-0007.webp');
  });

  it('applies prefix and suffix', () => {
    const result = rename(
      { name: 'avatar', extension: 'png', index: 1 },
      { prefix: 'pre-', suffix: '-suf' },
    );
    expect(result.renamed).toBe('pre-avatar-suf.png');
  });

  it('overrides the extension when replaceExtension is set', () => {
    const result = rename(
      { name: 'photo', extension: 'png', index: 1 },
      { replaceExtension: 'webp' },
    );
    expect(result.renamed).toBe('photo.webp');
  });

  it('propagates UnsafeRegexError when the regex is unsafe', () => {
    expect(() =>
      rename(
        { name: 'foo', extension: 'png', index: 1 },
        { regex: { pattern: '^(a+)+$', replacement: 'x' } },
      ),
    ).toThrow(UnsafeRegexError);
  });

  it('propagates InvalidPatternError on a bogus casing', () => {
    // Cast through unknown to bypass the typed surface for the test.
    expect(() =>
      rename(
        { name: 'foo', extension: 'png', index: 1 },
        // biome-ignore lint: deliberately invalid input
        { casing: 'weird' as never },
      ),
    ).toThrow(InvalidPatternError);
  });

  it('propagates InvalidTemplateError on an unknown placeholder', () => {
    expect(() =>
      rename({ name: 'foo', extension: 'png', index: 1 }, { template: '{nope}' }),
    ).toThrow(InvalidTemplateError);
  });

  it('renders {width}x{height} when metadata is present', () => {
    const result = rename(
      { name: 'sprite', extension: 'png', index: 1, width: 1024, height: 768 },
      { template: '{name}-{width}x{height}.{ext}' },
    );
    expect(result.renamed).toBe('sprite-1024x768.png');
  });
});

describe('renameBatch — deterministic ordering', () => {
  it('produces one result per input, in order', () => {
    const assets = [
      { name: 'one', extension: 'png', index: 1 },
      { name: 'two', extension: 'png', index: 2 },
      { name: 'three', extension: 'png', index: 3 },
    ];
    const results = renameBatch(assets, { template: '{name}-{index:03}' });
    expect(results.map((r) => r.renamed)).toEqual(['one-001.png', 'two-002.png', 'three-003.png']);
  });

  it('handles empty input gracefully', () => {
    expect(renameBatch([], {})).toEqual([]);
  });

  it('preserves index even when sanitization rewrites the name', () => {
    const assets = [
      { name: 'Foo\u0000', extension: 'png', index: 5 },
      { name: 'Bar', extension: 'png', index: 6 },
    ];
    const results = renameBatch(assets, {
      sanitize: true,
      template: '{name}-{index:02}',
    });
    expect(results[0]?.renamed).toBe('Foo-05.png');
    expect(results[1]?.renamed).toBe('Bar-06.png');
  });
});

describe('renameBatch — 50 000-item benchmark', () => {
  // Performance budget is 300 ms without instrumentation.  v8 coverage
  // adds ~30-50% wall-clock overhead to every iteration.  We pick the
  // budget from a CLI flag so CI can run the strict target and developers
  // running `pnpm test` (which uses coverage by default) get a relaxed
  // budget.  Run `pnpm bench:rename` to exercise the strict 300 ms gate.
  const strict =
    process.argv.includes('--rename-perf') || process.env.RENAME_STRICT_BENCH === 'true';
  const BUDGET_MS = strict ? 300 : 1_000;

  it('processes 50 000 items in under 300 ms (no coverage) / scaled budget', () => {
    const N = 50_000;
    const assets = Array.from({ length: N }, (_, i) => ({
      name: `Hero_Icon_${i.toString(36)}`,
      extension: 'png',
      index: i + 1,
      width: 1024,
      height: 768,
    }));
    const pattern = {
      casing: 'kebab' as const,
      sanitize: true,
      template: '{name}-{width}x{height}-{index:05}.{ext}',
    };

    // Warm-up to keep V8 from measuring JIT compilation.
    renameBatch(assets.slice(0, 1_000), pattern);

    const start = Date.now();
    const results = renameBatch(assets, pattern);
    const elapsed = Date.now() - start;

    expect(results).toHaveLength(N);
    // Pin the very first and last so accidental off-by-ones fail.
    expect(results[0]?.renamed).toBe('hero-icon-0-1024x768-00001.png');
    expect(results[N - 1]?.renamed).toBe(
      `hero-icon-${(N - 1).toString(36)}-1024x768-${N.toString().padStart(5, '0')}.png`,
    );

    expect(elapsed).toBeLessThan(BUDGET_MS);
  }, 10_000); // generous vitest timeout — the wall-clock assertion is the real gate
});
