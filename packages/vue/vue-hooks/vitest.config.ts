import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        server: {
            deps: {
                inline: ['chai', 'get-func-name'],
            },
        },
        environment: 'jsdom',
    },
});
