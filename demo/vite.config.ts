import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(rootDir, '..');

export default defineConfig(({ command }) => ({
  root: rootDir,
  // gh-pages needs the repo base path; local `yarn dev` / `dev:docs` must use `/`
  base: command === 'build' ? '/ERP-Table/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      'persian-data-grid': path.resolve(repoRoot, 'publish/entry.ts'),
    },
  },
  publicDir: path.resolve(rootDir, 'public'),
  build: {
    outDir: path.resolve(rootDir, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5175,
    open: true,
  },
}));
