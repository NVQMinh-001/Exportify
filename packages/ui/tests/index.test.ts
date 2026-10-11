import { describe, expect, it } from 'vitest';

import { UI_VERSION } from '../src/index.js';

describe('@exportify/ui', () => {
  it('exports a version constant', () => {
    expect(UI_VERSION).toBe('0.0.0');
  });
});
