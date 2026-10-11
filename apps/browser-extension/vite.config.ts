import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mv3Plugin } from '@exportify/vite-plugins/plugin-mv3';

export default defineConfig({
  plugins: [react(), mv3Plugin({ root: __dirname })],
  resolve: {
    alias: {
      '@': new URL('./src/', import.meta.url).pathname,
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
});
