# `@tronweb3/tronwallet-adapter-walletconnect`

This package provides an adapter to enable TRON DApps to connect to [WalletConnect](https://walletconnect.com/).

## Install

```shell
npm i @tronweb3/tronwallet-adapter-walletconnect
# yarn add @tronweb3/tronwallet-adapter-walletconnect
```

> If you are working in a typescript project, you must set `skipLibCheck: true` in `tsconfig.json`.

## Demo

```typescript
import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect';
import TronWeb from 'tronweb';

const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { 'TRON-PRO-API-KEY': 'your api key' },
});

const adapter = new WalletConnectAdapter({
    network: 'Nile',
    options: {
        relayUrl: 'wss://relay.walletconnect.com',
        // example walletconnect app project ID
        projectId: 'e899c82be21d4acca2c8aec45e893598',
        metadata: {
            name: 'Example App',
            description: 'Example App',
            url: 'https://yourdapp-url.com',
            icons: ['https://yourdapp-url.com/icon.png'],
        },
    },
    qrcodeModalOptions: {
        desktopLinks: ['Ledger', 'GoldBit', 'TokenPocket', 'Tokenary', 'Apollox'],
        // wallet's name can be case insensitive
        mobileLinks: ['rainbow', 'trust', 'metamask', 'safe'],
    },
});
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

-   `Constructor(config: WalletConnectAdapterConfig)`
    ```typescript
    interface WalletConnectAdapterConfig {
        /**
         * Network to use, one of Mainnet, Shasta, Nile
         * Default: Nile
         */
        network: 'Mainnet' | 'Shasta' | 'Nile';
        /**
         * Options passed to WalletConnect client
         */
        options: {
            projectId: '<YOUR PROJECT ID>';
            // optional parameters
            relayUrl: '<YOUR RELAY URL>';
            metadata: {
                name: 'Wallet name';
                description: 'A short description for your wallet';
                url: "<YOUR WALLET'S URL>";
                icons: ["<URL TO WALLET'S LOGO/ICON>"];
            };
        };
        /**
         * Options passed to WalletConnect QRCode Modal
         */
        qrcodeModalOptions: {
            /**
             * URL to fetch wallets list.
             * Default is https://registry.walletconnect.com/api/v2/wallets
             */
            registryUrl: string;
            /**
             * Wallets Names to show on desktop browser like ['Ledger', 'GoldBit'].
             * Default is all desktop wallets from https://explorer.walletconnect.com/?type=wallet
             */
            desktopLinks: string[];
            /**
             * Wallets Names to show on IOS mobile browser like ['Trust', 'TokenPocket'].
             * Default is all mobile wallets from https://explorer.walletconnect.com/?type=wallet
             */
            mobileLinks: string[];
        };
    }
    ```
    More detail about WalletConnect client options please refer to the [WalletConnect document](https://docs.walletconnect.com/2.0/javascript/sign/dapp-usage).

### Caveates

-   `multiSign()` and `switchChain(chainId: string)` are not supported.

For more information about wallet adapter, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters).
