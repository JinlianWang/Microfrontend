import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const mfeProxy = (target) => ({
  target,
  changeOrigin: true,
  ws: true,
});

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const sharedDir = fileURLToPath(new URL('../lib', import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: '/',
  appType: 'mpa',
  resolve: {
    alias: {
      '@lib': sharedDir,
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: [sharedDir, rootDir],
    },
    proxy: {
      '/mfe1': mfeProxy('http://localhost:5174'),
      '/mfe2': mfeProxy('http://localhost:5175'),
    },
  },
});
