import {
    Adapter,
    AdapterState,
    isInBrowser,
    WalletReadyState,
    WalletSignMessageError,
    WalletNotFoundError,
    WalletDisconnectedError,
    WalletSignTransactionError,
    WalletConnectionError,
    WalletGetNetworkError,
} from '@tronweb3/tronwallet-abstract-adapter';
import { getNetworkInfoByTronWeb } from '@tronweb3/tronwallet-adapter-tronlink';
import type { TronLinkWallet } from '@tronweb3/tronwallet-adapter-tronlink';
import type {
    Transaction,
    SignedTransaction,
    AdapterName,
    BaseAdapterConfig,
    Network,
} from '@tronweb3/tronwallet-abstract-adapter';
import { supportBitKeep } from './utils.js';

export interface BitKeepAdapterConfig extends BaseAdapterConfig {
    /**
     * Timeout in millisecond for checking if BitKeep is supported.
     * Default is 2 * 1000ms
     */
    checkTimeout?: number;
}

export const BitKeepAdapterName = 'BitKeep' as AdapterName<'BitKeep'>;

export class BitKeepAdapter extends Adapter {
    name = BitKeepAdapterName;
    url = 'https://bitkeep.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiM3NTI0RjkiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMDIgNDUuNjAyN1Y0OS44MjA0QzEwMi4wMDEgNTAuMjI4MyAxMDEuODkzIDUwLjYyOTIgMTAxLjY4NyA1MC45ODI3QzEwMS40ODEgNTEuMzM2MSAxMDEuMTg1IDUxLjYyOTYgMTAwLjgyOCA1MS44MzM1TDg3LjA5MDggNTkuNjgwMUw5OS4zNjMzIDY2LjY3MUMxMDAuMTY1IDY3LjEyOTUgMTAwLjgzMSA2Ny43ODkyIDEwMS4yOTQgNjguNTgzNkMxMDEuNzU3IDY5LjM3OCAxMDIuMDAxIDcwLjI3OTEgMTAyIDcxLjE5NjJWODIuNDQyNEMxMDIuMDAxIDgzLjM2IDEwMS43NTggODQuMjYxNyAxMDEuMjk1IDg1LjA1NjdDMTAwLjgzMiA4NS44NTE2IDEwMC4xNjYgODYuNTExNyA5OS4zNjMzIDg2Ljk3MDVMNjcuMDg2OSAxMDUuM0M2Ni4yODUzIDEwNS43NTkgNjUuMzc1OSAxMDYgNjQuNDUwMiAxMDZDNjMuNTI0NSAxMDYgNjIuNjE1MSAxMDUuNzU5IDYxLjgxMzUgMTA1LjNMNTEuMjUyIDk5LjI2MTFDNTEuMDczNyA5OS4xNTkzIDUwLjkyNTYgOTkuMDEyOCA1MC44MjI3IDk4LjgzNjNDNTAuNzE5OCA5OC42NTk5IDUwLjY2NTYgOTguNDU5NyA1MC42NjU2IDk4LjI1NkM1MC42NjU2IDk4LjA1MjIgNTAuNzE5OCA5Ny44NTIgNTAuODIyNyA5Ny42NzU2QzUwLjkyNTYgOTcuNDk5MSA1MS4wNzM3IDk3LjM1MjcgNTEuMjUyIDk3LjI1MDhMODYuMTE1MiA3Ny4zODM1Qzg2LjIwNCA3Ny4zMzI1IDg2LjI3NzcgNzcuMjU5MyA4Ni4zMjkgNzcuMTcxMkM4Ni4zODAyIDc3LjA4MzIgODYuNDA3MiA3Ni45ODMzIDg2LjQwNzIgNzYuODgxN0M4Ni40MDcyIDc2Ljc4IDg2LjM4MDIgNzYuNjgwMiA4Ni4zMjkgNzYuNTkyMUM4Ni4yNzc3IDc2LjUwNCA4Ni4yMDQgNzYuNDMwOCA4Ni4xMTUyIDc2LjM3OThMNzMuMTcxOSA2OC45NzcxQzcyLjgxNTYgNjguNzczNCA3Mi40MTE0IDY4LjY2NjIgNzIgNjguNjY2MkM3MS41ODg2IDY4LjY2NjIgNzEuMTg0NCA2OC43NzM0IDcwLjgyODEgNjguOTc3MUwzNS40MTcgODkuMTcyMkMzNS4xNDk4IDg5LjMyNSAzNC44NDY3IDg5LjQwNTQgMzQuNTM4MSA4OS40MDU0QzM0LjIyOTUgODkuNDA1NCAzMy45MjY0IDg5LjMyNSAzMy42NTkyIDg5LjE3MjJMMjkuNjQ4NCA4Ni45MDA5QzI4Ljg0MjQgODYuNDQyOCAyOC4xNzI5IDg1Ljc4MiAyNy43MDc4IDg0Ljk4NTNDMjcuMjQyNyA4NC4xODg2IDI2Ljk5ODUgODMuMjg0MyAyNyA4Mi4zNjQxVjc3Ljc2NjRDMjYuOTk5OCA3Ny40NjA3IDI3LjA4MDkgNzcuMTYwMyAyNy4yMzUyIDc2Ljg5NTVDMjcuMzg5NSA3Ni42MzA3IDI3LjYxMTUgNzYuNDEwOSAyNy44Nzg5IDc2LjI1OEw3OC42NTA0IDQ3LjM2OTNDNzguNzM5MiA0Ny4zMTgzIDc4LjgxMjkgNDcuMjQ1MSA3OC44NjQxIDQ3LjE1N0M3OC45MTU0IDQ3LjA2ODkgNzguOTQyMyA0Ni45NjkxIDc4Ljk0MjMgNDYuODY3NEM3OC45NDIzIDQ2Ljc2NTggNzguOTE1NCA0Ni42NjU5IDc4Ljg2NDEgNDYuNTc3OUM3OC44MTI5IDQ2LjQ4OTggNzguNzM5MiA0Ni40MTY2IDc4LjY1MDQgNDYuMzY1Nkw2NS42ODY1IDM4LjkzNjdDNjUuMzMwMiAzOC43MzMxIDY0LjkyNjEgMzguNjI1OCA2NC41MTQ2IDM4LjYyNThDNjQuMTAzMiAzOC42MjU4IDYzLjY5OTEgMzguNzMzMSA2My4zNDI4IDM4LjkzNjdMMjguNzU3OCA1OC42M0MyOC41Nzk4IDU4LjczMTggMjguMzc3OCA1OC43ODU0IDI4LjE3MjIgNTguNzg1NUMyNy45NjY2IDU4Ljc4NTUgMjcuNzY0NiA1OC43MzIgMjcuNTg2NSA1OC42MzAzQzI3LjQwODQgNTguNTI4NiAyNy4yNjA0IDU4LjM4MjMgMjcuMTU3NSA1OC4yMDYxQzI3LjA1NDUgNTguMDI5OSAyNy4wMDAyIDU3LjgzIDI3IDU3LjYyNjRWNDUuNTQ3NkMyNi45OTg5IDQ0LjYzIDI3LjI0MiA0My43MjgzIDI3LjcwNDkgNDIuOTMzNEMyOC4xNjc4IDQyLjEzODQgMjguODM0MSA0MS40NzgzIDI5LjYzNjcgNDEuMDE5NUw2MS45MDcyIDIyLjY5NTRDNjIuNzA3MSAyMi4yMzk4IDYzLjYxMzggMjIgNjQuNTM2NiAyMkM2NS40NTk0IDIyIDY2LjM2NjEgMjIuMjM5OCA2Ny4xNjYgMjIuNjk1NEw5OS4zNjMzIDQxLjA4MzNDMTAwLjE2NSA0MS41NDE0IDEwMC44MyA0Mi4yMDAxIDEwMS4yOTMgNDIuOTkzNEMxMDEuNzU2IDQzLjc4NjcgMTAyIDQ0LjY4NjYgMTAyIDQ1LjYwMjdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

