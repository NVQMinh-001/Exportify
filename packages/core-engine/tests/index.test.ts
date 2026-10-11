import { describe, expect, it } from 'vitest';

import { CORE_ENGINE_VERSION } from '../src/index.js';

describe('@exportify/core-engine', () => {
  it('exports a version constant', () => {
    expect(CORE_ENGINE_VERSION).toBe('0.0.0');
  });
});
