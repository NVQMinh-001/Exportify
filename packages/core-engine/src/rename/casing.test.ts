import { describe, expect, it } from 'vitest';

import { applyCasing, toCamel, toKebab, toLower, toPascal, toSnake, toUpper } from './casing.js';

describe('toKebab', () => {
  it('converts PascalCase to kebab-case', () => {
    expect(toKebab('HelloWorld')).toBe('hello-world');
  });

  it('converts snake_case to kebab-case', () => {
    expect(toKebab('hello_world')).toBe('hello-world');
  });

  it('converts mixed whitespace and separators', () => {
    expect(toKebab('Hello  World_FOO-bar')).toBe('hello-world-foo-bar');
  });

  it('lowercases acronyms without splitting inside them', () => {
    expect(toKebab('XMLHttpRequest')).toBe('xml-http-request');
  });

  it('returns an empty string unchanged', () => {
    expect(toKebab('')).toBe('');
  });

  it('preserves leading and trailing digits as separate tokens', () => {
    expect(toKebab('icon24x24Dark')).toBe('icon-24-x-24-dark');
  });
});

describe('toSnake', () => {
  it('converts PascalCase to snake_case', () => {
    expect(toSnake('HelloWorld')).toBe('hello_world');
  });

  it('converts kebab-case to snake_case', () => {
    expect(toSnake('hello-world')).toBe('hello_world');
  });

  it('converts camelCase to snake_case', () => {
    expect(toSnake('helloWorld')).toBe('hello_world');
  });
});

describe('toCamel', () => {
  it('converts PascalCase to camelCase', () => {
    expect(toCamel('HelloWorld')).toBe('helloWorld');
  });

  it('converts kebab-case to camelCase', () => {
    expect(toCamel('hello-world')).toBe('helloWorld');
  });

  it('converts snake_case to camelCase', () => {
    expect(toCamel('hello_world')).toBe('helloWorld');
  });

  it('is idempotent on already-camel text', () => {
    expect(toCamel('helloWorld')).toBe('helloWorld');
  });
});

describe('toPascal', () => {
  it('converts camelCase to PascalCase', () => {
    expect(toPascal('helloWorld')).toBe('HelloWorld');
  });

  it('converts kebab-case to PascalCase', () => {
    expect(toPascal('hello-world')).toBe('HelloWorld');
  });

  it('converts snake_case to PascalCase', () => {
    expect(toPascal('hello_world')).toBe('HelloWorld');
  });
});

describe('toLower / toUpper', () => {
  it('lowercases ASCII', () => {
    expect(toLower('HelloWorld')).toBe('helloworld');
  });

  it('uppercases ASCII', () => {
    expect(toUpper('HelloWorld')).toBe('HELLOWORLD');
  });
});

describe('applyCasing', () => {
  it('returns the input unchanged when casing is "none"', () => {
    expect(applyCasing('HelloWorld', 'none')).toBe('HelloWorld');
  });

  it('dispatches to the named case rule', () => {
    expect(applyCasing('HelloWorld', 'kebab')).toBe('hello-world');
    expect(applyCasing('HelloWorld', 'snake')).toBe('hello_world');
    expect(applyCasing('HelloWorld', 'camel')).toBe('helloWorld');
    expect(applyCasing('HelloWorld', 'pascal')).toBe('HelloWorld');
    expect(applyCasing('HelloWorld', 'lower')).toBe('helloworld');
    expect(applyCasing('HelloWorld', 'upper')).toBe('HELLOWORLD');
  });
});
