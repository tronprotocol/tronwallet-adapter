import { isInBrowser, isInMobileBrowser } from '../../src/utils.js';

describe('utils', () => {
    test('utils function should be exported', () => {
        expect(isInBrowser).toBeDefined();
        expect(isInMobileBrowser).toBeDefined();
    });
});
