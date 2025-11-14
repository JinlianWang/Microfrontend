import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/mfe2/',
  server: {
    port: 5175,
    strictPort: true,
  },
});
