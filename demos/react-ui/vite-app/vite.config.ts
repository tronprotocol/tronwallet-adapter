import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        legacy({
            targets: ['defaults'],
        }),
    ],
    define: {
        global: 'window',
    },
    optimizeDeps: {
        exclude: [
            '@tronweb3/tronwallet-adapters',
            '@tronweb3/tronwallet-adapter-tronlink',
            '@tronweb3/tronwallet-abstract-adapter',
        ],
    },
    server: {
        host: '0.0.0.0',
        port: 3000,
    },
    // https://tronprotocol.github.io/tronwallet-adapter/example
    base: '/tronwallet-adapter/example/',
    build: {
        emptyOutDir: true,
        outDir: '../../../docs/example'
    }
});
