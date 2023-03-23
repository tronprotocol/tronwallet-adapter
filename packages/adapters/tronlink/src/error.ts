import { WalletError } from '@tronweb3/tronwallet-abstract-adapter';

export class WalletGetNetworkError extends WalletError {
    name = 'WalletGetNetworkError';
}
