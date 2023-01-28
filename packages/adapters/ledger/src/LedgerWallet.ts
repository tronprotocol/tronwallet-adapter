/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Trx from '@ledgerhq/hw-app-trx';
import type Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import type { SignedTransaction, Transaction } from '@tronweb3/tronwallet-abstract-adapter';
import { openConnectingModal, openSelectAccountModal } from './Modal/openModal.js';
import type { Account } from './Modal/SelectAccount.js';
import EventEmitter from 'eventemitter3';

async function wait(timeout: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
interface WalletEvent {
    accountChanged(address: string): void;
}
export class LedgerWallet extends EventEmitter<WalletEvent> {
    private accounts: Account[];
    private app: Trx | null = null;
    private transport: Transport | null = null;
    private accountNumber: number;
    private fetchState: 'Initial' | 'Fetching' | 'Finished' = 'Initial';
    private selectedIndex = 0;
    // private latestIndex = 0;

    private _address = '';
    constructor(options: { accountNumber: number }) {
        super();
        const { accountNumber } = options;
        this.accountNumber = accountNumber;
        this.accounts = [];
    }

    get address() {
        return this._address;
    }

    async connect() {
        let closeModal: () => void;
        try {
            closeModal = openConnectingModal();
            await this.makeApp();
            const { address } = await this.app!.getAddress(this.getPathForIndex(0));
            this._address = address;
            setTimeout(() => {
                this.getAccount(0, this.accountNumber);
            }, 300);
            closeModal();
            // eslint-disable-next-line no-useless-catch
        } catch (e: any) {
            throw e;
        } finally {
            await this.cleanUp();
        }
    }
    async signPersonalMessage(message: string) {
        await this.waitForIdle();
        try {
            const index = await openSelectAccountModal({
                accounts: this.accounts,
                selectedIndex: this.selectedIndex,
                getAccount: this.getAccount,
            });
            await this.makeApp();
            const path = this.getPathForIndex(index);
            const hex = Buffer.from(message).toString('hex');
            const res = await this.app!.signPersonalMessage(path, hex);
            this.selectedIndex = index;
            this.emit('accountChanged', this.accounts[index].address);
            return res;
            // eslint-disable-next-line no-useless-catch
        } catch (e: unknown) {
            throw e;
        } finally {
            await this.cleanUp();
        }
    }
    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        await this.waitForIdle();
        try {
            const index = await openSelectAccountModal({
                accounts: this.accounts,
                selectedIndex: this.selectedIndex,
                getAccount: this.getAccount,
            });
            const path = this.getPathForIndex(index);
            await this.makeApp();
            const signedResponse = await this.app!.signTransaction(path, transaction.raw_data_hex, []);
            if (Array.isArray(transaction.signature)) {
                if (!transaction.signature.includes(signedResponse)) transaction.signature.push(signedResponse);
            } else {
                transaction.signature = [signedResponse];
            }
            return transaction as SignedTransaction;
            // eslint-disable-next-line no-useless-catch
        } catch (e: unknown) {
            throw e;
        } finally {
            await this.cleanUp();
        }
    }
    getAccount = async (from: number, to: number): Promise<Account[]> => {
        if (from < 0) {
            throw new Error('getAccount parameter error: from cannot be smaller than 0.');
        }
        if (from >= to) {
            throw new Error('getAccount parameter error: from cannot be bigger than to.');
        }
        if (this.fetchState === 'Fetching') {
            await wait(500);
            return this.getAccount(from, to);
        }
        this.fetchState = 'Fetching';

        // ledger can not get address concurrently.
        // about 13057ms to get 10 address
        await this.makeApp();
        const obj: Record<string, Account> = {};
        for (let i = from; i < to; i++) {
            const account = await this.getAddress(i);
            obj[account.index] = account;
        }
        Object.keys(obj).forEach((key) => {
            this.accounts[+key] = obj[key];
        });
        this.fetchState = 'Finished';
        this.cleanUp();
        return this.accounts.slice(from, to);
    };

    private async getAddress(index: number) {
        const path = this.getPathForIndex(index);
        try {
            const { address } = await this.app!.getAddress(path);
            return {
                path,
                address,
                index,
            };
        } catch (e: any) {
            return {
                path,
                address: '',
                index,
                isValid: false,
                balance: 0,
            };
        }
    }

    private async waitForIdle() {
        if (this.fetchState === 'Fetching') {
            await wait(300);
            await this.waitForIdle();
        }
    }
    private getPathForIndex(index: number) {
        return `44'/195'/${index}'/0/0`;
    }
    private async makeApp() {
        if (this.transport && this.app) {
            return;
        }
        this.transport = await TransportWebHID.create();
        this.app = new Trx(this.transport);
    }

    private async cleanUp() {
        this.app = null as any;
        await this.transport?.close();
        this.transport = null as any;
    }
}
