import { BitKeepAdapter } from '../../src/adapter.js';

describe('BitKeepAdapter', () => {
    test('should be defined', () => {
        expect(BitKeepAdapter).not.toBeNull();
    });
    test('#constructor() should work fine', () => {
        const adapter = new BitKeepAdapter();
        expect(adapter.name).toEqual('BitKeep');
    });
});
