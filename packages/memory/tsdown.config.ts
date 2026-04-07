import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  clean: true,
  sourcemap: true,
  dts: true,
  minify: false,
  target: 'node22',
  platform: 'node',
});
