# @tronweb3/tronwallet-adapter-react-hooks

`@tronweb3/tronwallet-adapter-react-hooks` provides a `useWallet()` hook which will make it easy to "Connect Wallet" and listen to the state change for developers.

## Installation

```bash
npm install @tronweb3/tronwallet-adapter-react-hooks @tronweb3/tronwallet-abstract-adapter @tronweb3/tronwallet-adapters
# or pnpm install @tronweb3/tronwallet-adapter-react-hooks @tronweb3/tronwallet-abstract-adapter @tronweb3/tronwallet-adapters
# or yarn install @tronweb3/tronwallet-adapter-react-hooks @tronweb3/tronwallet-abstract-adapter @tronweb3/tronwallet-adapters
```

## Usage

`@tronweb3/tronwallet-adapter-react-hooks` uses [`Context` of React](https://reactjs.org/docs/context.html) to maintain a shared data. So developers need to wrap `App` content within the `WalletProvider`.

You can provide a `onError` callback to handle various errors such as `WalletConnectionError`, `WalletNotFoundError`.

```jsx
import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletDisconnectedError, WalletError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';
import toast, { Toaster } from 'react-hot-toast';

function App() {
    // use `react-hot-toast` npm package to notify user what happened here
    function onError(e: WalletError) {
        if (e instanceof WalletNotFoundError) {
            toast.error(e.message);
        } else if (e instanceof WalletDisconnectedError) {
            toast.error(e.message);
        } else toast.error(e.message);
    }
    return (
        <WalletProvider onError={onError}>
            <ConnectComponent></ConnectComponent>
            <Profile></Profile>
        </WalletProvider>
    );
}
function ConnectComponent() {
    const { connect, disconnect, select, connected } = useWallet();
    return (<div>
      <button type="button" onClick={() => select('TronLink Adapter' as any)}> Select TronLink</button>
      <button type="button" disabled={connected} onClick={connect}>Connect</button><br>
      <button type="button" disabled={!connected} onClick={disconnect}>Disconnect</button>
    </div>);
}
function Profile() {
    const { address, connected, wallet } = useWallet();
    return (<div>
        <p> <span>Connection Status:</span> {connected ? 'Connected' : 'Disconnected'}</p>
        <p> <span>Your selected Wallet:</span> {wallet?.adapter.name} </p>
        <p> <span>Your Address:</span> {address} </p>
    </div>);
}
```

## `WalletProvider`

`WalletProvider` and `useWallet` work together like `Context.Provider` and `useContext()`. There is a `WalletProviderContext` underlying which maintains some state and can be obtained with `useWallet`. So developers need to wrap application components with `WalletProvider`.

```jsx
import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
function App() {
    return <WalletProvider>/* here is application components */</WalletProvider>;
}
```

### Props

#### adapters:

-   Required: `false`
-   Type: `Adapter[]`
-   Default: `[ new TronLinkAdapter() ]`

Used to specify what wallet adapters are supported. All wallet adapters can be imported from `@tronweb3/tronwallet-adapters` package or their standalone package.

-   Example
    ```jsx
    import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
    import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
    function App() {
        const adapters = useMemo(() => [new TronLinkAdapter()]);
        return <WalletProvider adapters={adapters}>/* here is application components */</WalletProvider>;
    }
    ```

#### onError

-   Required: `false`
-   Type: `(error: WalletError): void`
-   Default: `function(error) { console.error(error); }`

Used to handle errors occured when use wallet. Developers can use the callback to tell users what happened according to the `error` type. All error types can be found [here](https://github.com/tronprotocol/tronwallet-adapter/blob/main/packages/adapters/abstract-adapter/src/errors.ts).

-   Example
    ```jsx
    functon onError(e) {
    if (e instanceof WalletNotFoundError) {
            console.error(e.message);
        } else if (e instanceof WalletDisconnectedError) {
            console.error(e.message);
        } else console.error(e.message);
    }
    ```

#### autoConnect

-   Required: `false`
-   Type: `boolean`
-   Default: `true`

Whether connect to the specified wallet automatically when loading the page and selecting a wallet.

#### disableAutoConnectOnLoad

-   Required: `false`
-   Type: `boolean`
-   Default: `true`

When `autoConnect` enabled, whether automatically connect to current selected wallet when loading the page.
If you don't want to connect the wallet when page is first loaded, set `disableAutoConnectOnLoad: true`.

#### localStorageKey

-   Required: `false`
-   Type: `string`
-   Default: `tronAdapterName`

Specified the key used to cache wallet name in `localStorage`. When user select a wallet, applications will cache the wallet name to localStorage.

#### Event handlers

You can provide event handlers for listen adapter events, such as `connect`,`disconnect`,`accountsChanged`. Available event handlers and their types are as follows:

-   `readyStateChanged: (readyState: 'Found' | 'NotFound') => void`: Called when current adapter emits `readyStateChanged` event.
-   `onConnect: (address: string) => void`: Called when current adapter emits `connect` event.
-   `onDisconnect: () => void`: Called when current adapter emits `disconnect` event.
-   `onAccountsChanged: (newAddress: string; preAddress?: string) => void`: Called when current adapter emits `accountsChanged` event.
-   `onChainChanged: (chainData: unknow) => void`: Called when current adapter emits `chainChanged` event.

An event handler named `onAdapterChanged` is also avaliable to get noticed when selected adapter is changed.

-   `onAdapterChanged: (adapter: Adapter | null) => void`: Called when current adapter is changed.

Here is an example:

```jsx
import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
function App() {
    const adapters = useMemo(() => [new TronLinkAdapter()]);
    const onAccountsChanged = useCallback((curAddr, preAddr) => {
        console.log('new address is: ', curAddr, ' previous address is: ', preAddr);
    }, []);
    return (
        <WalletProvider adapters={adapters} onAccountsChanged={onAccountsChanged}>
            /* here is application components */
        </WalletProvider>
    );
}
```

## `useWallet()`

`useWallet` is a react hook providing a set of properties and methods which can be used to select and connect wallet, get wallet state and so on.

> `useWallet()` must be used in the descendant components of `WalletProvider`!

### ReturnedValue

#### `autoConnect`

-   Type: `boolean`
    Synchronous with `autoConnect` property passed to `WalletProvider`.

#### `disableAutoConnectOnLoad`

-   Type: `boolean`
    Synchronous with `disableAutoConnectOnLoad` property passed to `WalletProvider`.

#### `wallet`

-   Type: `Wallet | null`
    The wallet current selected. If no wallet is selected, the value is `null`.

`Wallet` is defined as follow:

```typescript
interface Wallet {
    adapter: Adapter; // wallet adapter
    state: AdapterState;
}
enum AdapterState {
    NotFound = 'NotFound',
    Disconnect = 'Disconnected',
    Connected = 'Connected',
}
```

#### `address`

-   Type: `string | null`
    Address of current selected wallet. If no wallet is selected, the value is `null`.

#### `wallets`

-   Type: `Wallet[]`
    Wallet list based on current used adapters when initial `WalletProvider`.

#### `connecting`

-   Type: `boolean`
    Indicate if is connecting to the wallet.

#### `connected`

-   Type: `boolean`
    Indicate if is connected with the wallet.

#### `disconnecting`

-   Type: `boolean`
    Indicate if is connecting to the wallet.

### Methods

#### select

-   Type: `(walletAdapterName: AdapterName) => void`
    Select a wallet by walletAdapterName. Valid adapters can be found [here](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters)

#### connect

-   Type: `() => Promise<void>`
    Connect to current selected wallet.

#### disconnect

-   Type: `() => Promise<void>`
    Disconnect from current selected wallet.

### signTransaction

-   Type: `(transaction: Transaction) => Promise<SignedTransaction>`
    Sign a unsigned transaction. This method is the same as TronWeb API.

### signMessage

-   Type: `(message: string) => Promise<string>`
    Sign a message.

### Example

```js
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import { AdapterName } from '@tronweb3/tronwallet-abstract-adapter';

function Content() {
    const { connect, disconnect, select, connected } = useWallet();
    return (
        <div>
            <button type="button" onClick={() => select('TronLink Adapter')}>
                Select TronLink
            </button>
            <button type="button" disabled={connected} onClick={connect}>
                Connect
            </button>
            <button type="button" disabled={!connected} onClick={disconnect}>
                Disconnect
            </button>
        </div>
    );
}
```
