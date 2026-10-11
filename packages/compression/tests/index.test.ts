import { describe, expect, it } from 'vitest';

import { COMPRESSION_VERSION } from '../src/index.js';

describe('@exportify/compression', () => {
  it('exports a version constant', () => {
    expect(COMPRESSION_VERSION).toBe('0.0.0');
  });
});
