import { TronLinkEvmAdapter } from '../../src/adapter.js';

describe('TronLinkEvmAdapter', () => {
    test('base props should be valid', () => {
        const adapter = new TronLinkEvmAdapter();
        expect(adapter.name).toEqual('TronLinkEvm');
        expect(adapter.url).toEqual('https://www.tronlink.org/');
        expect(adapter.readyState).toEqual('Loading');
        expect(adapter.address).toEqual(null);
        expect(adapter.connected).toEqual(false);
        jest.advanceTimersByTime(4000);
        expect(adapter.readyState).toEqual('Loading');
    });
});
