import { TokenPocketAdapter } from '../../src/adapter.js';

describe('TokenPocketAdapter', () => {
    test('should be defined', () => {
        expect(TokenPocketAdapter).not.toBeNull();
    });
    test('#constructor() should work fine', () => {
        const adapter = new TokenPocketAdapter();
        expect(adapter.name).toEqual('TokenPocket');
    });
});
