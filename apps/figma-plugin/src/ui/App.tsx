import type { ReactElement } from 'react';

import { UI_VERSION } from '@exportify/ui';

export function App(): ReactElement {
  return (
    <main className="exportify-figma-shell">
      <h1>Exportify</h1>
      <p>Figma plugin shell. UI package reports version {UI_VERSION}.</p>
    </main>
  );
}
