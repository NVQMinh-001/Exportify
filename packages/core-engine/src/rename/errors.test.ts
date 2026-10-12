import { describe, expect, it } from 'vitest';

import {
  InvalidPatternError,
  InvalidTemplateError,
  RenameError,
  UnsafeRegexError,
} from './errors.js';

describe('rename errors', () => {
  it('RenameError is the base class and preserves the message', () => {
    const err = new RenameError('boom');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RenameError);
    expect(err.name).toBe('RenameError');
    expect(err.message).toBe('boom');
  });

  it('UnsafeRegexError is a RenameError and carries the offending pattern', () => {
    const err = new UnsafeRegexError('^(a+)+$', 'star-height 5 exceeds 4');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RenameError);
    expect(err).toBeInstanceOf(UnsafeRegexError);
    expect(err.name).toBe('UnsafeRegexError');
    expect(err.pattern).toBe('^(a+)+$');
    expect(err.message).toContain('^(a+)+$');
    expect(err.message).toContain('star-height');
  });

  it('InvalidPatternError is a RenameError and keeps zod issues', () => {
    const issues = [{ code: 'custom', path: ['casing'], message: 'bad' }];
    const err = new InvalidPatternError('nope', issues);
    expect(err).toBeInstanceOf(RenameError);
    expect(err).toBeInstanceOf(InvalidPatternError);
    expect(err.name).toBe('InvalidPatternError');
    expect(err.issues).toBe(issues);
    expect(err.message).toBe('nope');
  });

  it('InvalidTemplateError is a RenameError and identifies the token', () => {
    const err = new InvalidTemplateError('{weird}', 'unknown placeholder');
    expect(err).toBeInstanceOf(RenameError);
    expect(err).toBeInstanceOf(InvalidTemplateError);
    expect(err.name).toBe('InvalidTemplateError');
    expect(err.token).toBe('{weird}');
    expect(err.message).toContain('{weird}');
  });

  it('all error subclasses are catchable as RenameError', () => {
    for (const err of [
      new UnsafeRegexError('x', 'y'),
      new InvalidPatternError('z', []),
      new InvalidTemplateError('t', 'm'),
    ]) {
      expect(err).toBeInstanceOf(RenameError);
    }
  });
});
