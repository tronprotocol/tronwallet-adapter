export class WalletError extends Error {
    error: any;

    constructor(message?: string, error?: any) {
        super(message);
        this.error = error;
    }
}

/**
 * Occurs when wallet is not installed.
 */
export class WalletNotFoundError extends WalletError {
    name = 'WalletNotFoundError';
    message = 'The wallet is not found.';
}

/**
 * Occurs when try to sign but is not connected to wallet.
 */
export class WalletDisconnectedError extends WalletError {
    name = 'WalletDisconnectedError';
    message = 'The wallet is disconnected. Please connect the wallet first.';
}

/**
 * Occurs when try to connect a wallet.
 */
export class WalletConnectionError extends WalletError {
    name = 'WalletConnectionError';
}
