import {
    Adapter,
    AdapterState,
    isInBrowser,
    WalletReadyState,
    WalletSignMessageError,
    WalletNotFoundError,
    WalletDisconnectedError,
    WalletConnectionError,
    WalletSignTransactionError,
    WalletSwitchChainError,
    WalletGetNetworkError,
    isInMobileBrowser,
    NetworkType,
} from '@tronweb3/tronwallet-abstract-adapter';
import type {
    Transaction,
    SignedTransaction,
    AdapterName,
    BaseAdapterConfig,
    Network,
} from '@tronweb3/tronwallet-abstract-adapter';
import type {
    AccountsChangedEventData,
    NetworkChangedEventData,
    ReqestAccountsResponse,
    Tron,
    TronAccountsChangedCallback,
    TronChainChangedCallback,
    TronLinkMessageEvent,
    TronWeb,
} from './types.js';
import { supportTron, supportTronLink, waitTronReady } from './utils.js';
export interface TronLinkWallet {
    ready: boolean;
    tronWeb: TronWeb;
    request(config: Record<string, unknown>): Promise<ReqestAccountsResponse | null>;
}
export const chainIdNetworkMap: Record<string, NetworkType> = {
    '0x2b6653dc': NetworkType.Mainnet,
};

export async function getNetworkInfoByTronWeb(tronWeb: TronWeb) {
    const { blockID = '' } = await tronWeb.trx.getBlockByNumber(0);
    const chainId = `0x${blockID.slice(-8)}`;
    return {
        networkType: chainIdNetworkMap[chainId] || NetworkType.Unknown,
        chainId,
        fullNode: tronWeb.fullNode?.host || '',
        solidityNode: tronWeb.solidityNode?.host || '',
        eventServer: tronWeb.eventServer?.host || '',
    };
}
declare global {
    interface Window {
        // @ts-ignore
        tronLink?: TronLinkWallet;
        // @ts-ignore
        tronWeb?: TronWeb;
        // @ts-ignore
        tron?: Tron;
        // @ts-ignore
    }
}
export interface XDEFIAdapterConfig extends BaseAdapterConfig {
    /**
     * Timeout in millisecond for checking if XDEFI wallet exists.
     * Default is 30 * 1000ms
     */
    checkTimeout?: number;
    /**
     * Set if open XDEFI wallet app using DeepLink.
     * Default is true.
     */
    openUrlWhenWalletNotFound?: boolean;
}

export const XDEFIAdapterName = 'XDEFI' as AdapterName<'XDEFI'>;

