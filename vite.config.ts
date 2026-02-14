import { defineConfig } from 'vite';
import pkg from './package.json';

export default defineConfig({
    define: {
        __BERRYPICKR_VERSION__: JSON.stringify(pkg.version)
    },
    build: {
        target: 'es2022',
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
        lib: {
            entry: {
                berrypickr: 'src/index.ts',
                react: 'src/react.ts',
                vue: 'src/vue.ts',
                svelte: 'src/svelte.ts'
            },
            formats: ['es'],
            fileName: (_format, entryName) => `${entryName}.js`
        },
        rollupOptions: {
            external: ['react', 'react/jsx-runtime', 'vue', 'svelte/store']
        }
    }
});
