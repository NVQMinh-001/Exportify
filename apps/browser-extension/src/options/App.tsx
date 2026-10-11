import type { ReactElement } from 'react';

import { UI_VERSION } from '@exportify/ui';

export function App(): ReactElement {
  return (
    <main className="exportify-options-shell">
      <h1>Exportify options</h1>
      <p>Full options page. UI package reports version {UI_VERSION}.</p>
    </main>
  );
}
