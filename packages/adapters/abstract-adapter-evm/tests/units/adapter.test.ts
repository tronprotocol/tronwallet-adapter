import { Adapter, WalletReadyState } from '../../src/adapter.js';
import type { Asset, Chain, AdapterName, TypedData } from '../../src/adapter.js';
import type { EIP1193Provider } from '../../src/eip1193-provider.js';

const provider = {
    request: jest.fn(),
} as unknown as EIP1193Provider;

class TestAdapter extends Adapter {
    name = 'Test' as AdapterName<'Test'>;
    icon = 'https://icon.com/test-icon.png';
    url = 'https://test-wallet.com';
    address: null | string = null;
    readyState = WalletReadyState.Found;

    constructor() {
        super();
    }

    getProvider = jest.fn(() => Promise.resolve(provider));
    async connect() {
        return Promise.resolve('address1');
    }
    async signTypedData(): Promise<string> {
        return Promise.resolve('signature');
    }
}

let adapter: TestAdapter;
beforeEach(() => {
    adapter = new TestAdapter();
    adapter.address = '0xsome address';
    provider.request = jest.fn();
});
describe('#AbstractAdapter', () => {
    test('#connected should be correct', () => {
        expect(adapter.connected).toEqual(true);
        adapter.address = '';
        expect(adapter.connected).toEqual(false);
    });
    test('#signMessage() should work fine', async () => {
        const message = 'Hello';
        await adapter.signMessage({ message });
        expect(adapter.getProvider).toBeCalledTimes(1);
        expect(provider.request).toBeCalledWith({ method: 'personal_sign', params: [message, adapter.address] });
    });
    test('#signMessage() with address should work fine', async () => {
        const message = 'Hello';
        const address = 'address';
        await adapter.signMessage({ message, address });
        expect(adapter.getProvider).toBeCalledTimes(1);
        expect(provider.request).toBeCalledWith({ method: 'personal_sign', params: [message, address] });
    });
    test('#signMessage() should throw error when provider.request throw error', async () => {
        const error: any = new Error('user rejected');
        error.code = '30003';
        error.data = 'some data';
        provider.request = jest.fn(() => {
            throw error;
        });
        await expect(adapter.signMessage({ message: 'hello' })).rejects.toEqual(error);
    });
    test('#sendTransaction() should work fine', async () => {
        const transaction = {
            from: 'address from',
            to: 'address to',
            value: '0x03',
        };
        await adapter.sendTransaction(transaction);
        expect(adapter.getProvider).toBeCalledTimes(1);
        expect(provider.request).toBeCalledWith({ method: 'eth_sendTransaction', params: [transaction] });
    });
    test('#addChain() should work fine', async () => {
        const chainInfo: Chain = {
            chainId: '0x539',
            chainName: 'Localhost',
            nativeCurrency: {
                name: 'Ethereum Token',
                symbol: 'ETH',
                decimals: 18,
            },
            rpcUrls: ['https://rpc-url.com'],
        };
        await adapter.addChain(chainInfo);
        expect(adapter.getProvider).toBeCalledTimes(1);
        expect(provider.request).toBeCalledWith({ method: 'wallet_addEthereumChain', params: [chainInfo] });
    });
    test('#addChain() should work fine', async () => {
        const chainId = '0x539';
        await adapter.switchChain(chainId);
        expect(adapter.getProvider).toBeCalledTimes(1);
        expect(provider.request).toBeCalledWith({ method: 'wallet_switchEthereumChain', params: [{ chainId }] });
    });
    test('#watchAsset() should work fine', async () => {
        const asset: Asset = {
            type: 'ERC20',
            options: {
                address: '0xtoken address',
                symbol: 'USDT',
                decimals: 18,
            },
        };
        await adapter.watchAsset(asset);
        expect(adapter.getProvider).toBeCalledTimes(1);
        expect(provider.request).toBeCalledWith({ method: 'wallet_watchAsset', params: asset });
    });
});
