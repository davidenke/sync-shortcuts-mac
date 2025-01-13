import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
// import target from 'vite-plugin-target';

const nodeTarget = `node${readFileSync('.nvmrc', 'utf-8').split('.')[0]}`;

export default defineConfig({
  plugins: [commonjs()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SyncShortcutsMac',
      fileName: 'index',
      formats: ['es'],
    },
    outDir: 'bin',
    target: nodeTarget,
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [
        'node_modules/bplist-creator',
        'node_modules/bplist-parser',
        'node_modules/simple-plist',
      ],
    },
    rollupOptions: {
      external: [
        'node:fs',
        'node:fs/promises',
        'node:os',
        'node:path',
        'node:process',
        'node:readline',
        'node:util',
      ],
    },
  },
  ssr: { noExternal: true, target: 'node' },
});
