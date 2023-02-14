import { LedgerWallet } from '../../src/LedgerWallet.js';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import type { Account } from 'src/LedgerWallet.js';
import { LedgerAdapter } from '../../src/adapter.js';
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

async function selectAccount(params: { accounts: Account[] }) {
    return Promise.resolve(params.accounts[0]);
}
beforeAll(() => {
    jest.useFakeTimers();
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
describe.skip('connect()', () => {
    test('connect() should work fine', async () => {
        const _connnect = jest.fn();
        addPropertyToLedgerWallet('_connect', _connnect);
        const onConnect = jest.fn();
        const onStateChanged = jest.fn();
        const adapter = new LedgerAdapter();
        adapter.on('connect', onConnect);
        adapter.on('stateChanged', onStateChanged);
        const params = { account: { index: 1, address: 'address' } };
        await adapter.connect(params);
        expect(_connnect).toHaveBeenCalledWith(params);
        expect(onConnect).toHaveBeenCalled();
        expect(onStateChanged).toHaveBeenCalled();
    });
});