export class XDEFIAdapter extends Adapter {
    name = XDEFIAdapterName;
    url = 'https://www.xdefi.io/';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTguMTI2IDcuOTcxYy0uOTQzLjktMS40NyAyLjAzMi0xLjQ3IDIuOTU3YzAgLjkyMi40MDcgMS41NDMgMS4wMjggMS45NDZjLjY0My40MiAxLjUyMi42MjYgMi40NDMuNjI2YzEuNDQ5IDAgMi43NjQtLjY2OSAzLjIyMy0uOTlsLjY4Ni41NjFjLS41NTguMzk1LTIuMjI5IDEuMjg2LTMuOTA5IDEuMjg2Yy0xLjAyOSAwLTIuMS0uMjIzLTIuOTIzLS43NzFhMy4wNSAzLjA1IDAgMCAxLTEuNDE0LTIuNjU4YzAtMS4yMTcuNjY0LTIuNTU0IDEuNzMxLTMuNTc0YzEuMDcyLTEuMDI4IDIuNTg5LTEuNzgzIDQuMzQyLTEuNzgzYzEuNzU3IDAgMy4zMTcuNzUgNC40NjEgMS43N2MxLjE0IDEuMDE2IDEuOTEyIDIuMzM2IDIuMDQ5IDMuNTRjLjExMSAxLjAwMy4xMiAyLjU0Mi0uNjEzIDQuMDEyYy0uNzM3IDEuNDkxLTIuNTEyIDMuMTA3LTUuMzMyIDMuNTM1di0uODU3YzIuNjA2LS42NDMgMy45MzktMS44MTMgNC41NTItMy4wNTVjLjYzLTEuMjYuNjM0LTIuNjE1LjUzMS0zLjU0Yy0uMTA3LS45NDMtLjc0MS0yLjA4My0xLjc3LTNhNS44OCA1Ljg4IDAgMCAwLTMuODc4LTEuNTQ4Yy0xLjUgMC0yLjgwMy42NDMtMy43MzcgMS41NDMiLz48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik0xNS42NDMgMTEuNTcxYS42NDMuNjQzIDAgMSAwIDAtMS4yODVhLjY0My42NDMgMCAwIDAgMCAxLjI4NW0tLjMwNSAyLjM1N2MtNC4xNTIgMy4wMy04LjMyMiAyLjAyMy05Ljc2NyAxLjA3MmwuNDMzLS42NDNjMS4xNjIuNzYzIDQuODA0IDEuODEzIDguNjQtLjk4NnptMS4xNjIuNjQzYy0yLjkwMiAyLjg2Ny02Ljg3IDMuMDk1LTguMzU3IDIuNzg2VjE2LjVjMS4yNjQuMjYxIDUuMDYxLjI2MSA3LjcxNC0yLjM1N3oiLz48L3N2Zz4=';
    config: Required<XDEFIAdapterConfig>;
    private _readyState: WalletReadyState = isInBrowser() ? WalletReadyState.Loading : WalletReadyState.NotFound;
    private _state: AdapterState = AdapterState.Loading;
    private _connecting: boolean;
    private _wallet: TronLinkWallet | Tron | null;
    private _address: string | null;
    // https://github.com/tronprotocol/tips/blob/master/tip-1193.md
    private _supportNewTronProtocol = false;
    // record if first connect event has emitted or not

