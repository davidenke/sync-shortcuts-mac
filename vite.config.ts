import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import target from 'vite-plugin-target';

const nodeTarget = `node${readFileSync('.nvmrc', 'utf-8').split('.')[0]}`;

export default defineConfig({
  plugins: [target({ node: { version: nodeTarget } })],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SyncShortcutsMac',
      fileName: 'index',
      formats: ['es'],
    },
    outDir: 'bin',
    target: nodeTarget,
  },
});
