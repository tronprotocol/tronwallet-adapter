import Trx from '@ledgerhq/hw-app-trx';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import { LedgerWallet } from '../../src/LedgerWallet.js';
import type { Account } from '../../src/LedgerWallet.js';
import '@testing-library/jest-dom';

function addPropertyToTrx(prop, value) {
    Trx[prop] = value;
}
function addPropertyToTransport(prop, value) {
    TransportWebHID[prop] = value;
}
const TrxKeyValues = Object.getOwnPropertyNames(Trx)
    .filter((name) => Reflect.getOwnPropertyDescriptor(Trx, name).writable)
    .reduce((acc, name) => {
        acc[name] = Trx[name];
        return acc;
    }, {});

async function selectAccount(params: { accounts: Account[] }) {
    return Promise.resolve(params.accounts[0]);
}
beforeAll(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    Object.entries(TrxKeyValues).forEach(([k, v]) => {
        Trx[k] = v;
    });
});

describe('ledgerWalelt should work fine', () => {
    test('LedgerWallet should be defined', () => {
        expect(LedgerWallet).toBeDefined();
    });
    test('connect() should work fine when connect with specified account', async () => {
        const wallet = new LedgerWallet({});
        await wallet.connect({ account: { address: 'address', index: 2 } });
        expect(wallet.address).toEqual('address');
    });
    test('connect() should work fine when getAddress() is ok', async () => {
        addPropertyToTrx('_getAddress', function () {
            return new Promise((resolve) => {
                resolve({ address: 'address', publicKey: 'publicKey' });
            });
        });
        const close = jest.fn();
        addPropertyToTransport('_close', close);
        const wallet = new LedgerWallet({});
        wallet.connect();
        await waitFor(() => {
            const modalContentEl = screen.queryByTestId('select-account-content');
            expect(modalContentEl).toBeInTheDocument();
        });
        const confirmBtnEl = screen.queryByTestId('btn-confirm');
        fireEvent.click(confirmBtnEl);
        await waitFor(() => {
            expect(wallet.address).toEqual('address');
        });
        expect(close).toHaveBeenCalledTimes(2);
    });
    test('connect() should work fine when getAddress() throw error', async () => {
        addPropertyToTrx('_getAddress', function () {
            return new Promise((resolve, reject) => {
                reject(new Error('Errored'));
            });
        });
        addPropertyToTransport('_close', jest.fn());
        const wallet = new LedgerWallet({ selectAccount });
        expect(wallet.connect()).rejects.toThrow('Errored');
        await waitFor(() => {
            expect((TransportWebHID as any)._close).toHaveBeenCalledTimes(1);
        });
    });
});
describe('constructor config.accountNumber should work fine', () => {
    let _getAddress;
    beforeEach(() => {
        _getAddress = jest.fn(() => {
            return Promise.resolve({
                address: 'address',
                index: 1,
            });
        });
    });
    test('invalid account should throw error', async () => {
        expect(function () {
            new LedgerWallet({ accountNumber: 4.4 });
        }).toThrowError('[Ledger]: accountNumber should be an integer!');
    });
    test('test0', async () => {
        addPropertyToTrx('_getAddress', _getAddress);
        const wallet = new LedgerWallet({ accountNumber: 2, selectAccount });
        await wallet.connect();
        expect(_getAddress).toHaveBeenCalledTimes(2);
    });
    test('test1', async () => {
        addPropertyToTrx('_getAddress', _getAddress);
        const wallet = new LedgerWallet({ accountNumber: 4, selectAccount });
        await wallet.connect();
        expect(_getAddress).toHaveBeenCalledTimes(4);
    });
});

describe('constructor config.getDerivationPath should work fine', () => {
    test('invalid getDerivationPath should throw error', async () => {
        expect(function () {
            new LedgerWallet({ getDerivationPath: {} as any });
        }).toThrowError('[Ledger]: getDerivationPath must be a function!');
    });
    test('valid getDerivationPath should work fine', async () => {
        const getDerivationPath = jest.fn();
        const wallet = new LedgerWallet({ getDerivationPath, accountNumber: 3, selectAccount });
        await wallet.connect();
        expect(getDerivationPath).toHaveBeenCalledTimes(3);
        expect(getDerivationPath).toHaveBeenLastCalledWith(2);
    });
});

describe('constructor config.beforeConnect should work fine', () => {
    test('invalid beforeConnect should throw error', async () => {
        expect(function () {
            new LedgerWallet({ beforeConnect: {} as any });
        }).toThrowError('[Ledger]: beforeConnect must be a function!');
    });
    test('valid beforeConnect should work fine', async () => {
        const beforeConnect = jest.fn();
        const wallet = new LedgerWallet({ beforeConnect, selectAccount });
        await wallet.connect();
        expect(beforeConnect).toHaveBeenCalledTimes(1);
    });
});

