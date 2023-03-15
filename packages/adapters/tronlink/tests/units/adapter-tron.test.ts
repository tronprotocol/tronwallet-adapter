import {
    AdapterState,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletNotFoundError,
    WalletReadyState,
    WalletSignMessageError,
    WalletSignTransactionError,
    WalletSwitchChainError,
} from '@tronweb3/tronwallet-abstract-adapter';
import { TronLinkAdapter } from '../../src/adapter.js';
import type { TronWeb } from '../../src/types.js';
import { MockTron, MockTronLink } from './mock.js';
import { ONE_MINUTE, wait } from './utils.js';
import { waitFor } from '@testing-library/dom';

const noop = () => {
    //
};
let tron: MockTron;
beforeAll(() => {
    global.window.open = jest.fn() as any;
    global.document = window.document;
    global.navigator = window.navigator;
    jest.useFakeTimers();
});

describe('when tron is not found', () => {
    let adapter: TronLinkAdapter;
    beforeEach(() => {
        window.tron = undefined;
        adapter = new TronLinkAdapter();
    });
    test('readyState and state should be NotFound', async () => {
        expect(adapter.readyState).toEqual(WalletReadyState.Loading);
        expect(adapter.state).toEqual(AdapterState.Loading);
        jest.advanceTimersByTime(ONE_MINUTE);
        await Promise.resolve();
        expect(adapter.readyState).toEqual(WalletReadyState.NotFound);
        expect(adapter.state).toEqual(AdapterState.NotFound);
        expect(adapter.address).toEqual(null);
    });

    test('call connect() should throw WalletNotFoundError', async () => {
        jest.advanceTimersByTime(ONE_MINUTE);
        expect(adapter.connect()).rejects.toThrow(WalletNotFoundError);
        adapter
            .connect()
            .catch(noop)
            .finally(() => {
                expect(window.open).toHaveBeenCalled();
            });
    });
    test('call signMessage() should throw WalletDisconnectedError', async () => {
        jest.advanceTimersByTime(ONE_MINUTE);
        expect(adapter.signMessage('')).rejects.toThrow(WalletDisconnectedError);
    });
    test('call signTransaction() should throw WalletDisconnectedError', async () => {
        jest.advanceTimersByTime(ONE_MINUTE);
        expect(adapter.signTransaction({} as any)).rejects.toThrow(WalletDisconnectedError);
    });
});

describe('when tronlink is locked', () => {
    describe('initial state should be find', () => {
        let adapter: TronLinkAdapter;
        let originOn: any;
        const newOn = jest.fn();
        beforeAll(() => {
            tron = new MockTron('');
            setTimeout(() => {
                window.tron = tron;
            }, 100 + Math.floor(Math.random() * 100));
            tron._lock();
            originOn = tron.on;
            tron.on = newOn;
            adapter = new TronLinkAdapter();
        });
        afterAll(() => {
            tron.on = originOn;
        });
        test('state should be Disconnect', async () => {
            expect(adapter.readyState).toEqual(WalletReadyState.Loading);
            expect(adapter.state).toEqual(AdapterState.Loading);
            jest.advanceTimersByTime(1000);
            await Promise.resolve();
            expect(adapter.readyState).toEqual(WalletReadyState.Found);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
        });
    });
    describe('when there is no connected account', () => {
        let adapter: TronLinkAdapter;
        beforeAll(() => {
            tron = new MockTron('');
            setTimeout(() => {
                window.tron = tron;
            }, 100 + Math.floor(Math.random() * 100));
            tron._lock();
            adapter = new TronLinkAdapter();
        });

        test('state should be Disconnect after unlock tronLink', () => {
            tron._unlock();
            jest.advanceTimersByTime(1000);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            expect(adapter.address).toEqual(null);
        });
    });

    describe('when there is a connected account', () => {
        let adapter: TronLinkAdapter;
        beforeAll(() => {
            tron = new MockTron('address');
            window.tron = tron;
            adapter = new TronLinkAdapter();
        });

        // todo: TronLink should emit accountsChanged when unlock/lock
        test('state should be Connected after unlock tronLink', async () => {
            tron._unlock();
            tron._setAddress('address');
            tron._emit('accountsChanged', ['address']);
            jest.advanceTimersByTime(2000);
            await Promise.resolve();
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.address).toEqual('address');
        });
    });
});

