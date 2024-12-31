# @tronweb3/tronwallet-adapters

`@tronweb3/tronwallet-adapters` provides multiple wallet adapters to help developers connect to Tron wallet like [TronLink](https://www.tronlink.org/) with consistent API.

## Supported wallets

As `@tronweb3/tronwallet-adapters` exports adapter of each wallet , you can use this package, or use the individual wallet adapter you want.

| NPM package                                                                                                          | Description                                                                  | Source Code                                                                                          |
| -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`@tronweb3/tronwallet-adapters`](https://npmjs.com/package/@tronweb3/tronwallet-adapters)                           | Includes all the wallet adapters                                             | [View](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters)      |
| [`@tronweb3/tronwallet-adapter-tronlink`](https://npmjs.com/package/@tronweb3/tronwallet-adapter-tronlink)           | adapter for [TronLink](https://www.tronlink.org/)                            | [View](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/tronlink)      |
| [`@tronweb3/tronwallet-adapter-walletconnect`](https://npmjs.com/package/@tronweb3/tronwallet-adapter-walletconnect) | adapter for adapter for [WalletConnect](https://docs.walletconnect.com/2.0/) | [View](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/walletconnect) |
| [`@tronweb3/tronwallet-adapter-tokenpocket`](https://npmjs.com/package/@tronweb3/tronwallet-adapter-tokenpocket)     | adapter for [TokenPocket](https://tokenpocket.pro/)                          | [View](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/tokenpocket)   |
| [`@tronweb3/tronwallet-adapter-bitget`](https://npmjs.com/package/@tronweb3/tronwallet-adapter-bitkeep)             | adapter for [BitGet](https://bitget.com/)                                  | [View](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/bitkeep)       |
| [`@tronweb3/tronwallet-adapter-okxwallet`](https://npmjs.com/package/@tronweb3/tronwallet-adapter-okxwallet)         | adapter for [Okx Wallet](https://okx.com/)                                   | [View](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/okxwallet)     |
| [`@tronweb3/tronwallet-adapter-ledger`](https://npmjs.com/package/@tronweb3/tronwallet-adapter-ledger)               | adapter for [Ledger](https://www.ledger.com/)                                | [View](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/ledger)        |

## Usage

> If you are working in a typescript project, you must set `skipLibCheck: true` in `tsconfig.json`.

### React

You can use `@tronweb3/tronwallet-adapters` in your component. Use `useMemo` to memorize the `adapter` to improve your web performance.

```tsx
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';

function App() {
    const [readyState, setReadyState] = useState(WalletReadyState.NotFound);
    const [account, setAccount] = useState('');
    const [netwok, setNetwork] = useState({});
    const [signedMessage, setSignedMessage] = useState('');

    const adapter = useMemo(() => new TronLinkAdapter(), []);
    useEffect(() => {
        setReadyState(adapter.readyState);
        setAccount(adapter.address!);

        adapter.on('connect', () => {
            setAccount(adapter.address!);
        });

        adapter.on('readyStateChanged', (state) => {
            setReadyState(state);
        });

        adapter.on('accountsChanged', (data) => {
            setAccount(data);
        });

        adapter.on('chainChanged', (data) => {
            setNetwork(data);
        });

        adapter.on('disconnect', () => {
            // when disconnect from wallet
        });
        return () => {
            // remove all listeners when components is destroyed
            adapter.removeAllListeners();
        };
    }, []);

    async function sign() {
        const res = await adapter!.signMessage('helloworld');
        setSignedMessage(res);
    }

    return (
        <div className="App">
            <div>readyState: {readyState}</div>
            <div>current address: {account}</div>
            <div>current network: {JSON.stringify(netwok)}</div>
            <button disabled={adapter.connected} onClick={() => adapter.connect()}>
                Connect to TronLink
            </button>
            <button onClick={sign}>sign message</button>
            <br />
            SignedMessage: {signedMessage}
        </div>
    );
}
```

### Vue

In Vue, as the `created/mounted` hook just can be executed once, you can init the adapter in `mounted` or `created` hook.

```js
// vue2.x
export default {
    created() {
        this.adapter = new TronLinkAdapter();
        this.adapter.on('connect', () => {
            // here you can do something
        });
    },
    beforeDestroy() {
        this.adapter.removeAllListeners();
    }
}

// vue3
export default {
    setup() {
        onMounted(function() {
            const adapter = new TronLinkAdapter();
            adapter.on('connect', () => {
                // here you can do something
            });
        });
        onBeforeUnmount(function() {
            // remove all listeners when components is destroyed
            adapter.removeAllListeners();
        });
        return {};
    }
}
```

### Vanilla js usage

To use adapters without bundle tools like `webpack`, you can install the package and get the `umd` format file.

1. Add script in your HTML file
   Put the script in your `head` tag:

```html
<script src="../node_modules/@tronweb3/tronwallet-adapters/lib/umd/index.js"></script>
```

**Note**: You should adjust the relative path according to the position of the HTML file.

2. Get specified adapter

```js
const { TronLinkAdapter, BitKeepAdapter, WalletConnectAdapter, OkxWalletAdapter } =
    window['@tronweb3/tronwallet-adapters'];
const tronlinkAdapter = new TronLinkAdapter({
    openTronLinkAppOnMobile: true,
    openUrlWhenWalletNotFound: false,
    checkTimeout: 3000,
});
```

A demo with cdn file can be found [here](https://github.com/tronprotocol/tronwallet-adapter/tree/main/demos/cdn-demo).

#### WalletConnectAdapter

If you want to use `WalletConnectAdapter`, you should install another dependency in addition:

```bash
npm i @walletconnect/sign-client
```

And add a script tag for `@walletconnect/sign-client` before the adapters `umd` file:

```diff
+ <script src="../node_modules/@walletconnect/sign-client/dist/index.umd.js"></script>
<script src="../node_modules/@tronweb3/tronwallet-adapters/lib/umd/index.js"></script>
```

## API Reference

### Adapter

The `Adapter` class defines the common interface for all adapters of specified wallets.

#### Constructor

-   `constructor(config)`: adapter constructor method, an optional config is valid. For detailed config type, refer to the following [adapter section](#tronlinkadapter).

#### Properties

-   `name`: The name of the adapter.
-   `url`: The website of the adapter's wallet.
-   `icon`: The icon of the adapter's wallet.
-   `readyState`: The wallet's state, which includes three value:
    -   `Loading`: When adapter is checking if the wallet is available or not.
    -   `NotFound`: The wallet is not detected in current browser.
    -   `Found`: The wallet is detected in current browser.
-   `address`: The address of current account when the adapter is connected.
-   `connecting`: Whether the adapter is trying to connect to the wallet.
-   `connected`: Whether the adapter is connected to the wallet.

#### Methods

-   `connect(): Promise<void>`: connect to the wallet.
-   `disconnect(): Promise<void>`: disconnect to the wallet.
-   `signMessage(message, privateKey?): Promise<string>`: sign a string, return the signature result. An optional `privateKey` can be provided.
-   `signTransaction(transaction, privateKey?)`: sign a transaction, return the signature result of the transaction. An optional `privateKey` can be provided.
-   `multiSign(transaction, privateKey: string | null, permissionId?)`: sign a multi-sign transaction.
    -   If `privateKey` is not `null`, will use the privateKey to sign rather than TronLink.
    -   If `permissionId` is not provided, will use `0`(OwnerPerssion) as default.
    -   Please refer to [here](https://developers.tron.network/docs/multi-signature) for more about Multi-Sign,
-   `switchChain(chainId: string): Promise<void>;`: request wallet to switch chain by `chainId`.

#### Events

`Adapter` extends the `EventEmitter` class in `eventemitter3` package. So you can listen to the events by `adapter.on('connect', function() {})`.

Events are as follows:

-   `connect(address)`: Emit when adapter is connected to the wallet. The parameter is the address of current account.
-   `disconnect()`: Emit when adapter is disconnected to the wallet.
-   `readyStateChanged(state: WalletReadyState)`: Emit when wallet's readyState is changed. The parameter is the state of wallet:
    ```typescript
    enum WalletReadyState {
        /**
         * Adapter will start to check if wallet exists after adapter instance is created.
         */
        Loading = 'Loading',
        /**
         * When checking ends and wallet is not found, readyState will be NotFound.
         */
        NotFound = 'NotFound',
        /**
         * When checking ends and wallet is found, readyState will be Found.
         */
        Found = 'Found',
    }
    ```
-   `accountsChanged(address: string, preAddress: string)`: Emit when users change the current selected account in wallet. The parameter is the address of new account.
-   `chainChanged(chainInfo: ChainInfo)`: Emit when users change the current selected chain in wallet. The parameter is the new network config：
    ```typescript
    interface ChainInfo {
        chainId: string;
    }
    ```
-   `error(WalletError)`: Emit when there are some errors when call the adapter's method. The [WalletError Types] is defined as follows.

### WalletError

`WalletError` is a superclass which defines the error when using adapter.
All error types are extended from this class.
Developers can check the error type according to the error instance.

```typescript
try {
    // do something here
} catch (error: WalletError) {
    if (error instanceof WalletNotFoundError) {
        console.log('Wallet is not found');
    }
}
```

All errors are as follows:

-   `WalletNotFoundError`: Occurs when wallet is not installed.
-   `WalletNotSelectedError`: Occurs when connect but there is no selected wallet.
-   `WalletDisconnectedError`: Occurs when wallet is disconnected. Used by some wallets which won't connect automatically when call `signMessage()` or `signTransaction()`.
-   `WalletConnectionError`: Occurs when try to connect a wallet.
-   `WalletDisconnectionError`: Occurs when try to disconnect a wallet.
-   `WalletSignMessageError`: Occurs when call `signMessage()`.
-   `WalletSignTransactionError`: Occurs when call `signTransaction()`.

Following exmaple shows how to get original error info with `WalletError`:

```js
const adapter = new TronLinkAdapter();
try {
    await adapter.connect();
} catch (e: any) {
    const originalError = e.error;
}
```

<h3 id="tronlinkadapter">TronLinkAdapter</h3>

-   `Constructor(config: TronLinkAdapterConfig)`
    ```typescript
    interface TronLinkAdapterConfig {
        /**
         * Set if open Wallet's website url when wallet is not installed.
         * Default is true.
         */
        openUrlWhenWalletNotFound?: boolean;
        /**
         * Timeout in millisecond for checking if TronLink wallet exists.
         * Default is 30 * 1000ms
         */
        checkTimeout?: number;
        /**
         * Set if open TronLink app using DeepLink on mobile device.
         * Default is true.
         */
        openTronLinkAppOnMobile?: boolean;
        /**
         * The icon of your dapp. Used when open TronLink app in mobile device browsers.
         * Default is current website icon.
         */
        dappIcon?: string;
        /**
         * The name of your dapp. Used when open TronLink app in mobile device browsers.
         * Default is `document.title`.
         */
        dappName?: string;
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

-   **TronLink Doesn't support `disconnect` by DApp**. As TronLinkAdapter doesn't support disconnect by DApp website, call `adapter.disconnect()` won't disconnect from TronLink extension really.
-   **Auto open TronLink app in mobile browser**. If developers call `connect()` method in mobile browser, it will open DApp in TronLink app to get tronlink wallet.

### Others adapters

Others adapters `Constructor` config api can be found in their source code `README`.

-   [TokenPocketAdapter](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/tokenpocket)
-   [BitGetAdapter](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/bitkeep)
-   [OkxWalletAdapter](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/okxwallet)
-   [WalletConnectAdapter](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/walletconnect)
-   [LedgerAdapter](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/ledger)
