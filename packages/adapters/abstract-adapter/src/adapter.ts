import EventEmitter from 'eventemitter3';
import type { WalletError } from './errors.js';
import type { SignedTransaction, Transaction } from './types.js';

export { EventEmitter };

export interface AdapterEvents {
    connect(address: string): void;
    disconnect(): void;
    error(error: WalletError): void;
    stateChanged(state: AdapterState): void;
    accountsChanged(address: string): void;
    chainChanged(chainData: unknown): void;
}

export type AdapterName<T extends string = string> = T & { __brand__: 'AdapterName' };

export interface AdapterProps<Name extends string = string> {
    name: AdapterName<Name>;
    url: string;
    icon: string;
    state: AdapterState;
    address: string | null;
    connecting: boolean;
    connected: boolean;

    connect(): Promise<void>;
    disconnect(): Promise<void>;
    signMessage(message: string, privateKey?: string): Promise<string>;
    signTransaction(transaction: Transaction, privateKey?: string): Promise<SignedTransaction>;
}

/**
 * Adapter state
 */
export enum AdapterState {
    /**
     * If wallet is not installed, the state is NotFound.
     */
    NotFound = 'NotFound',
    /**
     * If wallet is installed but is not connected to current Dapp, the state is Disconnected.
     */
    Disconnect = 'Disconnected',
    /**
     * Wallet is connected to current Dapp.
     */
    Connected = 'Connected',
}

export abstract class Adapter<Name extends string = string>
    extends EventEmitter<AdapterEvents>
    implements AdapterProps
{
    abstract name: AdapterName<Name>;
    abstract url: string;
    abstract icon: string;
    abstract state: AdapterState;
    abstract address: string | null;
    abstract connecting: boolean;

    get connected() {
        return this.state === AdapterState.Connected;
    }

    abstract connect(): Promise<void>;
    /**
     * Some wallets such as TronLink don't support disconnect() method.
     */
    disconnect(): Promise<void> {
        console.info("The current adapter doesn't support disconnect by DApp.");
        return Promise.resolve();
    }
    abstract signMessage(message: string, privateKey?: string): Promise<string>;
    abstract signTransaction(transaction: Transaction, privateKey?: string): Promise<SignedTransaction>;
}
