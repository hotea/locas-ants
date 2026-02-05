import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/locas-ants/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
  },
});
