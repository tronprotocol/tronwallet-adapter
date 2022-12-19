# @tronweb3/tronwallet-adapters

`@tronweb3/tronwallet-adapters` provides multiple wallet adapters to help developers connect to Tron wallet like [TronLink](https://www.tronlink.org/) with consistent API.

## Supported wallets

As `@tronweb3/tronwallet-adapters` exports adapter of each wallet , you can use this package, or use the individual wallet adapter you want.

-   [`@tronweb3/tronwallet-adapters`](https://npmjs.com/package/@tronweb3/tronwallet-adapters): Includes all the wallet adapters.
-   [`@tronweb3/tronwallet-adapter-tronlink`](https://npmjs.com/package/@tronweb3/tronwallet-adapter-tronlink): adapter for [TronLink](https://www.tronlink.org/).
-   [`@tronweb3/tronwallet-adapter-walletconnect`](https://npmjs.com/package/@tronweb3/tronwallet-adapter-walletconnect): adapter for [WalletConnect](https://docs.walletconnect.com/2.0/).
-   [`@tronweb3/tronwallet-adapter-ledger`](https://npmjs.com/package/@tronweb3/tronwallet-adapter-ledger): adapter for [Ledger](https://www.ledger.com/).

## Usage

### React

You can use `@tronweb3/tronwallet-adapters` in your component. Use `useMemo` to memorize the `adapter` to improve your web performance.

```tsx
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';

function App() {
    const [connectState, setConnectState] = useState(AdapterState.NotFound);
    const [account, setAccount] = useState('');
    const [netwok, setNetwork] = useState({});
    const [signedMessage, setSignedMessage] = useState('');

    const adapter = useMemo(() => new TronLinkAdapter(), []);
    useEffect(() => {
        setConnectState(adapter.state);
        setAccount(adapter.address!);

        adapter.on('connect', () => {
            setAccount(adapter.address!);
        });

        adapter.on('stateChanged', (state) => {
            setConnectState(state);
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
            <div>connectState: {connectState}</div>
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

## API Reference

### Adapter

The `Adapter` class defines the common interface for all adapters of specified wallets.

#### Constructor

-   `constructor(config)`: adapter constructor method, an optional config is valid. For detailed config type, refer to the following [adapter section](#tronlinkadapter).

#### Properties

-   `name`: The name of the adapter.
-   `url`: The website of the adapter's wallet.
-   `icon`: The icon of the adapter's wallet.
-   `state`: The adapter's state, which includes three value:
    -   `NotFound`: The wallet is not detected in current browser.
    -   `Disconnected`: The wallet is detected in current browser but the adapter has not connected to wallet yet.
    -   `Connected`: The adapter is connected to wallet.
-   `address`: The address of current account when the adapter is connected.
-   `connecting`: Whether the adapter is trying to connect to the wallet.
-   `connected`: Whether the adapter is connected to the wallet.

#### Methods

-   `connect(): Promise<void>`: connect to the wallet.
-   `disconnect(): Promise<void>`: disconnect to the wallet.
-   `signMessage(message, privateKey?): Promise<string>`: sign a string, return the signature result. An optional `privateKey` can be provided.
-   `signTransaction(transaction, privateKey?)`: sign a transaction, return the signature result of the transaction. An optional `privateKey` can be provided.

#### Events

`Adapter` extends the `EventEmitter` class in `eventemitter3` package. So you can listen to the events by `adapter.on('connect', function() {})`.

Events are as follows:

-   `connect(address)`: Emit when adapter is connected to the wallet. The parameter is the address of current account.
-   `disconnect()`: Emit when adapter is disconnected to the wallet.
-   `stateChanged(state: AdapteraState)`: Emit when adapter's state is changed. The parameter is the state of adapter:
    ```typescript
    enum AdapterState {
        NotFound = 'NotFound',
        Disconnect = 'Disconnected',
        Connected = 'Connected',
    }
    ```
-   `accountsChanged(address: string)`: Emit when users change the current selected account in wallet. The parameter is the address of new account.
-   `chainChanged(chainInfo: ChainInfo)`: Emit when users change the current selected chain in wallet. The parameter is the new network config：
    ```typescript
    interface ChainInfo {
        node: {
            chain: string;
            fullNode: string;
            solidityNode: string;
            eventServer: string;
        };
    }
    ```
-   `error(ConnectionError)`: Emit when there are some errors when call the adapter's method. The [ConnectionError Types] is defined as follows.

### ConnectionError

`ConnectionError` is a superclass which defines the error when using adapter.
All error types are extended from this class.
Developers can check the error type according to the error instance.

```typescript
try {
    // do something here
} catch (error: ConnectionError) {
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

<h3 id="tronlinkadapter">TronLinkAdapter</h3>

-   `Constructor(config: TronLinkAdapterConfig)`
    ```typescript
    interface TronLinkAdapterConfig {
        /**
         * The icon of your dapp. Used when open TronLink app in mobile device browsers.
         */
        dappIcon?: string;
        /**
         * The name of your dapp. Used when open TronLink app in mobile device browsers.
         */
        dappName?: string;
    }
    ```
-   **Don't support `disconnect` by DApp**. As TronLinkAdapter doesn't support disconnect by DApp website, call `adapter.disconnect()` won't disconnect from TronLink extension really.
-   **Auto open TronLink app in mobile browser**. If developers call `connect()` method in mobile browser, it will open DApp in TronLink app to get tronlink wallet.

### WalletConnectAdapter

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
    }
    ```
    More detail about WalletConnect client options please refer to the [WalletConnect document](https://docs.walletconnect.com/2.0/javascript/sign/dapp-usage).

### LedgerAdapter

-   `Constructor(config: LedgerAdapterConfig)`
    ```typescript
    interface LedgerAdapterConfig {
        // Initial total accounts to get once connection is created
        accountNumber: number;
    }
    ```
