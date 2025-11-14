import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/mfe1/' : '/',
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        remoteEntry: resolve(rootDir, 'src/remoteEntry.js'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
      },
    },
  },
}));
