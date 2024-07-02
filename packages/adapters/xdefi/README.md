# `@tronweb3/tronwallet-adapter-xdefi`

This package provides an adapter to enable TRON DApps to connect to the [XDEFI Wallet extension](https://www.xdefi.io/) and [TronLink Wallet App](https://www.tronlink.org/).

## Demo

```typescript
import { XDEFIAdapter } from '@tronweb3/tronwallet-adapter-xdefi';
import TronWeb from 'tronweb';

const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { 'TRON-PRO-API-KEY': 'your api key' },
});

const adapter = new XDEFIAdapter();
// connect
await adapter.connect();

// then you can get address
console.log(adapter.address);

// create a send TRX transaction
const unSignedTransaction = await tronWeb.transactionBuilder.sendTrx(targetAddress, 100, adapter.address);
// using adapter to sign the transaction
const signedTransaction = await adapter.signTransaction(unSignedTransaction);
// broadcast the transaction
await tronWeb.trx.sendRawTransaction(signedTransaction);
```

## Documentation

### API

-   `Constructor(config: XDEFIAdapterConfig)`
    ```typescript
    interface XDEFIAdapterConfig {
        /**
         * Set if open Wallet's website url when wallet is not installed.
         * Default is true.
         */
        openUrlWhenWalletNotFound?: boolean;
        /**
         * Timeout in millisecond for checking if XDEFI wallet exists.
         * Default is 30 * 1000ms
         */
        checkTimeout?: number;
        /**
         * Set if open XDEFI wallet app using DeepLink on mobile device.
         * Default is true.
         */
        openTronLinkAppOnMobile?: boolean;
        /**
         * The icon of your dapp. Used when open XDEFI wallet app in mobile device browsers.
         * Default is current website icon.
         */
        dappIcon?: string;
        /**
         * The name of your dapp. Used when open XDEFI wallet app in mobile device browsers.
         * Default is `document.title`.
         */
        dappName?: string;
    }
    ```
-   `network()` method is supported to get current network information. The type of returned value is `Network` as follows:

    ```typescript
    export enum NetworkType {
        Mainnet = 'Mainnet'
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

-   **TronLink Doesn't support `disconnect` by DApp**. As TronLinkAdapter doesn't support disconnect by DApp website, call `adapter.disconnect()` won't disconnect from TronLink extension really.

For more information about tronwallet adapters, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters)
