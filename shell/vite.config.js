import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const mfeProxy = (target) => ({
  target,
  changeOrigin: true,
  ws: true,
});

export default defineConfig({
  plugins: [react()],
  base: '/',
  appType: 'mpa',
  server: {
    port: 5173,
    proxy: {
      '/mfe1': mfeProxy('http://localhost:5174'),
      '/mfe2': mfeProxy('http://localhost:5175'),
    },
  },
});
