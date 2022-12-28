import type { Adapter, AdapterName, Transaction, AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import { createContext, useContext } from 'react';

export interface Wallet {
    adapter: Adapter;
    state: AdapterState;
}
export interface WalletContextState {
    autoConnect: boolean;
    wallets: Wallet[];
    wallet: Wallet | null;
    address: string | null;
    connecting: boolean;
    connected: boolean;
    disconnecting: boolean;

    select(adapterName: AdapterName): void;
    connect(): Promise<void>;
    disconnect(): Promise<void>;

    signTransaction: Adapter['signTransaction'];
    signMessage: Adapter['signMessage'];
}
function printError() {
    console.error(`
You are using WalletContext without provide the WalletContext.Provider.
Please wrap your sub-components with a WalletProvider and provide required values.
`);
}
const DEFAULT_CONTEXT = {
    autoConnect: false,
    connecting: false,
    connected: false,
    disconnecting: false,
    /* eslint-disable */
    select(_name: AdapterName) {
        printError();
    },
    connect() {
        printError();
        return Promise.reject();
    },
    disconnect() {
        printError();
        return Promise.reject();
    },
    signTransaction(_transaction: Transaction) {
        printError();
        return Promise.reject();
    },
    signMessage(_message: string) {
        printError();
        return Promise.reject();
    },
    /* eslint-enable */
} as WalletContextState;

Object.defineProperty(DEFAULT_CONTEXT, 'wallets', {
    get() {
        printError();
        return [];
    },
});
Object.defineProperty(DEFAULT_CONTEXT, 'wallet', {
    get() {
        printError();
        return null;
    },
});
Object.defineProperty(DEFAULT_CONTEXT, 'address', {
    get() {
        printError();
        return null;
    },
});

export const WalletContext = createContext<WalletContextState>(DEFAULT_CONTEXT as WalletContextState);
export function useWallet(): WalletContextState {
    return useContext(WalletContext);
}
