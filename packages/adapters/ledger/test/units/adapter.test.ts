import { LedgerWallet } from '../../src/LedgerWallet.js';
import { LedgerAdapter } from '../../src/adapter.js';
import {
    AdapterState,
    WalletDisconnectedError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@tronweb3/tronwallet-abstract-adapter';
import { waitFor } from '@testing-library/dom';
jest.mock('../../src/LedgerWallet.js');
function addPropertyToLedgerWallet(prop, value) {
    LedgerWallet[prop] = value;
}

const LedgerWalletKeyValues = Object.getOwnPropertyNames(LedgerWallet)
    .filter((name) => Reflect.getOwnPropertyDescriptor(LedgerWallet, name).writable)
    .reduce((acc, name) => {
        acc[name] = LedgerWallet[name];
        return acc;
    }, {});

beforeAll(() => {
    jest.useFakeTimers();
});

let navigatorGetter;

beforeEach(() => {
    // @ts-ignore
    navigatorGetter = jest.spyOn(window, 'navigator', 'get');
    navigatorGetter.mockReturnValue({
        hid: {},
    });
});

afterEach(() => {
    Object.entries(LedgerWalletKeyValues).forEach(([k, v]) => {
        LedgerWallet[k] = v;
    });
});

describe('LedgerAdapter', () => {
    test('LedgerAdapter should be defined', () => {
        expect(LedgerAdapter).toBeDefined();
    });
});
describe('constructor()', () => {
    test('constructor() should work fine', () => {
        const adapter = new LedgerAdapter();
        expect(adapter.name).toEqual('Ledger');
        expect(adapter.state).toEqual(AdapterState.Disconnect);
        expect(adapter.address).toEqual(null);
        expect(adapter.ledgerUtils).toHaveProperty('getAccounts');
        expect(adapter.ledgerUtils).toHaveProperty('getAddress');
    });
    test('constructor() params should pass to LedgerWallet', () => {
        const _constructor = jest.fn();
        addPropertyToLedgerWallet('_constructor', _constructor);
        const params = { accountNumber: 2 };
        new LedgerAdapter(params);
        expect(_constructor).toHaveBeenCalledWith(params);
    });
});
describe('connect()', () => {
    test('should work fine', async () => {
        const _connect = jest.fn();
        addPropertyToLedgerWallet('_connect', _connect);
        const onConnect = jest.fn();
        const onStateChanged = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('connect', onConnect);
        adapter.on('stateChanged', onStateChanged);
        const params = { account: { index: 1, address: 'address' } };
        await adapter.connect(params);
        expect(_connect).toHaveBeenCalledWith(params);
        expect(onConnect).toHaveBeenCalled();
        expect(onStateChanged).toHaveBeenCalled();
    });
    test('should throw error when connect() throw error', async () => {
        const _connect = jest.fn(async () => {
            throw new Error('connection error');
        });
        addPropertyToLedgerWallet('_connect', _connect);
        const onError = jest.fn();
        const adapter = new LedgerAdapter();
        expect(adapter.state).toEqual(AdapterState.Disconnect);
        adapter.on('error', onError);
        await expect(adapter.connect()).rejects.toThrow('connection error');
        waitFor(() => {
            expect(onError).toHaveBeenCalled();
        });
    });
});
describe('disconnect()', () => {
    test('should work fine', async () => {
        const _disconnect = jest.fn();
        addPropertyToLedgerWallet('_disconnect', _disconnect);
        const onDisconnect = jest.fn();
        const onStateChanged = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('disconnect', onDisconnect);
        adapter.on('stateChanged', onStateChanged);
        expect(adapter.state).toEqual(AdapterState.Disconnect);

        await adapter.connect();
        expect(adapter.state).toEqual(AdapterState.Connected);

        await adapter.disconnect();
        expect(_disconnect).toHaveBeenCalledTimes(1);
        expect(onStateChanged).toHaveBeenCalledTimes(2);
        expect(onDisconnect).toHaveBeenCalledTimes(1);
    });
    test('throw error when disconnect throw error', async () => {
        const _disconnect = jest.fn(() => {
            throw new Error('disconnection error');
        });
        addPropertyToLedgerWallet('_disconnect', _disconnect);
        const onError = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('error', onError);
        expect(adapter.state).toEqual(AdapterState.Disconnect);
        await adapter.connect();
        await expect(adapter.disconnect()).rejects.toThrow();
        waitFor(() => {
            expect(onError).toHaveBeenCalled();
        });
    });
});
describe('signMessage()', () => {
    test('should throw error when not connect ledger', async () => {
        const onError = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('error', onError);
        expect(adapter.signMessage('message')).rejects.toThrow(WalletDisconnectedError);
        expect(onError).toHaveBeenCalledTimes(1);
    });
    test('should work fine', async () => {
        const _signPersonalMessage = jest.fn(() => {
            return Promise.resolve('signed message');
        });
        addPropertyToLedgerWallet('_signPersonalMessage', _signPersonalMessage);
        const onError = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('error', onError);
        expect(adapter.state).toEqual(AdapterState.Disconnect);

        await adapter.connect();
        expect(adapter.state).toEqual(AdapterState.Connected);

        const res = await adapter.signMessage('message to sign');
        expect(res).toEqual('signed message');
        expect(_signPersonalMessage).toHaveBeenCalledTimes(1);
        expect(_signPersonalMessage).toHaveBeenCalledWith('message to sign');
    });

    test('should throw error when signMessage throw error', async () => {
        const _signPersonalMessage = jest.fn(() => {
            throw new Error('_signPersonalMessage error');
        });
        addPropertyToLedgerWallet('_signPersonalMessage', _signPersonalMessage);
        const onError = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('error', onError);
        expect(adapter.state).toEqual(AdapterState.Disconnect);
        await adapter.connect();
        await expect(adapter.signMessage('message to sign')).rejects.toThrow(WalletSignMessageError);
        await expect(adapter.signMessage('message to sign')).rejects.toThrow('_signPersonalMessage error');
        waitFor(() => {
            expect(onError).toHaveBeenCalled();
        });
    });
});

describe('signTransaction()', () => {
    test('should throw error when not connect ledger', async () => {
        const onError = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('error', onError);
        expect(adapter.signTransaction({} as any)).rejects.toThrow(WalletDisconnectedError);
        expect(onError).toHaveBeenCalledTimes(1);
    });
    test('should work fine', async () => {
        const _signTransaction = jest.fn(() => {
            return Promise.resolve('signed transaction');
        });
        addPropertyToLedgerWallet('_signTransaction', _signTransaction);
        const onError = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('error', onError);
        expect(adapter.state).toEqual(AdapterState.Disconnect);

        await adapter.connect();
        expect(adapter.state).toEqual(AdapterState.Connected);

        const res = await adapter.signTransaction({} as any);
        expect(res).toEqual('signed transaction');
        expect(_signTransaction).toHaveBeenCalledTimes(1);
        expect(_signTransaction).toHaveBeenCalledWith({});
    });

    test('should throw error when signTransaction throw error', async () => {
        const _signTransaction = jest.fn(() => {
            throw new Error('_signTransaction error');
        });
        addPropertyToLedgerWallet('_signTransaction', _signTransaction);
        const onError = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('error', onError);
        expect(adapter.state).toEqual(AdapterState.Disconnect);
        await adapter.connect();
        await expect(adapter.signTransaction({} as any)).rejects.toThrow(WalletSignTransactionError);
        await expect(adapter.signTransaction({} as any)).rejects.toThrow('_signTransaction error');
        waitFor(() => {
            expect(onError).toHaveBeenCalled();
        });
    });
});
