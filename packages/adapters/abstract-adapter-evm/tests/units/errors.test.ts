import { WalletConnectionError, WalletDisconnectedError, WalletNotFoundError } from '../../src/errors.js';

describe('errors', () => {
    test('WalletError should be exported', () => {
        expect(WalletNotFoundError).toBeDefined();
        expect(WalletDisconnectedError).toBeDefined();
        expect(WalletConnectionError).toBeDefined();
    });
});