    config: Required<BitKeepAdapterConfig>;
    private _readyState: WalletReadyState = WalletReadyState.Loading;
    private _state: AdapterState = AdapterState.Loading;
    private _connecting: boolean;
    private _wallet: TronLinkWallet | null;
    private _address: string | null;

    constructor(config: BitKeepAdapterConfig = {}) {
        super();
        const { checkTimeout = 2 * 1000, openUrlWhenWalletNotFound = true } = config;
        if (typeof checkTimeout !== 'number') {
            throw new Error('[BitKeepAdapter] config.checkTimeout should be a number');
        }
        this.config = {
            checkTimeout,
            openUrlWhenWalletNotFound,
        };
        this._connecting = false;
        this._wallet = null;
        this._address = null;

        if (!isInBrowser()) {
            this._readyState = WalletReadyState.NotFound;
            this.setState(AdapterState.NotFound);
            return;
        }
        if (supportBitKeep()) {
            this._readyState = WalletReadyState.Found;
            this._updateWallet();
        } else {
            this._checkWallet().then(() => {
                if (this.connected) {
                    this.emit('connect', this.address || '');
                }
            });
        }
    }

    get address() {
        return this._address;
    }

    get state() {
        return this._state;
    }
    get readyState() {
        return this._readyState;
    }

    get connecting() {
        return this._connecting;
    }

