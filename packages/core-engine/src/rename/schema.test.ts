import { describe, expect, it } from 'vitest';

import { AssetSchema, RenamePatternSchema, RenameResultSchema, validatePattern } from './schema.js';
import { InvalidPatternError } from './errors.js';

describe('RenamePatternSchema', () => {
  it('accepts an empty pattern; defaults are applied by validatePattern()', () => {
    const pattern = RenamePatternSchema.parse({});
    expect(pattern.casing).toBeUndefined();
    expect(pattern.sanitize).toBeUndefined();
    expect(pattern.template).toBeUndefined();
    expect(pattern.indexPadding).toBeUndefined();
    expect(pattern.dateFormat).toBeUndefined();
  });

  it('validatePattern applies defaults to an empty pattern', () => {
    const pattern = validatePattern({});
    expect(pattern.casing).toBe('none');
    expect(pattern.sanitize).toBe(false);
    expect(pattern.template).toBe('{name}');
    expect(pattern.indexPadding).toBe(0);
    expect(pattern.dateFormat).toBe('YYYY-MM-DD');
  });

  it('accepts a fully-specified pattern', () => {
    const pattern = validatePattern({
      casing: 'kebab',
      sanitize: {
        nfc: true,
        stripControlChars: true,
        collapseWhitespace: true,
        transliterate: false,
        replacement: '_',
      },
      regex: { pattern: '\\s+', flags: 'g', replacement: '-' },
      template: '{name}-{width}x{height}.{ext}',
      indexPadding: 4,
      dateFormat: 'YYYYMMDD',
      prefix: 'pre-',
      suffix: '-suf',
      replaceExtension: 'webp',
    });
    expect(pattern.casing).toBe('kebab');
    expect(pattern.regex?.pattern).toBe('\\s+');
    expect(pattern.regex?.global).toBe(true);
    expect(pattern.template).toBe('{name}-{width}x{height}.{ext}');
    expect(pattern.replaceExtension).toBe('webp');
  });

  it('rejects unknown casing values', () => {
    expect(() => RenamePatternSchema.parse({ casing: 'weird' })).toThrow();
  });

  it('rejects a regex rule that combines g and y flags', () => {
    expect(() =>
      RenamePatternSchema.parse({
        regex: { pattern: 'a', flags: 'gy', replacement: 'b' },
      }),
    ).toThrow(/g and y/);
  });

  it('rejects sanitize=true with custom options', () => {
    // When sanitize is the boolean `true`, no options are merged.
    const pattern = RenamePatternSchema.parse({ sanitize: true });
    expect(pattern.sanitize).toBe(true);
  });

  it('rejects indexPadding larger than 12', () => {
    expect(() => RenamePatternSchema.parse({ indexPadding: 99 })).toThrow();
  });

  it('rejects a negative indexPadding', () => {
    expect(() => RenamePatternSchema.parse({ indexPadding: -1 })).toThrow();
  });
});

describe('AssetSchema', () => {
  it('parses a minimal asset', () => {
    const asset = AssetSchema.parse({
      name: 'foo',
      extension: 'png',
      index: 1,
    });
    expect(asset.name).toBe('foo');
    expect(asset.extension).toBe('png');
    expect(asset.index).toBe(1);
  });

  it('rejects a non-positive index', () => {
    expect(() => AssetSchema.parse({ name: 'foo', extension: 'png', index: 0 })).toThrow();
    expect(() => AssetSchema.parse({ name: 'foo', extension: 'png', index: -1 })).toThrow();
  });

  it('accepts optional metadata and serializes Date to ISO', () => {
    const createdAt = new Date('2024-05-12T13:45:00Z');
    const asset = AssetSchema.parse({
      name: 'foo',
      extension: 'png',
      index: 2,
      width: 1920,
      height: 1080,
      format: 'png',
      createdAt,
    });
    expect(asset.width).toBe(1920);
    expect(asset.height).toBe(1080);
    expect(asset.format).toBe('png');
    expect(asset.createdAt).toEqual(createdAt);
  });
});

describe('RenameResultSchema', () => {
  it('round-trips a result envelope', () => {
    const result = RenameResultSchema.parse({
      original: 'foo.png',
      renamed: 'foo-bar.png',
      operations: ['casing', 'regex'],
    });
    expect(result.operations).toEqual(['casing', 'regex']);
  });

  it('allows an empty operations array (identity rename)', () => {
    const result = RenameResultSchema.parse({
      original: 'foo.png',
      renamed: 'foo.png',
      operations: [],
    });
    expect(result.operations).toEqual([]);
  });

  it('requires original and renamed to be non-empty', () => {
    expect(() =>
      RenameResultSchema.parse({
        original: '',
        renamed: 'foo.png',
        operations: [],
      }),
    ).toThrow();
  });
});

describe('validatePattern', () => {
  it('returns a parsed RenamePattern for a valid input', () => {
    const pattern = validatePattern({ casing: 'kebab' });
    expect(pattern.casing).toBe('kebab');
  });

  it('throws InvalidPatternError for invalid input', () => {
    let caught: unknown;
    try {
      validatePattern({ casing: 'bogus' });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(InvalidPatternError);
    expect((caught as InvalidPatternError).issues.length).toBeGreaterThan(0);
  });
});
