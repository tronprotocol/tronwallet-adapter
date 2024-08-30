# `@tronweb3/tronwallet-adapter-gatewallet`

This package provides an adapter to enable TRON DApps to connect to the [Gate Wallet extension](https://www.gate.io/mobileapp) and [Gate Wallet App](https://www.gate.io/mobileapp).

## Demo

```typescript
import { GateWalletAdapter } from '@tronweb3/tronwallet-adapter-gatewallet';

const adapter = new GateWalletAdapter();
// connect to TokenPocket
await adapter.connect();

// then you can get address
console.log(adapter.address);

// create a send TRX transaction
const unSignedTransaction = await window.gatewallet.tronLink.tronWeb.transactionBuilder.sendTrx(
    targetAddress,
    100,
    adapter.address
);
// using adapter to sign the transaction
const signedTransaction = await adapter.signTransaction(unSignedTransaction);
// broadcast the transaction
await window.gatewallet.tronLink.tronWeb.trx.sendRawTransaction(signedTransaction);
```

## Documentation

### API

-   `Constructor(config: GateWalletAdapterConfig)`

```typescript
interface GateWalletAdapterConfig {
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

-   GateWallet App and Extension doesn't implement `multiSign()` and `switchChain()`.

For more information about tronwallet adapters, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters)
