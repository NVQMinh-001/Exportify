import { describe, expect, it } from 'vitest';

import { compileRegex, safeReplace } from './regex.js';
import { UnsafeRegexError } from './errors.js';

describe('compileRegex', () => {
  it('compiles a safe pattern with default global flag', () => {
    const re = compileRegex({ pattern: 'foo', replacement: 'bar' });
    expect(re.global).toBe(true);
    expect('foo foo'.replace(re, 'bar')).toBe('bar bar');
  });

  it('honors an explicit non-global flag set', () => {
    const re = compileRegex({
      pattern: 'foo',
      flags: 'i',
      replacement: 'bar',
      global: false,
    });
    expect(re.global).toBe(false);
    expect(re.flags).toBe('i');
  });

  it('accepts unicode flag for safe patterns', () => {
    const re = compileRegex({ pattern: '\\p{L}+', flags: 'u', replacement: '' });
    expect(re.flags.includes('u')).toBe(true);
  });

  it('throws UnsafeRegexError on the classic ReDoS pattern (a+)+$', () => {
    expect(() => compileRegex({ pattern: '^(a+)+$', flags: '', replacement: 'x' })).toThrow(
      UnsafeRegexError,
    );
  });

  it('throws UnsafeRegexError on deep quantifier nesting', () => {
    expect(() => compileRegex({ pattern: '(a+){5,}', flags: '', replacement: 'x' })).toThrow(
      /star-height|unsafe|ReDoS|nesting/i,
    );
  });

  it('rejects unsupported flags', () => {
    expect(() => compileRegex({ pattern: 'a', flags: 'z', replacement: 'b' })).toThrow();
  });

  it('rejects g + y combination at schema level', () => {
    // The compileRegex entry point delegates the g+y check to the schema, but
    // also defends in depth.
    expect(() => compileRegex({ pattern: 'a', flags: 'gy', replacement: 'b' })).toThrow();
  });
});

describe('safeReplace', () => {
  it('replaces all matches when regex is global', () => {
    expect(
      safeReplace(
        'hello hello hello',
        compileRegex({ pattern: 'hello', replacement: 'world' }),
        'world',
      ),
    ).toBe('world world world');
  });

  it('returns input unchanged when no match is found', () => {
    const re = compileRegex({ pattern: 'nope', replacement: '?' });
    expect(safeReplace('hello', re, '?')).toBe('hello');
  });

  it('handles empty replacement', () => {
    expect(safeReplace('abcabc', compileRegex({ pattern: 'b', replacement: '' }), '')).toBe('acac');
  });
});
