import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(dirname, 'fixtures'),
  define: {
    __BERRYPICKR_VERSION__: JSON.stringify('0.0.0-fixture')
  },
  resolve: {
    alias: {
      berrypickr: path.resolve(dirname, '../src/index.ts')
    }
  },
  server: {
    host: '127.0.0.1',
    port: 43123,
    strictPort: true
  }
});
