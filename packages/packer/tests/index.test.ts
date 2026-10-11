import { describe, expect, it } from 'vitest';

import { PACKER_VERSION } from '../src/index.js';

describe('@exportify/packer', () => {
  it('exports a version constant', () => {
    expect(PACKER_VERSION).toBe('0.0.0');
  });
});
