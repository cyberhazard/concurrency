import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  clean: true,
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'build',
});
