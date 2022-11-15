import {
    Adapter,
    WalletConnectionError,
    WalletDisconnectionError,
    AdapterState,
    WalletWindowClosedError,
    WalletNotFoundError,
    WalletDisconnectedError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@tronweb3/tronwallet-abstract-adapter';
import type { Transaction, SignedTransaction, AdapterName } from '@tronweb3/tronwallet-abstract-adapter';
import { ChainNetwork } from '@tronweb3/tronwallet-abstract-adapter';
import { WalletConnectWallet, WalletConnectChainID } from '@tronweb3/walletconnect-tron';
import type { SignClientTypes } from '@walletconnect/types';

export const WalletConnectWalletName = 'WalletConnect' as AdapterName<'WalletConnect'>;
const NETWORK = Object.keys(ChainNetwork);
export interface WalletConnectAdapterConfig {
    /**
     * Network to use, one of Mainnet,Shasta,Nile
     */
    network: `${ChainNetwork}`;
    /**
     * Options to WalletConnect
     */
    options: SignClientTypes.Options;
}

export class WalletConnectAdapter extends Adapter {
    name = WalletConnectWalletName;
    url = 'https://walletconnect.org';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtNjEuNDM4NTQsOTQuMDAzOGM0OC45MTEyMywtNDcuODg4MTcgMTI4LjIxMTk5LC00Ny44ODgxNyAxNzcuMTIzMjEsMGw1Ljg4NjU1LDUuNzYzNDJjMi40NDU1NiwyLjM5NDQxIDIuNDQ1NTYsNi4yNzY1MSAwLDguNjcwOTJsLTIwLjEzNjcsMTkuNzE1NWMtMS4yMjI3OCwxLjE5NzIxIC0zLjIwNTMsMS4xOTcyMSAtNC40MjgwOCwwbC04LjEwMDU4LC03LjkzMTE1Yy0zNC4xMjE2OSwtMzMuNDA3OTggLTg5LjQ0Mzg5LC0zMy40MDc5OCAtMTIzLjU2NTU4LDBsLTguNjc1MDYsOC40OTM2MWMtMS4yMjI3OCwxLjE5NzIgLTMuMjA1MywxLjE5NzIgLTQuNDI4MDgsMGwtMjAuMTM2NjksLTE5LjcxNTVjLTIuNDQ1NTYsLTIuMzk0NDEgLTIuNDQ1NTYsLTYuMjc2NTIgMCwtOC42NzA5Mmw2LjQ2MTAxLC02LjMyNTg4em0yMTguNzY3OCw0MC43NzM3NWwxNy45MjE3LDE3LjU0Njg5YzIuNDQ1NTQsMi4zOTQ0IDIuNDQ1NTYsNi4yNzY0OCAwLjAwMDAzLDguNjcwODlsLTgwLjgxMDE3LDc5LjEyMTE0Yy0yLjQ0NTU1LDIuMzk0NDIgLTYuNDEwNTksMi4zOTQ0NSAtOC44NTYxNiwwLjAwMDA2Yy0wLjAwMDAxLC0wLjAwMDAxIC0wLjAwMDAzLC0wLjAwMDAyIC0wLjAwMDA0LC0wLjAwMDAzbC01Ny4zNTQxNCwtNTYuMTU0NThjLTAuNjExMzksLTAuNTk4NiAtMS42MDI2NSwtMC41OTg2IC0yLjIxNDA0LDBjMCwwLjAwMDAxIC0wLjAwMDAxLDAuMDAwMDEgLTAuMDAwMDEsMC4wMDAwMmwtNTcuMzUyOTIsNTYuMTU0NTNjLTIuNDQ1NTQsMi4zOTQ0MyAtNi40MTA1OCwyLjM5NDQ3IC04Ljg1NjE2LDAuMDAwMDhjLTAuMDAwMDIsLTAuMDAwMDEgLTAuMDAwMDMsLTAuMDAwMDIgLTAuMDAwMDUsLTAuMDAwMDRsLTgwLjgxMjQyLC03OS4xMjIxOWMtMi40NDU1NiwtMi4zOTQ0IC0yLjQ0NTU2LC02LjI3NjUxIDAsLTguNjcwOTFsMTcuOTIxNzMsLTE3LjU0Njg3YzIuNDQ1NTYsLTIuMzk0NDEgNi40MTA2LC0yLjM5NDQxIDguODU2MTYsMGw1Ny4zNTQ5OCw1Ni4xNTUzNWMwLjYxMTM5LDAuNTk4NjEgMS42MDI2NSwwLjU5ODYxIDIuMjE0MDQsMGMwLjAwMDAxLDAgMC4wMDAwMiwtMC4wMDAwMSAwLjAwMDAzLC0wLjAwMDAybDU3LjM1MjEsLTU2LjE1NTMzYzIuNDQ1NSwtMi4zOTQ0NyA2LjQxMDU0LC0yLjM5NDU2IDguODU2MTYsLTAuMDAwMmMwLjAwMDAzLDAuMDAwMDMgMC4wMDAwNywwLjAwMDA3IDAuMDAwMSwwLjAwMDFsNTcuMzU0OSw1Ni4xNTU0M2MwLjYxMTM5LDAuNTk4NiAxLjYwMjY1LDAuNTk4NiAyLjIxNDA0LDBsNTcuMzUzOTgsLTU2LjE1NDMyYzIuNDQ1NTYsLTIuMzk0NDEgNi40MTA2LC0yLjM5NDQxIDguODU2MTYsMHoiIGZpbGw9IiMzYjk5ZmMiIGlkPSJzdmdfMSIvPjwvc3ZnPg==';

    private _state: AdapterState = AdapterState.Disconnect;
    private _connecting: boolean;
    private _wallet: WalletConnectWallet | null;
    private _config: WalletConnectAdapterConfig;
    private _address: string | null;

    constructor(config: WalletConnectAdapterConfig) {
        super();
        config = {
            ...config,
        };
        if (!config || typeof config !== 'object') {
            throw new Error(`[WalletconnectAdapter] config is required.`);
        }
        if (!NETWORK.includes(config.network)) {
            console.error(
                `[WalletconnectAdapter] config.network must be one of ${NETWORK.join()}. Use Nile network instead.`
            );
            config.network = 'Nile';
        }
        if (!config.options) {
            throw new Error(`[WalletconnectAdapter] config.options is required.`);
        }

        this._connecting = false;
        this._wallet = null;
        this._address = null;
        this._config = config;
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
            if (this.state === AdapterState.NotFound) throw new WalletNotFoundError();
            this._connecting = true;

            let wallet: WalletConnectWallet;
            let address: string;
            try {
                wallet = new WalletConnectWallet({
                    network: WalletConnectChainID[this._config.network] || WalletConnectChainID.Nile,
                    options: this._config.options,
                });

                ({ address } = await wallet.connect());
            } catch (error: any) {
                if (error.constructor.name === 'QRCodeModalError') throw new WalletWindowClosedError();
                throw new WalletConnectionError(error?.message, error);
            }

            wallet.client.on('session_delete', this._disconnected);

            this._wallet = wallet;
            this._address = address || '';
            this._state = AdapterState.Connected;
            this.emit('stateChanged', this._state);
            this.emit('connect', address);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        if (this.state === AdapterState.NotFound) {
            return;
        }
        const wallet = this._wallet;
        if (wallet) {
            wallet.client.off('session_delete', this._disconnected);

            this._wallet = null;
            this._address = null;

            try {
                await wallet.disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }
        this._state = AdapterState.Disconnect;
        this.emit('disconnect');
        this.emit('stateChanged', this._state);
    }

    async signTransaction(transaction: Transaction): Promise<SignedTransaction> {
        if (this.state !== AdapterState.Connected) throw new WalletDisconnectedError();
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletDisconnectedError();

            try {
                return await wallet.signTransaction({ transaction });
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: string): Promise<string> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletDisconnectedError();

            try {
                return await wallet.signMessage(message);
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.client.off('session_delete', this._disconnected);

            this._wallet = null;
            this._address = null;

            this._state = AdapterState.Disconnect;
            this.emit('disconnect');
            this.emit('stateChanged', this._state);
        }
    };
}
