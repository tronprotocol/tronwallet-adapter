import { AdapterState, WalletSwitchChainError } from '@tronweb3/tronwallet-abstract-adapter';
import { TronLinkAdapter } from '../../src/adapter.js';
import { MockTronWeb } from './mock.js';
import { ONE_MINUTE } from './utils.js';

beforeAll(() => {
    jest.useFakeTimers();
});

describe('when only tronWeb is avaliable', () => {
    let adapter: TronLinkAdapter;
    beforeAll(() => {
        window.tronWeb = new MockTronWeb('address');
        adapter = new TronLinkAdapter();
    });
    test('initial state should be fine', () => {
        jest.advanceTimersByTime(3000);
        expect(adapter.state).toEqual(AdapterState.Connected);
        expect(adapter.address).toEqual('address');
    });

    test('connect() should work fine', async () => {
        await adapter.connect();
        expect(adapter.state).toEqual(AdapterState.Connected);
    });

    test('signMessage() should work fine', async () => {
        window.tronWeb!.trx.signMessageV2 = jest.fn(() => Promise.resolve('signedMessage'));
        const res = await adapter.signMessage('');
        expect(res).toEqual('signedMessage');
    });
    test('signTransaction() should work fine', async () => {
        window.tronWeb!.trx.sign = jest.fn(() => Promise.resolve('signTransaction')) as any;
        const res = await adapter.signTransaction({} as any);
        expect(res).toEqual('signTransaction');
    });
    test('switchChain() should throw error', () => {
        expect(adapter.switchChain('0x323453')).rejects.toThrowError(WalletSwitchChainError);
    });
    test('disconnect() should work fine', async () => {
        await adapter.disconnect();
        expect(adapter.state).toBe(AdapterState.Disconnect);
        expect(adapter.address).toEqual(null);
    });
});

test('should work fine when tronWeb is not ready', () => {
    window.tronWeb = new MockTronWeb('address');
    window.tronWeb.ready = false;
    const adapter = new TronLinkAdapter();
    jest.advanceTimersByTime(4000);
    expect(adapter.state).toEqual(AdapterState.Disconnect);
});
describe('when tronWeb is not found', () => {
    beforeEach(() => {
        window.tronWeb = undefined;
    });
    test('should work fine ', async () => {
        const adapter = new TronLinkAdapter();
        jest.advanceTimersByTime(4000);
        expect(adapter.state).toEqual(AdapterState.Loading);
        jest.advanceTimersByTime(ONE_MINUTE);
        await Promise.resolve();
        expect(adapter.state).toEqual(AdapterState.NotFound);
    });
});
