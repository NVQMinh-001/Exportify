import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { figmaPlugin } from '@exportify/vite-plugins/plugin-figma';

export default defineConfig({
  plugins: [react(), figmaPlugin({ root: __dirname })],
  resolve: {
    alias: {
      '@': new URL('./src/', import.meta.url).pathname,
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