describe('constructor config.selectAccount should work fine', () => {
    test('invalid selectAccount should throw error', async () => {
        expect(function () {
            new LedgerWallet({ selectAccount: {} as any });
        }).toThrowError('[Ledger]: selectAccount must be a function!');
    });
    test('valid selectAccount should work fine', async () => {
        const _getAddress = jest.fn(() => {
            return {
                address: 'address',
                publicKey: 'publicKey',
            };
        });
        addPropertyToTrx('_getAddress', _getAddress);
        let accounts: any,
            legerUtils: any = null;
        const selectAccount = jest.fn(async ({ accounts: a, ledgerUtils: l }) => {
            accounts = a;
            legerUtils = l;

            await l.getAddress(2, true);
            return Promise.resolve({
                index: 22,
                address: 'address22',
                path: 'path22',
            });
        });
        const wallet = new LedgerWallet({ selectAccount });
        await wallet.connect();
        expect(selectAccount).toHaveBeenCalledTimes(1);
        expect(accounts.length).toEqual(1);
        expect(legerUtils).not.toBeNull();
        expect(legerUtils.getAccounts).not.toBeNull();
        expect(legerUtils.verifyAddress).not.toBeNull();

        expect(_getAddress).toHaveBeenCalledTimes(2);
        expect(_getAddress).toHaveBeenLastCalledWith("44'/195'/2'/0/0", true);
    });
});

describe('public properties should work fine', () => {
    test('getAccounts() should work fine', async () => {
        const _getAddress = jest.fn(() => {
            return {
                address: 'address',
                publicKey: 'publicKey',
            };
        });
        addPropertyToTrx('_getAddress', _getAddress);
        const wallet = new LedgerWallet();
        await wallet.getAccounts(0, 2);
        expect(_getAddress).toHaveBeenCalledTimes(2);
        expect(_getAddress).toHaveBeenLastCalledWith("44'/195'/1'/0/0", false);
    });
    test('getAddress() should work fine', async () => {
        const _getAddress = jest.fn(() => {
            return {
                address: 'address',
                publicKey: 'publicKey',
            };
        });
        addPropertyToTrx('_getAddress', _getAddress);
        const wallet = new LedgerWallet();
        await wallet.getAddress(3, true);
        expect(_getAddress).toHaveBeenCalledTimes(1);
        expect(_getAddress).toHaveBeenLastCalledWith("44'/195'/3'/0/0", true);
    });
});

describe('disconnect() should work fine', () => {
    test('test0', async () => {
        const wallet = new LedgerWallet({ selectAccount });
        await wallet.connect();
        expect(wallet.address).toEqual('testaddress');
        await wallet.disconnect();
        expect(wallet.address).toEqual('');
    });
});

describe('signMessage() should work fine', () => {
    test('should work fine when ledger is ok', async () => {
        const _signMessage = jest.fn(() => {
            return Promise.resolve('result');
        });
        addPropertyToTrx('_signPersonalMessage', _signMessage);

        const wallet = new LedgerWallet({ selectAccount });
        await wallet.connect();
        expect(wallet.address).toEqual('testaddress');
        const res = await wallet.signPersonalMessage('messagetosign');
        expect(res).toEqual('result');
        expect(_signMessage).toHaveBeenCalledTimes(1);
        expect(_signMessage).toHaveBeenLastCalledWith(
            `44'/195'/${0}'/0/0`,
            Buffer.from('messagetosign').toString('hex')
        );
    });
    test('should throw error when ledger can not sign', async () => {
        const _signMessage = jest.fn(async () => {
            return Promise.reject(new Error('error'));
        });
        addPropertyToTrx('_signPersonalMessage', _signMessage);

        const wallet = new LedgerWallet({ selectAccount });
        await wallet.connect();
        expect(wallet.address).toEqual('testaddress');
        expect(wallet.signPersonalMessage('messagetosign')).rejects.toThrow(Error);
    });
});

describe('signTransaction() should work fine', () => {
    test('should work fine when ledger is ok', async () => {
        const _signTransaction = jest.fn(() => {
            return Promise.resolve('result');
        });
        addPropertyToTrx('_signTransaction', _signTransaction);

        const wallet = new LedgerWallet({ selectAccount });
        await wallet.connect();
        expect(wallet.address).toEqual('testaddress');
        const res = await wallet.signTransaction({ raw_data_hex: 'rawhex', signature: [] } as any);
        expect(res).toEqual({ raw_data_hex: 'rawhex', signature: ['result'] });
        expect(_signTransaction).toHaveBeenCalledTimes(1);
        expect(_signTransaction).toHaveBeenLastCalledWith(`44'/195'/${0}'/0/0`, 'rawhex', []);
    });
    test('should throw error when ledger can not sign', async () => {
        const _signTransaction = jest.fn(async () => {
            return Promise.reject(new Error('error'));
        });
        addPropertyToTrx('_signTransaction', _signTransaction);

        const wallet = new LedgerWallet({ selectAccount });
        await wallet.connect();
        expect(wallet.address).toEqual('testaddress');
        expect(wallet.signTransaction({} as any)).rejects.toThrow(Error);
    });
});
