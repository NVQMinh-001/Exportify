import { describe, expect, it } from 'vitest';

import { SHARED_TYPES_VERSION } from '../src/index.js';

describe('@exportify/shared-types', () => {
  it('exports a version constant', () => {
    expect(SHARED_TYPES_VERSION).toBe('0.0.0');
  });
});
