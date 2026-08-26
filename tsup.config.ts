import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'publish/entry.ts',
  },
  format: ['esm', 'cjs'],
  /** Auto-emit declarations from publish entry (strict, same as tsconfig). */
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  target: 'es2020',
  outDir: 'dist',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});
