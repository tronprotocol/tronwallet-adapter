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
 * Occurs when connect to a wallet but there is no wallet selected.
 */
export class WalletNotSelectedError extends WalletError {
    name = 'WalletNotSelectedError';
    message = 'No wallet is selected. Please select a wallet.';
}

/**
 * Occurs when wallet is disconnected.
 * Used by some wallets which won't connect automatically when call `signMessage()` or `signTransaction()`.
 */
export class WalletDisconnectedError extends WalletError {
    name = 'WalletDisconnectedError';
    message = 'The wallet is disconnected. Please connect first.';
}

/**
 * Occurs when try to connect a wallet.
 */
export class WalletConnectionError extends WalletError {
    name = 'WalletConnectionError';
}

/**
 * Occurs when try to disconnect a wallet.
 */
export class WalletDisconnectionError extends WalletError {
    name = 'WalletDisconnectionError';
}

/**
 * Occurs when call `signMessage()`.
 */
export class WalletSignMessageError extends WalletError {
    name = 'WalletSignMessageError';
}

/**
 * Occurs when call `signTransaction()`.
 */
export class WalletSignTransactionError extends WalletError {
    name = 'WalletSignTransactionError';
}

/**
 * Occurs when load wallet
 */
export class WalletWalletLoadError extends WalletError {
    name = 'WalletWalletLoadError';
}

/**
 * Occurs when walletconnect QR window is closed.
 */
export class WalletWindowClosedError extends WalletError {
    name = 'WalletWindowClosedError';
    message = 'The QR window is closed.';
}
/**
 * Occurs when request wallet to switch chain.
 */
export class WalletSwitchChainError extends WalletError {
    name = 'WalletSwitchChainError';
}
