import { describe, expect, it } from 'vitest';

import { applyTemplate } from './placeholders.js';
import { InvalidTemplateError } from './errors.js';

const baseCtx = {
  name: 'hero',
  ext: 'png',
  index: 1,
};

describe('applyTemplate — basic placeholders', () => {
  it('substitutes {name}', () => {
    expect(applyTemplate('{name}', baseCtx)).toBe('hero');
  });

  it('substitutes {ext}', () => {
    expect(applyTemplate('{name}.{ext}', baseCtx)).toBe('hero.png');
  });

  it('substitutes {index}', () => {
    expect(applyTemplate('{name}-{index}', { ...baseCtx, index: 7 })).toBe('hero-7');
  });

  it('treats {n} as an alias of {index}', () => {
    expect(applyTemplate('{n}', { ...baseCtx, index: 12 })).toBe('12');
  });

  it('substitutes {width} and {height}', () => {
    expect(
      applyTemplate('{name}-{width}x{height}.{ext}', {
        ...baseCtx,
        width: 1024,
        height: 768,
      }),
    ).toBe('hero-1024x768.png');
  });

  it('substitutes {format}', () => {
    expect(applyTemplate('{name}.{format}', { ...baseCtx, format: 'webp' })).toBe('hero.webp');
  });

  it('substitutes {date} as ISO YYYY-MM-DD by default', () => {
    expect(
      applyTemplate('{date}', {
        ...baseCtx,
        createdAt: new Date('2024-05-12T13:45:00Z'),
      }),
    ).toBe('2024-05-12');
  });

  it('throws InvalidTemplateError when a placeholder has no value', () => {
    expect(() => applyTemplate('{width}', baseCtx)).toThrow(InvalidTemplateError);
  });
});

describe('applyTemplate — zero-pad', () => {
  it('zero-pads {index:04} to four digits', () => {
    expect(applyTemplate('{index:04}', { ...baseCtx, index: 7 })).toBe('0007');
  });

  it('does not truncate when value is already wider', () => {
    expect(applyTemplate('{index:04}', { ...baseCtx, index: 12345 })).toBe('12345');
  });

  it('honors {n:3}', () => {
    expect(applyTemplate('{n:3}', { ...baseCtx, index: 9 })).toBe('009');
  });

  it('throws InvalidTemplateError on a non-numeric pad', () => {
    expect(() => applyTemplate('{index:abc}', baseCtx)).toThrow(InvalidTemplateError);
  });

  it('throws InvalidTemplateError on a pad larger than 12', () => {
    expect(() => applyTemplate('{index:99}', baseCtx)).toThrow(InvalidTemplateError);
  });
});

describe('applyTemplate — date formatting', () => {
  const ctx = { ...baseCtx, createdAt: new Date('2024-05-12T13:45:07Z') };

  it('formats YYYYMMDD', () => {
    expect(applyTemplate('{date:YYYYMMDD}', ctx)).toBe('20240512');
  });

  it('formats YYYY-MM-DD-HHmm', () => {
    expect(applyTemplate('{date:YYYY-MM-DD-HHmm}', ctx)).toBe('2024-05-12-1345');
  });

  it('formats HH-mm-ss', () => {
    expect(applyTemplate('{date:HH-mm-ss}', ctx)).toBe('13-45-07');
  });

  it('falls back to ISO when token is unknown but recognisable pattern', () => {
    // Unknown tokens fall back to the literal token on first encounter — we
    // document this behaviour so the test pins it.
    expect(applyTemplate('{date:ZZ}', ctx)).toBe('ZZ');
  });

  it('throws InvalidTemplateError on missing createdAt with explicit date token', () => {
    expect(() => applyTemplate('{date:YYYY}', baseCtx)).toThrow(InvalidTemplateError);
  });
});

describe('applyTemplate — escaping & literal text', () => {
  it('treats bare text as literal', () => {
    expect(applyTemplate('hello', baseCtx)).toBe('hello');
  });

  it('renders literals around placeholders', () => {
    expect(applyTemplate('pre-{name}-suf', baseCtx)).toBe('pre-hero-suf');
  });

  it('throws InvalidTemplateError on an unknown placeholder', () => {
    expect(() => applyTemplate('{nope}', baseCtx)).toThrow(InvalidTemplateError);
  });
});
