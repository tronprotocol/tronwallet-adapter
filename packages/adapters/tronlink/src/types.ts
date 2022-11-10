import type { NetworkNodeConfig, SignedTransaction, Transaction } from '@tronweb3/tronwallet-abstract-adapter';

export interface TronLinkWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

export interface TronWeb {
    ready: boolean;
    toHex(m: string): string;
    trx: {
        sign(transaction: Transaction, privateKey?: string): Promise<SignedTransaction>;
        sign(message: string, privateKey?: string): Promise<string>;
        signMessageV2(message: string, privateKey?: string): Promise<string>;
        // signMessageV2(...args: unknown[]): Promise<string>;
    };
    defaultAddress?: {
        base58: string;
        hex: string;
        name: string;
        type: number;
    };
}

export interface ReqestAccountsResponse {
    code: 200 | 4000 | 4001;
    message: string;
}

export interface TronLinkMessageEvent {
    data: {
        isTronLink: boolean;
        message: {
            action: 'setAccount' | 'accountsChanged' | 'setNode' | 'connect' | 'disconnect';
            data?: AccountsChangedEventData | NetworkChangedEventData;
        };
    };
}
export interface AccountsChangedEventData {
    // tronlink will return false when users lock accounts, treat it as string
    address: string;
}

export interface NetworkChangedEventData {
    node: NetworkNodeConfig;
    connectNode: NetworkNodeConfig;
}
