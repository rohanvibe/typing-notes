import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@data': resolve(__dirname, 'src/data'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@lib': resolve(__dirname, 'src/lib')
    }
  }
});
