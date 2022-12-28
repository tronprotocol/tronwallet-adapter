/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    transform: {
        '\\.[t]sx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
    moduleNameMapper: {
        '(.+)\\.js': '$1',
    },
    extensionsToTreatAsEsm: ['.ts'],
};
