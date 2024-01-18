# @tronweb3/tronwallet-adapter-vue-hooks

`@tronweb3/tronwallet-adapter-vue-hooks` provides a `useWallet()` hook which will make it easy to "Connect Wallet" and listen to the state change for developers.

## Installation

```bash
npm install @tronweb3/tronwallet-adapter-vue-hooks @tronweb3/tronwallet-abstract-adapter @tronweb3/tronwallet-adapters
# or pnpm install @tronweb3/tronwallet-adapter-vue-hooks @tronweb3/tronwallet-abstract-adapter @tronweb3/tronwallet-adapters
# or yarn install @tronweb3/tronwallet-adapter-vue-hooks @tronweb3/tronwallet-abstract-adapter @tronweb3/tronwallet-adapters
```

## Usage

`@tronweb3/tronwallet-adapter-vue-hooks` uses [`Provide / Inject ` in Vue](https://vuejs.org/guide/components/provide-inject.html) to maintain a shared data. So developers need to wrap `App` content within the `WalletProvider`.

You can provide a `onError` callback to handle various errors such as `WalletConnectionError`, `WalletNotFoundError`.

Here is a [Demo project](https://github.com/tronprotocol/tronwallet-adapter/tree/main/demos/vue-ui/vite-app);

```html
<script setup>
    import { defineComponent, h } from 'vue';
    import { WalletProvider, useWallet } from '@tronweb3/tronwallet-adapter-vue-hooks';
    import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
    const tronLink = new TronLinkAdapter();

    const adapters = [tronLink];

    function onConnect(address) {
        console.log('[wallet hooks] onConnect: ', address);
    }
    function onDisconnect() {
        console.log('[wallet hooks] onDisconnect');
    }

    const VueComponent = defineComponent({
        setup() {
            // Here you can use `useWallet` API
            const { wallet, connect, signMessage, signTransaction } = useWallet();
            return () =>
                h('div', [
                    h('div', { style: 'color: #222;' }, `Current Adapter: ${(wallet && wallet.adapter.name) || ''}`),
                ]);
        },
    });
</script>

<template>
    <WalletProvider :adapters="adapters" @connect="onConnect" @disconnect="onDisconnect">
        <VueComponent />
    </WalletProvider>
</template>
```

## `WalletProvider`

`WalletProvider` and `useWallet` work together. `WalletProvider` use `provide()` in Vue to provide a shared state. `useWallet` use `inject()` to get the shared state. Developers need to wrap application components with `WalletProvider`.

```html
<html>
    <WalletProvider>/* here is application components */</WalletProvider>
</html>
<script setup>
    import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-vue-hooks';
</script>
```

### Props

#### adapters:

-   Required: `false`
-   Type: `Adapter[]`
-   Default: `[ new TronLinkAdapter() ]`

Used to specify what wallet adapters are supported. All wallet adapters can be imported from `@tronweb3/tronwallet-adapters` package or their standalone package.

-   Example
    ```html
    <template>
        <WalletProvider :adapters="adapters">/* here is application components */</WalletProvider>
    </template>
    <script setup>
        import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-vue-hooks';
        import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
        const adapters = [new TronLinkAdapter()];
    </script>
    ```

#### autoConnect

-   Required: `false`
-   Type: `boolean`
-   Default: `true`

Whether connect to the specified wallet automatically when loading the page and selecting a wallet.

#### disableAutoConnectOnLoad

-   Required: `false`
-   Type: `boolean`
-   Default: `false`

When `autoConnect` enabled, whether automatically connect to current selected wallet when loading the page.
If you don't want to connect the wallet when page is first loaded, set `disableAutoConnectOnLoad: true`.

#### localStorageKey

-   Required: `false`
-   Type: `string`
-   Default: `tronAdapterName`

Specified the key used to cache wallet name in `localStorage`. When user select a wallet, applications will cache the wallet name to localStorage.

#### Events

You can provide event handlers for listen adapter events, such as `connect`,`disconnect`,`accountsChanged`. Available events and their types are as follows:

-   `readyStateChanged: (readyState: 'Found' | 'NotFound') => void`: Emits when current adapter emits `readyStateChanged` event.
-   `connect: (address: string) => void`: Emits when current adapter emits `connect` event.
-   `disconnect: () => void`: Emits when current adapter emits `disconnect` event.
-   `accountsChanged: (newAddress: string; preAddress?: string) => void`: Emits when current adapter emits `accountsChanged` event.
-   `chainChanged: (chainData: unknow) => void`: Emits when current adapter emits `chainChanged` event.
-   `error: (error) => void`: Emits when occurs error in methods calls.

An event named `adapterChanged` is also avaliable to get noticed when selected adapter is changed.

-   `adapterChanged: (adapter: Adapter | undefined) => void`: Called when current adapter is changed.

Here is an example:

    ```html
    <template>
        <WalletProvider :adapters="adapters" @accountsChanged="onAccountsChanged">/* here is application components */</WalletProvider>
    </template>
    <script setup>
        import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-vue-hooks';
        import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
        const adapters = [new TronLinkAdapter()];

        function onAccountsChanged(curAddress, preAddress) {}
    </script>
    ```

## `useWallet()`

`useWallet` is a react hook providing a set of properties and methods which can be used to select and connect wallet, get wallet state and so on.

> `useWallet()` must be used in the descendant components of `WalletProvider`!

### ReturnedValue

#### `autoConnect`

-   Type: `ComputedRef<boolean>`
    Synchronous with `autoConnect` property passed to `WalletProvider`.

#### `disableAutoConnectOnLoad`

-   Type: `ComputedRef<boolean>`
    Synchronous with `disableAutoConnectOnLoad` property passed to `WalletProvider`.

#### `wallet`

-   Type: `ComputedRef<Wallet | null>`
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

-   Type: `ComputedRef<string | null>`
    Address of current selected wallet. If no wallet is selected, the value is `null`.

#### `wallets`

-   Type: `Ref<Wallet[]>`
    Wallet list based on current used adapters when initial `WalletProvider`.

#### `connecting`

-   Type: `Ref<boolean>`
    Indicate if is connecting to the wallet.

#### `connected`

-   Type: `Ref<boolean>`
    Indicate if is connected with the wallet.

#### `disconnecting`

-   Type: `Ref<boolean>`
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

```html
<template>
    <div>
        <button type="button" @click="() => select('TronLink Adapter')">Select TronLink</button>
        <button type="button" :disabled="connected" @click="connect">Connect</button>
        <button type="button" :disabled="!connected" @click="disconnect">Disconnect</button>
    </div>
</template>
<script setup>
    import { useWallet } from '@tronweb3/tronwallet-adapter-vue-hooks';
    import { AdapterName } from '@tronweb3/tronwallet-abstract-adapter';

    const { connect, disconnect, select, connected } = useWallet();
</script>
```
