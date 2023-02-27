/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Trx from '@ledgerhq/hw-app-trx';
import type Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import type { BaseAdapterConfig, SignedTransaction, Transaction } from '@tronweb3/tronwallet-abstract-adapter';
import { openConnectingModal, openSelectAccountModal, openVerifyAddressModal } from './Modal/openModal.js';

async function wait(timeout: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
function isFunction(fn: unknown) {
    return typeof fn === 'function';
}

export type SelectAccount = (params: { accounts: Account[]; ledgerUtils: LedgerUtils }) => Promise<Account>;

export interface LedgerWalletConfig extends BaseAdapterConfig {
    /**
     * Initial total accounts to get once connection is created, default is 1
     */
    accountNumber?: number;
    /**
     * Hook function to call before connecting to ledger and geting accounts.
     * By default, a modal will popup to reminder user to prepare the ledger and enter Tron app.
     * You can specify a function to disable this modal.
     */
    beforeConnect?: () => Promise<unknown> | unknown;
    /**
     * Hook function to call after connecting to ledger and geting initial accounts.
     * The function should return the selected account including the index of account.
     * Following operations such as `signMessage` will use the selected account.
     */
    selectAccount?: SelectAccount;

    /**
     * Function to get derivate BIP44 path by index.
     * Default is `44'/195'/${index}'/0/0`
     */
    getDerivationPath?: (index: number) => string;
}
/**
 * getAccounts from Ledger
 */
export type GetAccounts = (from: number, to: number) => Promise<Account[]>;

export type Account = {
    /**
     * The index to get BIP44 path.
     */
    index: number;
    /**
     * The BIP44 path to derivate address.
     */
    path: string;
    /**
     * The derivated address.
     */
    address: string;
};
export interface LedgerUtils {
    /**
     * Get accounts from ledger by index. `from` is included and `to` is excluded.
     * User can use the function to load more accounts.
     */
    getAccounts: GetAccounts;
    /**
     * Request to get an address with specified index using getDerivationPath(index) to get BIP44 path.
     * If `display` is true, will request user to approve on ledger.
     * The promise will resove if user approve and reject if user cancel the operation.
     */
    getAddress: (index: number, display: boolean) => Promise<{ publicKey: string; address: string }>;
}

const defaultSelectAccount: SelectAccount = async function ({ accounts, ledgerUtils }) {
    const account = await openSelectAccountModal({
        accounts,
        getAccounts: ledgerUtils.getAccounts,
    });
    const closeConfirm = openVerifyAddressModal(account.address);
    try {
        await ledgerUtils.getAddress(account.index, true);
    } finally {
        closeConfirm?.();
    }

    return account;
};
export class LedgerWallet {
    private accounts: Account[];
    private app: Trx | null = null;
    private transport: Transport | null = null;
    private fetchState: 'Initial' | 'Fetching' | 'Finished' = 'Initial';
    private selectedIndex = 0;
    private config: LedgerWalletConfig;

    private _address = '';
    constructor(config: LedgerWalletConfig = {}) {
        this.accounts = [];
        const { accountNumber = 1 } = config;
        (['beforeConnect', 'selectAccount', 'getDerivationPath'] as (keyof LedgerWalletConfig)[]).forEach((func) => {
            if (config[func] && !isFunction(config[func])) {
                throw new Error(`[Ledger]: ${func} must be a function!`);
            }
        });

        if (accountNumber && !Number.isInteger(+accountNumber)) {
            throw new Error('[Ledger]: accountNumber must be an integer!');
        }
        this.config = {
            ...config,
            accountNumber,
        };
    }

    get address() {
        return this._address;
    }

    async connect(options?: { account: Omit<Account, 'path'> }) {
        if (options?.account && typeof options.account === 'object') {
            const account = options.account;
            this.selectedIndex = +account.index;
            this._address = account.address;
            if (account.index === undefined || account.address === undefined) {
                console.warn(
                    '[LedgerWallet] account parameter passed to connect() should have valid index and address property'
                );
            }
            return;
        }
        const ledgerUtils = {
            getAccounts: this.getAccounts,
            getAddress: this.getAddress,
        };
        this.accounts = [];
        this._address = '';
        this.selectedIndex = 0;
        const { accountNumber = 1, beforeConnect, selectAccount = defaultSelectAccount } = this.config;

        let closeConnectingModal: (() => void) | null = null;
        try {
            if (beforeConnect) {
                await beforeConnect();
            } else {
                closeConnectingModal = openConnectingModal();
            }
            await this.makeApp();

            const firstAccount = await this.getAccount(0);
            this.accounts[0] = firstAccount;

            await this.cleanUp();
            if (accountNumber > 1) {
                await this.getAccounts(1, accountNumber);
            }
            closeConnectingModal?.();
            const accounts = this.accounts.slice(0, accountNumber);
            const selectedAccount = await selectAccount!({
                accounts,
                ledgerUtils,
            });

            this.selectedIndex = selectedAccount.index;
            this._address = selectedAccount.address;
        } finally {
            await this.cleanUp();
        }
    }
    disconnect() {
        this.selectedIndex = 0;
        this._address = '';
    }
    async signPersonalMessage(message: string) {
        await this.waitForIdle();
        try {
            const index = this.selectedIndex;
            await this.makeApp();
            const path = this.getPathForIndex(index);
            const hex = Buffer.from(message).toString('hex');
            const res = await this.app!.signPersonalMessage(path, hex);
            return res;
        } finally {
            await this.cleanUp();
        }
    }
    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        await this.waitForIdle();
        try {
            const index = this.selectedIndex;
            const path = this.getPathForIndex(index);
            await this.makeApp();
            let signedResponse;
            try {
                signedResponse = await this.app!.signTransaction(path, transaction.raw_data_hex, []);
            } catch (e: any) {
                if (/Too many bytes to encode/.test(e.message)) {
                    signedResponse = await this.app!.signTransactionHash(path, transaction.txID);
                } else {
                    throw e;
                }
            }
            if (Array.isArray(transaction.signature)) {
                if (!transaction.signature.includes(signedResponse)) transaction.signature.push(signedResponse);
            } else {
                transaction.signature = [signedResponse];
            }
            return transaction as SignedTransaction;
        } finally {
            await this.cleanUp();
        }
    }
    getAccounts = async (from: number, to: number): Promise<Account[]> => {
        if (from < 0) {
            throw new Error('getAccount parameter error: from cannot be smaller than 0.');
        }
        if (from >= to) {
            throw new Error('getAccount parameter error: from cannot be bigger than to.');
        }
        if (this.fetchState === 'Fetching') {
            await wait(500);
            return this.getAccounts(from, to);
        }
        this.fetchState = 'Fetching';

        // ledger can not get address concurrently.
        await this.makeApp();
        try {
            const obj: Record<string, Account> = {};
            for (let i = from; i < to; i++) {
                const account = await this.getAccount(i);
                obj[account.index] = account;
            }
            Object.keys(obj).forEach((key) => {
                this.accounts[+key] = obj[key];
            });
            return this.accounts.slice(from, to);
        } finally {
            this.fetchState = 'Initial';
            await this.cleanUp();
        }
    };

    public getAddress = async (index: number, display = false): Promise<{ publicKey: string; address: string }> => {
        try {
            const path = this.getPathForIndex(index);
            await this.makeApp();
            return await this.app!.getAddress(path, display);
        } finally {
            await this.cleanUp();
        }
    };

    private async getAccount(index: number) {
        const path = this.getPathForIndex(index);
        const { address } = await this.app!.getAddress(path);
        return {
            path,
            address,
            index,
        };
    }

    private async waitForIdle() {
        if (this.fetchState === 'Fetching') {
            await wait(300);
            await this.waitForIdle();
        }
    }
    private getPathForIndex(index: number) {
        return this.config.getDerivationPath ? this.config.getDerivationPath(index) : `44'/195'/${index}'/0/0`;
    }
    private async makeApp() {
        if (this.transport && this.app) {
            return;
        }
        this.transport = await TransportWebHID.create();
        this.app = new Trx(this.transport);
    }

    private async cleanUp() {
        this.app = null as unknown as Trx;
        await this.transport?.close();
        this.transport = null as unknown as Transport;
    }
}