describe('when tronlink is unlocked', () => {
    describe('when there is no connected account', () => {
        let adapter: TronLinkAdapter;
        beforeAll(() => {
            tron = new MockTron();
            tron._unlock();
            window.tron = undefined;
            setTimeout(() => {
                window.tron = tron;
            }, 100 + Math.floor(Math.random() * 100));
            adapter = new TronLinkAdapter();
        });

        test('initial state should be fine', async () => {
            expect(adapter.readyState).toEqual(WalletReadyState.Loading);
            expect(adapter.state).toEqual(AdapterState.Loading);
            jest.advanceTimersByTime(ONE_MINUTE);
            await Promise.resolve();
            expect(adapter.readyState).toEqual(WalletReadyState.Found);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            expect(adapter.address).toEqual(null);
        });

        test('switch to a connected account should work fine', () => {
            const address = 'address';
            tron._setAddress(address);
            tron._emit('accountsChanged', [address]);
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.address).toEqual(address);
        });
        test('then switch to disconnected account should work fine', () => {
            tron._setAddress('');
            tron._emit('accountsChanged', []);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            expect(adapter.address).toEqual(null);
        });
    });
    describe('when there is a connected account', () => {
        let adapter: TronLinkAdapter;
        const address = 'address';
        beforeAll(() => {
            window.tron = tron = new MockTron(address);
            tron._unlock();
            adapter = new TronLinkAdapter();
        });
        test('initial state should be fine', async () => {
            expect(adapter.readyState).toEqual(WalletReadyState.Found);
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.address).toEqual(address);
        });
        test('switch to a disconnected account should work fine', () => {
            tron._setAddress('');
            tron._emit('accountsChanged', []);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            expect(adapter.address).toEqual(null);
        });
        test('then switch to connected account should work fine', () => {
            tron._setAddress(address);
            tron._emit('accountsChanged', [address]);
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.address).toEqual(address);
        });
    });
});

describe('events should work fine', () => {
    let adapter: TronLinkAdapter;
    beforeEach(() => {
        window.tron = tron = new MockTron('address');
        tron._unlock();
        adapter = new TronLinkAdapter();
    });
    test('readyStateChanged event should work fine when tron is avaliable', async () => {
        window.tron = undefined;
        setTimeout(() => {
            window.tron = tron = new MockTron('address');
        }, 500);
        const onReadyStateChanged = jest.fn();
        const adapter = new TronLinkAdapter();
        adapter.on('readyStateChanged', onReadyStateChanged);
        jest.advanceTimersByTime(1000);
        expect(onReadyStateChanged).toHaveBeenCalledWith(WalletReadyState.Found);
    });
    test('readyStateChanged event should work fine when tron is not avaliable', async () => {
        window.tron = undefined;
        const onReadyStateChanged = jest.fn();
        const adapter = new TronLinkAdapter();
        adapter.on('readyStateChanged', onReadyStateChanged);
        jest.advanceTimersByTime(ONE_MINUTE);
        expect(onReadyStateChanged).toHaveBeenCalledWith(WalletReadyState.NotFound);
    });
    test('accountsChanged event should work fine', async () => {
        const _onAccountsChanged = jest.fn();
        const _onConnect = jest.fn();
        const _onDisconnect = jest.fn();
        adapter.on('connect', _onConnect);
        adapter.on('disconnect', _onDisconnect);
        adapter.on('accountsChanged', _onAccountsChanged);
        tron._emit('accountsChanged', ['address2']);
        await wait();
        expect(_onConnect).not.toHaveBeenCalled();
        expect(_onAccountsChanged).toHaveBeenCalledTimes(1);
        expect(_onAccountsChanged).toHaveBeenCalledWith('address2', 'address');
        expect(adapter.address).toEqual('address2');

        tron._emit('accountsChanged', ['address3']);
        await wait();
        expect(_onAccountsChanged).toHaveBeenCalledTimes(2);
        expect(_onAccountsChanged).toHaveBeenLastCalledWith('address3', 'address2');
        expect(_onConnect).not.toHaveBeenCalled();
        expect(adapter.address).toEqual('address3');

        tron._emit('accountsChanged', []);
        await wait();
        expect(adapter.address).toEqual(null);
        expect(_onAccountsChanged).toHaveBeenCalledTimes(3);
        expect(_onAccountsChanged).toHaveBeenLastCalledWith('', 'address3');
        expect(_onDisconnect).toHaveBeenCalled();
    });
    test('connect and stateChanged event should work fine', () => {
        window.tron = tron = new MockTron('');
        tron._unlock();
        adapter = new TronLinkAdapter();
        const _onConnect = jest.fn();
        adapter.on('connect', _onConnect);
        tron._emit('accountsChanged', ['address2']);
        expect(_onConnect).toHaveBeenCalledTimes(1);
        expect(_onConnect).toHaveBeenCalledWith('address2');
    });
    test('disconnect event should work fine', () => {
        tron._unlock();
        tron._setAddress('address');
        const _onDisconnect = jest.fn();
        adapter.on('disconnect', _onDisconnect);
        tron._emit('accountsChanged', []);
        expect(_onDisconnect).toHaveBeenCalledTimes(1);
    });
    test('chainChanged event should work fine', () => {
        const _onChainChanged = jest.fn();
        adapter.on('chainChanged', _onChainChanged);
        tron._emit('chainChanged', '0x383884');
        expect(_onChainChanged).toHaveBeenCalledTimes(1);
    });
});

