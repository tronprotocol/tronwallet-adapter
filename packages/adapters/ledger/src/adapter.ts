import {
    Adapter,
    AdapterState,
    isInBrowser,
    WalletNotFoundError,
    WalletDisconnectedError,
    WalletSignMessageError,
    WalletSignTransactionError,
    WalletConnectionError,
} from '@tronweb3/tronwallet-abstract-adapter';

import type { Transaction, SignedTransaction, AdapterName } from '@tronweb3/tronwallet-abstract-adapter';
import { LedgerWallet } from './LedgerWallet.js';

const isSupportedLedger = () => !!(globalThis.navigator && (globalThis.navigator as any).hid);

export interface LedgerAdapterConfig {
    accountNumber: number;
}

export const LedgerAdapterName = 'Ledger' as AdapterName<'Ledger'>;

export class LedgerAdapter extends Adapter {
    name = LedgerAdapterName;
    url = 'https://github.com/LedgerHQ';
    icon =
        'data:image/png;base64,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';

    private _config;
    private _state: AdapterState = AdapterState.NotFound;
    private _connecting: boolean;
    private _address: string | null;

    private _wallet: LedgerWallet;
    constructor(config: LedgerAdapterConfig) {
        super();
        this._config = config;
        this._connecting = false;
        this._address = null;
        this._wallet = new LedgerWallet({
            accountNumber: this._config.accountNumber,
        });
        if (isSupportedLedger()) {
            this._state = AdapterState.Disconnect;
        }
    }

    get address() {
        return this._address;
    }

    get state() {
        return this._state;
    }

    get connecting() {
        return this._connecting;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this.state === AdapterState.NotFound) {
                isInBrowser() && window.open(this.url, '_blank');
                throw new WalletNotFoundError();
            }
            this._connecting = true;
            try {
                await this._wallet.connect();
            } catch (e: any) {
                if (e.message?.includes('Incorrect length (0x6700)')) {
                    // This error code usually means that users don't have the right application opened on device
                    // see here  https://www.reddit.com/r/ledgerwallet/comments/mxcxo3/can_someone_help_with_the_problem_ledger_device/
                    throw new WalletConnectionError('Please prepare your ledger and enter Tron app.');
                }
                throw new WalletConnectionError(`${e.message}.`);
            }
            this._address = this._wallet.address;
            this._state = AdapterState.Connected;
            this.emit('connect', this.address || '');
            this.emit('stateChanged', this._state);
            this._wallet.on('accountChanged', this._changeAccount);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (this.state !== AdapterState.Connected) {
            return;
        }
        try {
            this._state = AdapterState.Disconnect;
            this._address = null;
            this.emit('disconnect');
            this.emit('stateChanged', this._state);
            this._wallet.off('accountChanged', this._changeAccount);
        } catch (e: any) {
            throw new WalletDisconnectedError(e.message);
        }
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        try {
            if (this.state !== AdapterState.Connected) {
                throw new WalletDisconnectedError();
            }
            try {
                const signedTransaction = await this._wallet.signTransaction(transaction);
                return signedTransaction;
            } catch (e: any) {
                throw new WalletSignTransactionError(e.message);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: string): Promise<string> {
        try {
            if (this.state !== AdapterState.Connected) {
                throw new WalletDisconnectedError();
            }
            try {
                const signedResponse = await this._wallet.signPersonalMessage(message);
                return signedResponse;
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }
    private _changeAccount = (address: string) => {
        this._address = address;
        this.emit('accountsChanged', address);
    };
}
