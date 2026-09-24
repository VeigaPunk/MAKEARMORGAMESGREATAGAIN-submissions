import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    // PixiJS 8's WebGL init hangs when Rollup-bundled in this toolchain;
    // it is loaded as a pinned external ESM module via the importmap instead.
    rollupOptions: {
      external: ['pixi.js'],
    },
  },
});