    /**
     * Get network information.
     * @returns {Network} Current network information.
     */
    async network(): Promise<Network> {
        try {
            await this._checkWallet();
            if (this.state !== AdapterState.Connected) throw new WalletDisconnectedError();
            const wallet = this._wallet;
            if (!wallet || !wallet.tronWeb) throw new WalletDisconnectedError();
            try {
                return await getNetworkInfoByTronWeb(wallet.tronWeb);
            } catch (e: any) {
                throw new WalletGetNetworkError(e?.message, e);
            }
        } catch (e: any) {
            this.emit('error', e);
            throw e;
        }
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            await this._checkWallet();
            if (this.readyState === WalletReadyState.NotFound) {
                if (this.config.openUrlWhenWalletNotFound !== false && isInBrowser()) {
                    window.open(this.url, '_blank');
                }
                throw new WalletNotFoundError();
            }
            const wallet = this._wallet as TronLinkWallet;
            if (!wallet) return;
            this._connecting = true;
            try {
                await wallet.request({ method: 'tron_requestAccounts' });
            } catch (e: any) {
                throw new WalletConnectionError(e.message);
            }
            const address = wallet.tronWeb.defaultAddress?.base58 || '';
            this.setAddress(address);
            this.setState(AdapterState.Connected);
            this.emit('connect', this.address || '');
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
        this.setAddress(null);
        this.setState(AdapterState.Disconnect);
        this.emit('disconnect');
    }

    async signTransaction(transaction: Transaction, privateKey?: string): Promise<SignedTransaction> {
        try {
            const wallet = await this.checkAndGetWallet();

            try {
                return await wallet.tronWeb.trx.sign(transaction, privateKey);
            } catch (error: any) {
                if (error instanceof Error) {
                    throw new WalletSignTransactionError(error.message, error);
                } else {
                    throw new WalletSignTransactionError(error, new Error(error));
                }
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async multiSign(...args: any[]): Promise<SignedTransaction> {
        try {
            const wallet = await this.checkAndGetWallet();
            try {
                return await wallet.tronWeb.trx.multiSign(...args);
            } catch (error: any) {
                if (error instanceof Error) {
                    throw new WalletSignTransactionError(error.message, error);
                } else {
                    throw new WalletSignTransactionError(error, new Error(error));
                }
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: string, privateKey?: string): Promise<string> {
        try {
            const wallet = await this.checkAndGetWallet();
            try {
                return await wallet.tronWeb.trx.signMessageV2(message, privateKey);
            } catch (error: any) {
                if (error instanceof Error) {
                    throw new WalletSignMessageError(error.message, error);
                } else {
                    throw new WalletSignMessageError(error, new Error(error));
                }
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private async checkAndGetWallet() {
        await this._checkWallet();
        if (!this.connected) throw new WalletDisconnectedError();
        const wallet = this._wallet;
        if (!wallet || !wallet.tronWeb) throw new WalletDisconnectedError();
        return wallet as TronLinkWallet;
    }

    private checkReadyInterval: ReturnType<typeof setInterval> | null = null;
    private checkForWalletReady() {
        if (this.checkReadyInterval) {
            return;
        }
        let times = 0;
        const maxTimes = Math.floor(this.config.checkTimeout / 200);
        const check = () => {
            if (window?.tronWeb?.ready) {
                this.checkReadyInterval && clearInterval(this.checkReadyInterval);
                this.checkReadyInterval = null;
                this._updateWallet();
                this.emit('connect', this.address || '');
            } else if (times > maxTimes) {
                this.checkReadyInterval && clearInterval(this.checkReadyInterval);
                this.checkReadyInterval = null;
            } else {
                times++;
            }
        };
        this.checkReadyInterval = setInterval(check, 200);
    }

    private _checkPromise: Promise<boolean> | null = null;
    /**
     * check if wallet exists by interval, the promise only resolve when wallet detected or timeout
     * @returns if wallet exists
     */
    private _checkWallet(): Promise<boolean> {
        if (this.readyState === WalletReadyState.Found) {
            return Promise.resolve(true);
        }
        if (this._checkPromise) {
            return this._checkPromise;
        }
        const interval = 100;
        const maxTimes = Math.floor(this.config.checkTimeout / interval);
        let times = 0,
            timer: ReturnType<typeof setInterval>;
        this._checkPromise = new Promise((resolve) => {
            const check = () => {
                times++;
                const isSupport = supportBitKeep();
                if (isSupport || times > maxTimes) {
                    timer && clearInterval(timer);
                    this._readyState = isSupport ? WalletReadyState.Found : WalletReadyState.NotFound;
                    this._updateWallet();
                    this.emit('readyStateChanged', this.readyState);
                    resolve(isSupport);
                }
            };
            timer = setInterval(check, interval);
            check();
        });
        return this._checkPromise;
    }

    private _updateWallet = () => {
        let state = this.state;
        let address = this.address;
        if (supportBitKeep()) {
            this._wallet = window.tronLink as TronLinkWallet;
            address = this._wallet.tronWeb.defaultAddress?.base58 || null;
            state = window.tronWeb?.ready ? AdapterState.Connected : AdapterState.Disconnect;
            if (!window.tronWeb?.ready) {
                this.checkForWalletReady();
            }
        } else {
            this._wallet = null;
            address = null;
            state = AdapterState.NotFound;
        }
        this.setAddress(address);
        this.setState(state);
    };

    private setAddress(address: string | null) {
        this._address = address;
    }

    private setState(state: AdapterState) {
        const preState = this.state;
        if (state !== preState) {
            this._state = state;
            this.emit('stateChanged', state);
        }
    }
}
