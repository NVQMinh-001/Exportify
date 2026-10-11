import { describe, expect, it } from 'vitest';

import { TRANSPORT_VERSION } from '../src/index.js';

describe('@exportify/transport', () => {
  it('exports a version constant', () => {
    expect(TRANSPORT_VERSION).toBe('0.0.0');
  });
});
