import { describe, expect, it } from 'vitest';

import { PRESETS_VERSION } from '../src/index.js';

describe('@exportify/presets', () => {
  it('exports a version constant', () => {
    expect(PRESETS_VERSION).toBe('0.0.0');
  });
});
