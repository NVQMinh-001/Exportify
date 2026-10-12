import { describe, expect, it } from 'vitest';

import { sanitize } from './sanitize.js';

describe('sanitize — default options', () => {
  it('NFC-normalizes decomposed Unicode', () => {
    // é (e + combining acute) → é (NFC)
    expect(sanitize('cafe\u0301')).toBe('café');
  });

  it('strips ASCII control characters', () => {
    expect(sanitize('foo\u0000\u0007bar')).toBe('foobar');
  });

  it('collapses runs of whitespace', () => {
    expect(sanitize('hello    world')).toBe('hello world');
  });

  it('replaces tabs and newlines with single space', () => {
    expect(sanitize('foo\t\nbar')).toBe('foo bar');
  });

  it('returns an empty string unchanged', () => {
    expect(sanitize('')).toBe('');
  });
});

describe('sanitize — opt-out', () => {
  it('does not NFC normalize when nfc=false', () => {
    expect(
      sanitize('cafe\u0301', { nfc: false, stripControlChars: true, collapseWhitespace: true }),
    ).toBe('cafe\u0301');
  });

  it('does not strip control chars when stripControlChars=false', () => {
    expect(
      sanitize('foo\u0000bar', { nfc: false, stripControlChars: false, collapseWhitespace: true }),
    ).toBe('foo\u0000bar');
  });

  it('does not collapse whitespace when collapseWhitespace=false', () => {
    expect(
      sanitize('a   b', { nfc: false, stripControlChars: true, collapseWhitespace: false }),
    ).toBe('a   b');
  });
});

describe('sanitize — replacement character', () => {
  it('uses the configured replacement for stripped chars', () => {
    expect(
      sanitize('foo\u0000bar', {
        nfc: false,
        stripControlChars: true,
        collapseWhitespace: true,
        replacement: '-',
      }),
    ).toBe('foo-bar');
  });
});

describe('sanitize — Windows reserved characters', () => {
  it('replaces <>:"/\\|?* with the replacement char by default when stripReserved=true', () => {
    expect(
      sanitize('a<b>c:d"e/f\\g|h?i*j', {
        stripReserved: true,
        nfc: true,
        stripControlChars: true,
        collapseWhitespace: true,
        replacement: '_',
      }),
    ).toBe('a_b_c_d_e_f_g_h_i_j');
  });
});

describe('sanitize — transliteration hook', () => {
  it('applies a custom transliteration table', () => {
    const table: Record<string, string> = { é: 'e', ï: 'i', ü: 'u' };
    expect(
      sanitize('café-naïve', {
        nfc: false,
        stripControlChars: true,
        collapseWhitespace: true,
        transliterate: true,
        transliterationTable: table,
      }),
    ).toBe('cafe-naive'); // every char in the input has a mapping
  });

  it('leaves unmapped characters untouched', () => {
    const table: Record<string, string> = { é: 'e' };
    expect(
      sanitize('café-naïve', {
        nfc: false,
        stripControlChars: true,
        collapseWhitespace: true,
        transliterate: true,
        transliterationTable: table,
      }),
    ).toBe('cafe-naïve'); // ï stays ï because it is not in the table
  });

  it('throws when transliterate=true without a table', () => {
    expect(() =>
      sanitize('foo', {
        nfc: false,
        stripControlChars: true,
        collapseWhitespace: true,
        transliterate: true,
      }),
    ).toThrow();
  });
});
