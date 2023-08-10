import EventEmitter from 'eventemitter3';
import type { EIP1193Provider, ProviderEvents } from './eip1193-provider.js';
import { WalletDisconnectedError } from './errors.js';
import type { WalletError } from './errors.js';

export { EventEmitter };

export interface EIP712Domain {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string;
}
export interface TypedData {
    /**
     * Optional address to sign the typed data.
     * Default is current connected address.
     */
    address?: string;
    domain: EIP712Domain;
    primaryType: string;
    types: {
        [k: string]: { name: string; type: string }[];
    };
    message: Record<string, unknown>;
}

export interface Chain {
    chainId: `0x${string}`;
    chainName: string;
    nativeCurrency: {
        /**
         * The name of the currency.
         */
        name: string;
        /**
         * The symbol of the currency, as a 2-6 character string.
         */
        symbol: string;
        /**
         * The number of decimals of the currency. Currently only accepts 18
         */
        decimals: 18;
    };
    rpcUrls: [string];
    blockExplorerUrls?: [string];
    iconUrls?: string[];
}

export interface Asset {
    type: 'ERC20' | 'ERC721' | 'ERC1155';
    options: {
        address: `0x${string}`;
        symbol?: string;
        decimals?: number;
        image?: string;
        tokenId?: string;
    };
}
export interface AdapterEvents extends ProviderEvents {
    /**
     * Emitted when wallet is ready.
     * @param readyState
     */
    readyStateChanged(readyState: WalletReadyState): void;
    error(error: WalletError): void;
}

export type AdapterName<T extends string = string> = T & { __brand__: 'AdapterName' };

export interface AdapterProps<Name extends string = string> {
    name: AdapterName<Name>;
    url: string;
    icon: string;
    readyState: WalletReadyState;
    address: string | null;
    connecting: boolean;
    connected: boolean;

    connect(options?: Record<string, unknown>): Promise<string>;
    getProvider(): Promise<EIP1193Provider | null>;
    signMessage(params: { message: string; address?: string }): Promise<string>;
    signTypedData(params: { typedData: TypedData; address?: string }): Promise<string>;
    sendTransaction(transaction: any): Promise<string>;

    /**
     * Wallet api
     */
    switchChain(chainId: `0x${string}`): Promise<null>;
    addChain(chainInfo: Chain): Promise<null>;
    watchAsset(assetInfo: Asset): Promise<boolean>;
}
/**
 * Wallet ready state.
 */
export enum WalletReadyState {
    /**
     * Adapter will start to check if wallet exists after adapter instance is created.
     */
    Loading = 'Loading',
    /**
     * When checking ends and wallet is not found, readyState will be NotFound.
     */
    NotFound = 'NotFound',
    /**
     * When checking ends and wallet is found, readyState will be Found.
     */
    Found = 'Found',
}

export abstract class Adapter<Name extends string = string>
    extends EventEmitter<AdapterEvents>
    implements AdapterProps
{
    abstract name: AdapterName<Name>;
    abstract url: string;
    abstract icon: string;
    abstract readyState: WalletReadyState;
    abstract address: string | null;
    connecting = false;

    get connected() {
        return !!this.address;
    }

    abstract connect(options?: Record<string, unknown>): Promise<string>;
    abstract getProvider(): Promise<EIP1193Provider | null>;
    async signMessage({ message, address }: { message: string; address?: string }): Promise<string> {
        const provider = await this.prepareProvider();
        if (!this.connected) {
            throw new WalletDisconnectedError();
        }
        return provider.request({
            method: 'personal_sign',
            params: [message, address || this.address],
        });
    }
    abstract signTypedData(params: { typedData: TypedData; address?: string }): Promise<string>;
    async sendTransaction(transaction: any): Promise<string> {
        const provider = await this.prepareProvider();
        if (!this.connected) {
            throw new WalletDisconnectedError();
        }
        return provider.request({
            method: 'eth_sendTransaction',
            params: [transaction],
        });
    }
    async addChain(chainInfo: Chain): Promise<null> {
        const provider = await this.prepareProvider();
        return provider.request({
            method: 'wallet_addEthereumChain',
            params: [chainInfo],
        });
    }
    async switchChain(chainId: `0x${string}`): Promise<null> {
        const provider = await this.prepareProvider();
        return provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }],
        });
    }
    async watchAsset(asset: Asset): Promise<boolean> {
        const provider = await this.prepareProvider();
        return provider.request({
            method: 'wallet_watchAsset',
            params: asset,
        });
    }

    protected async prepareProvider() {
        return (await this.getProvider()) as EIP1193Provider;
    }
}