describe('methods should work fine', () => {
    let adapter: TronLinkAdapter;
    beforeEach(() => {
        tron = new MockTron();
        window.tron = tron;
        tron._unlock();
        adapter = new TronLinkAdapter();
    });
    describe('connect() should work fine', () => {
        test('when connect successfully', async () => {
            tron.request = () => Promise.resolve(['address22']);
            await adapter.connect();
            expect(adapter.state).toEqual(AdapterState.Connected);
            expect(adapter.address).toEqual('address22');
        });
        test('when there is no wallet', async () => {
            window.tron = undefined;
            window.open = jest.fn();
            adapter = new TronLinkAdapter();
            const res = adapter.connect();
            jest.advanceTimersByTime(ONE_MINUTE);
            expect(res).rejects.toThrow(WalletNotFoundError);
            res.catch(noop).finally(() => {
                expect(window.open).toHaveBeenCalled();
            });
        });
        test('when there is already a pop-up window', async () => {
            tron.request = () => Promise.reject({ code: -32002, message: '' });
            const onError = jest.fn();
            adapter.on('error', onError);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            const res = adapter.connect();
            expect(res).rejects.toThrow(WalletConnectionError);
            expect(res).rejects.toThrow(
                'The same DApp has already initiated a request to connect to TronLink wallet, and the pop-up window has not been closed.'
            );
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
        test('when reject the request', async () => {
            tron.request = () => Promise.reject({ code: 4001, message: '' });
            const onError = jest.fn();
            adapter.on('error', onError);
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            const res = adapter.connect();
            expect(res).rejects.toThrow(WalletConnectionError);
            expect(res).rejects.toThrow('The user rejected connection.');
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
    });
    describe('signMessage() should work fine', () => {
        test('when there is not wallet', async () => {
            window.tron = undefined;
            adapter = new TronLinkAdapter();
            const onError = jest.fn();
            adapter.on('error', onError);
            jest.advanceTimersByTime(ONE_MINUTE);
            expect(adapter.signMessage('')).rejects.toThrow(WalletDisconnectedError);
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
        test('when wallet is disconnected', async () => {
            const onError = jest.fn();
            adapter.on('error', onError);
            expect(adapter.signMessage('')).rejects.toThrow(WalletDisconnectedError);
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
        test('when signMessage successfully', async () => {
            tron.request = () => Promise.resolve(['address']);
            const onError = jest.fn();
            adapter.on('error', onError);
            tron._setAddress('address');
            await adapter.connect();
            const signMessageV2: any = jest.fn(() => Promise.resolve('signedMessage'));
            (tron.tronWeb as TronWeb).trx.signMessageV2 = signMessageV2;

            const result = await adapter.signMessage('333');
            expect(signMessageV2).toHaveBeenCalled();
            expect(result).toBe('signedMessage');
            expect(onError).not.toHaveBeenCalled();
        });
        test('when signMessage with error', async () => {
            tron = new MockTron();
            window.tron = tron;
            tron._unlock();
            tron._setAddress('address');
            adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(60 * 1000);
            const onError = jest.fn();
            adapter.on('error', onError);
            const signMessageV2: any = jest.fn(() => {
                return Promise.reject('signedMessage33');
            });
            (tron.tronWeb as TronWeb).trx.signMessageV2 = signMessageV2;

            expect(adapter.signMessage('333')).rejects.toThrow('signedMessage33');
            expect(adapter.signMessage('333')).rejects.toThrow(WalletSignMessageError);
            waitFor(() => {
                expect(onError).toHaveBeenCalled();
            });
        });
    });

    describe('signTransaction() should work fine', () => {
        test('when there is not wallet', async () => {
            window.tron = undefined;
            adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(ONE_MINUTE);
            const onError = jest.fn();
            adapter.on('error', onError);
            expect(adapter.signTransaction({} as any)).rejects.toThrow(WalletDisconnectedError);
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
        test('when wallet is disconnected', async () => {
            const onError = jest.fn();
            adapter.on('error', onError);
            expect(adapter.signTransaction({} as any)).rejects.toThrow(WalletDisconnectedError);
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
        test('when signTransaction successfully', async () => {
            tron.request = () => Promise.resolve(['address']);
            const onError = jest.fn();
            adapter.on('error', onError);
            tron._setAddress('address');
            await adapter.connect();
            const sign: any = jest.fn(() => Promise.resolve('signedTransaction'));
            (tron.tronWeb as TronWeb).trx.sign = sign;

            const result = await adapter.signTransaction({} as any);
            expect(sign).toHaveBeenCalled();
            expect(result).toBe('signedTransaction');
            expect(onError).not.toHaveBeenCalled();
        });
        test('when signTransaction with error', async () => {
            tron.request = () => Promise.resolve(['address']);
            const onError = jest.fn();
            tron._setAddress('address');
            adapter = new TronLinkAdapter();
            adapter.on('error', onError);
            const sign: any = jest.fn(() => Promise.reject('signedTransaction'));
            (tron.tronWeb as TronWeb).trx.sign = sign;

            expect(adapter.signTransaction({} as any)).rejects.toThrow('signedTransaction');
            expect(adapter.signTransaction({} as any)).rejects.toThrow(WalletSignTransactionError);
            waitFor(() => {
                expect(onError).toHaveBeenCalled();
            });
        });
    });

    describe('multiSign() should work fine', () => {
        test('when there is not wallet', async () => {
            window.tron = undefined;
            adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(ONE_MINUTE);
            const onError = jest.fn();
            adapter.on('error', onError);
            expect(adapter.multiSign({} as any)).rejects.toThrow(WalletDisconnectedError);
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
        test('when wallet is disconnected', async () => {
            const onError = jest.fn();
            adapter.on('error', onError);
            expect(adapter.multiSign({} as any)).rejects.toThrow(WalletDisconnectedError);
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
        test('when multiSign successfully', async () => {
            tron.request = () => Promise.resolve(['address']);
            const onError = jest.fn();
            adapter.on('error', onError);
            tron._setAddress('address');
            await adapter.connect();
            const sign: any = jest.fn(() => Promise.resolve('signedTransaction'));
            (tron.tronWeb as TronWeb).trx.multiSign = sign;

            const result = await adapter.multiSign('1', '2', '3');
            expect(sign).toHaveBeenCalledWith('1', '2', '3');
            expect(result).toBe('signedTransaction');
            expect(onError).not.toHaveBeenCalled();
        });
        test('when multiSign with error', async () => {
            tron.request = () => Promise.resolve(['address']);
            const onError = jest.fn();
            tron._setAddress('address');
            adapter = new TronLinkAdapter();
            adapter.on('error', onError);
            const sign: any = jest.fn(() => Promise.reject('multiSign error'));
            (tron.tronWeb as TronWeb).trx.multiSign = sign;

            expect(adapter.multiSign({} as any)).rejects.toThrow('multiSign error');
            expect(adapter.multiSign({} as any)).rejects.toThrow(WalletSignTransactionError);
            waitFor(() => {
                expect(onError).toHaveBeenCalled();
            });
        });
    });

    describe('switchChain() should work fine', () => {
        test('when there is not wallet', async () => {
            window.tron = undefined;
            window.open = jest.fn();
            adapter = new TronLinkAdapter();
            const onError = jest.fn();
            adapter.on('error', onError);
            const res = adapter.switchChain('id');
            jest.advanceTimersByTime(ONE_MINUTE);
            expect(res).rejects.toThrow(WalletNotFoundError);
            adapter
                .switchChain('id')
                .catch(noop)
                .finally(() => {
                    expect(window.open).toHaveBeenCalled();
                });
            await wait();
            expect(onError).toHaveBeenCalledTimes(2);
        });
        test('when there is window.tronLink only', async () => {
            window.tron = undefined;
            window.tronLink = new MockTronLink();
            adapter = new TronLinkAdapter();
            const onError = jest.fn();
            adapter.on('error', onError);
            jest.advanceTimersByTime(3000);
            const res = adapter.switchChain('id');
            expect(res).rejects.toThrow(WalletSwitchChainError);
            expect(res).rejects.toThrow("Current version of TronLink doesn't support switch chain operation.");
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
        test('when switchChain successfully', async () => {
            tron.request = () => Promise.resolve(['999']);
            await adapter.connect();
            await adapter.switchChain('99');
            expect(true).toBeTruthy;
        });
        test('when switchChain error', async () => {
            const onError = jest.fn();
            adapter.on('error', onError);
            jest.advanceTimersByTime(300);
            tron.request = () => Promise.resolve(['999']);
            await adapter.connect();
            tron.request = () => Promise.reject({ code: 1001, message: 'errormessage' });
            const res = adapter.switchChain('id');
            expect(res).rejects.toThrow(WalletSwitchChainError);
            expect(res).rejects.toThrow('errormessage');
            await wait();
            expect(onError).toHaveBeenCalledTimes(1);
        });
    });

    describe('disconnect() should work fine', () => {
        test('when there is no wallet', async () => {
            window.tron = undefined;
            adapter = new TronLinkAdapter();
            const _onDisconnect = jest.fn();
            adapter.on('disconnect', _onDisconnect);
            await adapter.disconnect();
            expect(_onDisconnect).not.toHaveBeenCalled();
        });
        test('when there is only window.tronLink', async () => {
            window.tron = undefined;
            window.removeEventListener = jest.fn();
            window.tronLink = new MockTronLink('address');
            window.tronLink.ready = true;
            adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(3000);
            expect(adapter.state).toEqual(AdapterState.Connected);
            const _onDisconnect = jest.fn();
            adapter.on('disconnect', _onDisconnect);
            await adapter.disconnect();
            expect(window.removeEventListener).toHaveBeenCalled();
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            expect(adapter.address).toEqual(null);
            await Promise.resolve();
            expect(_onDisconnect).toHaveBeenCalled();
        });
        test('when there is window.tron', async () => {
            tron = window.tron = new MockTron('address');
            tron._unlock();
            tron.removeListener = jest.fn();
            adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            expect(adapter.state).toEqual(AdapterState.Connected);
            const _onDisconnect = jest.fn();
            adapter.on('disconnect', _onDisconnect);
            await adapter.disconnect();
            expect(tron.removeListener).toHaveBeenCalled();
            expect(adapter.state).toEqual(AdapterState.Disconnect);
            expect(adapter.address).toEqual(null);
            await Promise.resolve();
            expect(_onDisconnect).toHaveBeenCalled();
        });
    });
    describe('network() should work fine', () => {
        test('when there is no wallet', async () => {
            window.tron = undefined;
            window.tronLink = undefined;
            window.tronWeb = undefined;
            adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(ONE_MINUTE);
            const onError = jest.fn();
            adapter.on('error', onError);

            expect(adapter.network()).rejects.toThrow(WalletDisconnectedError);
            waitFor(() => {
                expect(onError).toHaveBeenCalled();
            });
        });
        test('when there is only window.tronLink', async () => {
            window.tron = undefined;
            window.removeEventListener = jest.fn();
            window.tronLink = new MockTronLink('address');
            window.tronLink.ready = true;
            adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(3000);
            const network = await adapter.network();
            expect(network.chainId).toEqual('0xcd8690dc');
        });
        test('when there is window.tron', async () => {
            tron = window.tron = new MockTron('address');
            tron._unlock();
            tron.removeListener = jest.fn();
            adapter = new TronLinkAdapter();
            jest.advanceTimersByTime(300);
            expect(adapter.state).toEqual(AdapterState.Connected);
            const network = await adapter.network();
            expect(network.chainId).toEqual('0xcd8690dc');
        });
    });
});
describe('constructor config should work fine', () => {
    let adapter: TronLinkAdapter;
    beforeEach(() => {
        window.tron = tron = new MockTron('address');
        tron._unlock();
    });
    test('config.openUrlWhenWalletNotFound should work fine', async () => {
        window.tron = undefined;
        window.open = jest.fn();
        adapter = new TronLinkAdapter({
            checkTimeout: 3000,
            openUrlWhenWalletNotFound: false,
        });
        jest.advanceTimersByTime(3000);
        try {
            await adapter.connect();
        } catch {
            //
        }
        expect(window.open).not.toHaveBeenCalled();
    });
});