    constructor(config: XDEFIAdapterConfig = {}) {
        super();
        const { checkTimeout = 30 * 1000, openUrlWhenWalletNotFound = true } = config;
        if (typeof checkTimeout !== 'number') {
            throw new Error('[XDEFIAdapter] config.checkTimeout should be a number');
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
        if (supportTron() || (isInMobileBrowser() && (window.tronLink || window.tronWeb))) {
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
     * Get network information used by TronLink.
     * @returns {Network} Current network information.
     */
    async network(): Promise<Network> {
        try {
            await this._checkWallet();
            if (this.state !== AdapterState.Connected) throw new WalletDisconnectedError();
            const tronWeb = this._wallet?.tronWeb || window.tronWeb;
            if (!tronWeb) throw new WalletDisconnectedError();
            try {
                return await getNetworkInfoByTronWeb(tronWeb);
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
            if (this.state === AdapterState.NotFound) {
                if (this.config.openUrlWhenWalletNotFound !== false && isInBrowser()) {
                    window.open(this.url, '_blank');
                }
                throw new WalletNotFoundError();
            }
            // lower version only support window.tronWeb, no window.tronLink
            if (!this._wallet) return;
            this._connecting = true;
            if (this._supportNewTronProtocol) {
                const wallet = this._wallet as Tron;
                try {
                    const res = await wallet.request({ method: 'eth_requestAccounts' });
                    const address = res[0];
                    this.setAddress(address);
                    this.setState(AdapterState.Connected);
                    this._listenTronEvent();
                    if (!this._wallet.tronWeb) {
                        await waitTronReady(this._wallet as Tron);
                    }
                } catch (error: any) {
                    let message = error?.message || error || 'Connect XDEFI wallet failed.';
                    if (error.code === -32002) {
                        message =
                            'The same DApp has already initiated a request to connect to XDEFI wallet, and the pop-up window has not been closed.';
                    }
                    if (error.code === 4001) {
                        message = 'The user rejected connection.';
                    }
                    throw new WalletConnectionError(message, error);
                }
            } else if (window.tronLink) {
                const wallet = this._wallet as TronLinkWallet;
                try {
                    const res = await wallet.request({ method: 'tron_requestAccounts' });
                    if (!res) {
                        throw new WalletConnectionError('XDEFI wallet is locked or no wallet account is avaliable.');
                    }
                    if (res.code === 4000) {
                        throw new WalletConnectionError(
                            'The same DApp has already initiated a request to connect to XDEFI wallet, and the pop-up window has not been closed.'
                        );
                    }
                    if (res.code === 4001) {
                        throw new WalletConnectionError('The user rejected connection.');
                    }
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }

                const address = wallet.tronWeb.defaultAddress?.base58 || '';
                this.setAddress(address);
                this.setState(AdapterState.Connected);
                this._listenTronLinkEvent();
            } else if (window.tronWeb) {
                const wallet = this._wallet as TronLinkWallet;
                const address = wallet.tronWeb.defaultAddress?.base58 || '';
                this.setAddress(address);
                this.setState(AdapterState.Connected);
            } else {
                throw new WalletConnectionError('Cannot connect wallet.');
            }
            this.connected && this.emit('connect', this.address || '');
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (this._supportNewTronProtocol) {
            this._stopListenTronEvent();
        } else {
            this._stopListenTronLinkEvent();
        }
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

    /**
     * Switch to target chain. If current chain is the same as target chain, the call will success immediately.
     * Available chainIds:
     * - Mainnet: 0x2b6653dc
     * @param chainId chainId
     */
    async switchChain(chainId: string) {
        try {
            await this._checkWallet();
            if (this.state === AdapterState.NotFound) {
                if (this.config.openUrlWhenWalletNotFound !== false && isInBrowser()) {
                    window.open(this.url, '_blank');
                }
                throw new WalletNotFoundError();
            }
            if (!this._supportNewTronProtocol) {
                throw new WalletSwitchChainError("Current version of TronLink doesn't support switch chain operation.");
            }
            const wallet = this._wallet as Tron;
            try {
                await wallet.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId }],
                });
            } catch (e: any) {
                throw new WalletSwitchChainError(e?.message || e, e instanceof Error ? e : new Error(e));
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private async checkAndGetWallet() {
        await this._checkWallet();
        if (this.state !== AdapterState.Connected) throw new WalletDisconnectedError();
        const wallet = this._wallet;
        if (!wallet || !wallet.tronWeb) throw new WalletDisconnectedError();
        return wallet as Tron & { tronWeb: TronWeb };
    }

    private _listenTronLinkEvent() {
        this._stopListenTronLinkEvent();
        window.addEventListener('message', this._tronLinkMessageHandler);
    }

    private _stopListenTronLinkEvent() {
        window.removeEventListener('message', this._tronLinkMessageHandler);
    }

    private _tronLinkMessageHandler = (e: TronLinkMessageEvent) => {
        const message = e.data?.message;
        if (!message) {
            return;
        }
        if (message.action === 'accountsChanged') {
            setTimeout(() => {
                const preAddr = this.address || '';
                if ((this._wallet as TronLinkWallet)?.ready) {
                    const address = (message.data as AccountsChangedEventData).address;
                    this.setAddress(address);
                    this.setState(AdapterState.Connected);
                } else {
                    this.setAddress(null);
                    this.setState(AdapterState.Disconnect);
                }
                this.emit('accountsChanged', this.address || '', preAddr);
                if (!preAddr && this.address) {
                    this.emit('connect', this.address);
                } else if (preAddr && !this.address) {
                    this.emit('disconnect');
                }
            }, 200);
        } else if (message.action === 'setNode') {
            this.emit('chainChanged', { chainId: (message.data as NetworkChangedEventData)?.node?.chainId || '' });
        } else if (message.action === 'connect') {
            const address = (this._wallet as TronLinkWallet).tronWeb?.defaultAddress?.base58 || '';
            this.setAddress(address);
            this.setState(AdapterState.Connected);
            this.emit('connect', address);
        } else if (message.action === 'disconnect') {
            this.setAddress(null);
            this.setState(AdapterState.Disconnect);
            this.emit('disconnect');
        }
    };

    // following code is for TIP-1193
    private _listenTronEvent() {
        this._stopListenTronEvent();
        this._stopListenTronLinkEvent();
        const wallet = this._wallet as Tron;
        wallet.on('chainChanged', this._onChainChanged);
        wallet.on('accountsChanged', this._onAccountsChanged);
    }

    private _stopListenTronEvent() {
        const wallet = this._wallet as Tron;
        wallet.removeListener('chainChanged', this._onChainChanged);
        wallet.removeListener('accountsChanged', this._onAccountsChanged);
    }

    private _onChainChanged: TronChainChangedCallback = (data) => {
        this.emit('chainChanged', data);
    };

    private _onAccountsChanged: TronAccountsChangedCallback = () => {
        const preAddr = this.address || '';
        const curAddr = (this._wallet?.tronWeb && this._wallet?.tronWeb.defaultAddress?.base58) || '';
        if (!curAddr) {
            this.setAddress(null);
            this.setState(AdapterState.Disconnect);
        } else {
            const address = curAddr as string;
            this.setAddress(address);
            this.setState(AdapterState.Connected);
        }
        this.emit('accountsChanged', this.address || '', preAddr);
        if (!preAddr && this.address) {
            this.emit('connect', this.address);
        } else if (preAddr && !this.address) {
            this.emit('disconnect');
        }
    };

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
        const checkTronTimes = Math.floor(2000 / interval);
        const maxTimes = Math.floor(this.config.checkTimeout / interval);
        let times = 0,
            timer: ReturnType<typeof setInterval>;
        this._checkPromise = new Promise((resolve) => {
            const check = () => {
                times++;
                const isSupport = times < checkTronTimes && !isInMobileBrowser() ? supportTron() : supportTronLink();
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
        if (isInMobileBrowser()) {
            if (window.tronLink) {
                this._wallet = window.tronLink;
            } else {
                this._wallet = {
                    ready: !!window.tronWeb?.defaultAddress,
                    tronWeb: window.tronWeb,
                    request: () => Promise.resolve(true) as any,
                } as TronLinkWallet;
            }
            address = this._wallet.tronWeb?.defaultAddress?.base58 || null;
            state = address ? AdapterState.Connected : AdapterState.Disconnect;
        } else if (window.tron && window.tron.isTronLink) {
            this._supportNewTronProtocol = true;
            this._wallet = window.tron;
            this._listenTronEvent();
            address = (this._wallet.tronWeb && this._wallet.tronWeb?.defaultAddress?.base58) || null;
            state = address ? AdapterState.Connected : AdapterState.Disconnect;
        } else if (window.tronLink) {
            this._wallet = window.tronLink;
            this._listenTronLinkEvent();
            address = this._wallet.tronWeb?.defaultAddress?.base58 || null;
            state = this._wallet.ready ? AdapterState.Connected : AdapterState.Disconnect;
        } else if (window.tronWeb) {
            // fake tronLink
            this._wallet = {
                ready: window.tronWeb.ready,
                tronWeb: window.tronWeb,
                request: () => Promise.resolve(true) as any,
            } as TronLinkWallet;
            address = this._wallet.tronWeb.defaultAddress?.base58 || null;
            state = this._wallet.ready ? AdapterState.Connected : AdapterState.Disconnect;
        } else {
            // no tron support
            this._wallet = null;
            address = null;
            state = AdapterState.NotFound;
        }
        // In XDEFI App, account should be connected
        if (isInMobileBrowser() && state === AdapterState.Disconnect) {
            this.checkForWalletReadyForApp();
        }
        this.setAddress(address);
        this.setState(state);
    };

    private checkReadyInterval: ReturnType<typeof setInterval> | null = null;
    private checkForWalletReadyForApp() {
        if (this.checkReadyInterval) {
            return;
        }
        let times = 0;
        const maxTimes = Math.floor(this.config.checkTimeout / 200);
        const check = () => {
            if (window.tronLink ? window.tronLink.tronWeb?.defaultAddress : window.tronWeb?.defaultAddress) {
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
