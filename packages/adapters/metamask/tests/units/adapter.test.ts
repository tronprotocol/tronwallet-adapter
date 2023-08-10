import { WalletNotFoundError } from '@tronweb3/abstract-adapter-evm';
import { MetaMaskAdapter } from '../../src/adapter.js';
import { MetaMaskProvider } from './metamask-provider.js';

let provider: MetaMaskProvider;
jest.useFakeTimers();

beforeEach(() => {
    jest.useFakeTimers();
    provider = new MetaMaskProvider();
    window.ethereum = provider;
});
const typedData = {
    domain: {
        chainId: 1,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
    },
    primaryType: 'Mail',
    types: {
        Mail: [
            { name: 'from', type: 'string' },
            { name: 'to', type: 'string' },
            { name: 'contents', type: 'string' },
        ],
    },
    message: {
        from: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        to: '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
        contents: 'Hello',
    },
};

describe('MetaMaskAdapter', () => {
    test('base props should be valid', () => {
        // @ts-ignore
        window.ethereum = null;
        const adapter = new MetaMaskAdapter();
        expect(adapter.name).toEqual('MetaMask');
        expect(adapter.url).toEqual('https://metamask.io');
        expect(adapter.readyState).toEqual('Loading');
        expect(adapter.address).toEqual(null);
        expect(adapter.connected).toEqual(false);
        jest.advanceTimersByTime(4000);
        expect(adapter.readyState).toEqual('Loading');
    });

    describe('provider detection should work fine', () => {
        test('adapter should be ready when window.ethereum.isMetaMask is true', () => {
            const adapter = new MetaMaskAdapter();
            expect(adapter.readyState).toEqual('Found');
        });
        test('adapter should be ready when window.ethereum.providers has MetaMaskProvider', () => {
            // @ts-ignore
            window.ethereum.providers = [{}, window.ethereum];
            const adapter = new MetaMaskAdapter();
            expect(adapter.readyState).toEqual('Found');
        });
        test('adapter should be ready when window.ethereum is injected asynchronously', async () => {
            // @ts-ignore
            window.ethereum = null;
            const cb: any = {};
            window.addEventListener = function (event: string, listener: any) {
                cb[event] = listener;
            };
            const adapter = new MetaMaskAdapter();
            expect(adapter.readyState).toEqual('Loading');
            setTimeout(() => {
                window.ethereum = new MetaMaskProvider();
                cb['ethereum#initialized']?.();
            }, 2000);
            jest.advanceTimersByTime(3000);
            for (const i of [1, 2, 3]) {
                await Promise.resolve(i);
            }

            expect(adapter.readyState).toEqual('Found');
        });
        /**
         * @jest-environment-options {"userAgent": "Android/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 MetaMaskMobile"}
         */
        test.skip('adapter should be not ready when window.ethereum is undefined and is not in MetaMask app', async () => {
            window.ethereum = null as any;
            const adapter = new MetaMaskAdapter();
            await Promise.resolve();
            expect(adapter.readyState).toEqual('NotFound');
        });
    });

    describe('#signTypedData()', () => {
        test('should work fine', async () => {
            provider._setAccountsRes(['address']);
            const adapter = new MetaMaskAdapter();
            await Promise.resolve();
            const request = jest.spyOn(provider, 'request');
            const getProvider = jest.spyOn(adapter, 'getProvider');
            await adapter.signTypedData({ typedData });
            expect(getProvider).toBeCalledTimes(1);
            expect(request).toHaveBeenLastCalledWith({
                method: 'eth_signTypedData_v4',
                params: [adapter.address, typedData],
            });
            request.mockReset();
            request.mockRestore();
        });
        test('should throw error when ethereum.request throw error', async () => {
            provider._setAccountsRes(['address']);
            const adapter = new MetaMaskAdapter();
            await Promise.resolve();
            const oldRequest = provider.request;
            const error = new Error();
            provider.request = jest.fn(() => {
                throw error;
            });
            await expect(adapter.signTypedData({ typedData })).rejects.toEqual(error);
            provider.request = oldRequest;
        });
    });

    describe('#connect()', () => {
        test('should work fine when provider.request return account list', async () => {
            provider._setRequestAccountsRes(['address']);
            const adapter = new MetaMaskAdapter();
            const res = await adapter.connect();
            expect(res).toEqual('address');
        });
        test('should throw WalletNotFoundError when there is no ethereum provider', async () => {
            window.ethereum = null as any;
            const adapter = new MetaMaskAdapter();
            const res = adapter.connect();
            jest.advanceTimersByTime(5000);
            await expect(res).rejects.toBeInstanceOf(WalletNotFoundError);
        });
        test('should throw WalletConnectionError when provider.request throw error', async () => {
            provider._setAccountsRes(['address']);
            const adapter = new MetaMaskAdapter();
            await Promise.resolve();
            const oldRequest = provider.request;
            const error = new Error();
            provider.request = jest.fn(() => {
                throw error;
            });
            await expect(adapter.connect()).rejects.toThrow();
            provider.request = oldRequest;
        });
    });
});
