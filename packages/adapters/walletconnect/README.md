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
    web3ModalConfig: {
        themeMode: 'dark',
        themeVariables: {
            '--w3m-z-index': 1000,
        },
        /**
         * Recommended Wallets are fetched from WalletConnect explore api:
         * https://walletconnect.com/explorer?type=wallet&version=2.
         * You can copy these ids from the page.
         */
        explorerRecommendedWalletIds: [
            '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f',
            '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
            '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        ],
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
         * Config for web3Modal constructor.
         * Detailed documentation can be found in WalletConnect page: https://docs.walletconnect.com/2.0/web3modal/options.
         * - `walletConnectVersion` will be ignored and will be set to 2.
         * - `projectId` will be ignored and will be set with `options.projectId`.
         */
        web3ModalConfig?: WalletConnectWeb3ModalConfig;
    }
    ```
    More detail about WalletConnect client options please refer to the [WalletConnect document](https://docs.walletconnect.com/2.0/javascript/sign/dapp-usage).

### Caveates

-   `multiSign()` and `switchChain(chainId: string)` are not supported.

For more information about wallet adapter, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters).
