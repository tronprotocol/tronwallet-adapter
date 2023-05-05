# `@tronweb3/tronwallet-adapter-okxwallet`

This package provides an adapter to enable TRON DApps to connect to the [Okx Wallet extension](https://www.okx.com/download) and [Okx Wallet App](https://www.okx.com/download).

## Demo

```typescript
import { OkxWalletAdapter } from '@tronweb3/tronwallet-adapter-okxwallet';

const adapter = new OkxWalletAdapter();
// connect to TokenPocket
await adapter.connect();

// then you can get address
console.log(adapter.address);

// create a send TRX transaction
const unSignedTransaction = await window.okxwallet.tronLink.tronWeb.transactionBuilder.sendTrx(
    targetAddress,
    100,
    adapter.address
);
// using adapter to sign the transaction
const signedTransaction = await adapter.signTransaction(unSignedTransaction);
// broadcast the transaction
await window.okxwallet.tronLink.tronWeb.trx.sendRawTransaction(signedTransaction);
```

## Documentation

### API

-   `Constructor(config: OkxWalletAdapterConfig)`

```typescript
interface OkxWalletAdapterConfig {
    /**
     * Set if open Wallet's website when wallet is not installed.
     * Default is true.
     */
    openUrlWhenWalletNotFound?: boolean;
    /**
     * Timeout in millisecond for checking if TokenPocket wallet is supported.
     * Default is 2 * 1000ms
     */
    checkTimeout?: number;
    /**
     * Set if open TokenPocket app using DeepLink on mobile device.
     * Default is true.
     */
    openAppWithDeeplink?: boolean;
}
```

-   `network()` method is supported to get current network information. The type of returned value is `Network` as follows:

    ```typescript
    export enum NetworkType {
        Mainnet = 'Mainnet',
        Shasta = 'Shasta',
        Nile = 'Nile',
        /**
         * When use custom node
         */
        Unknown = 'Unknown',
    }

    export type Network = {
        networkType: NetworkType;
        chainId: string;
        fullNode: string;
        solidityNode: string;
        eventServer: string;
    };
    ```

### Caveats

-   OkxWallet App and Extension doesn't implement `signMessage()`, `multiSign()` and `switchChain()`.
-   OkxWallet Extension only support these: `accountsChanged`,`connect`,`disconnect`.
-   OkxWallet App does not support any events.
-   Deeplink only works for OKX App **version 6.1.38 or later** on Android.
-   **OKX Wallet App on IOS does not support TRON currently**.

For more information about tronwallet adapters, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters)
