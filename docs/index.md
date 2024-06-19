# Overview

TronwalletAdapter is a set of packages that contain wallet adapters and components for Tron DApps. With out-of-box components and unified methods, developers can easily interact with multiple kink of wallets, `select/connect/disconnect`  wallets and sign a message or transaction.

## Adapters

Wallet adapters help you to access to TRON wallets with consistent API.

There are many wallets supporting TRON network such as TronLink, Ledger and so on . **Different wallets** and **different versions** of one wallet may have different interface to use. The aim of **Adapters** relavant pacakges is to shield these differences and offer consistent interface for DApp developers. DApps don't need to change their code frequently if they have accessed to the tron wallet dapters code.

For example if you want to connect to different wallets, you have to use different methods:

```js
// TronLink
window.tronLink.request({ method: 'tron_requestAccounts' });

// Ledger
const transport = await TransportWebHID.create();
const app = new Trx(transport);

// WalletConnect
const wallet = new WalletConnectWallet({
   network: this._config.network,
   options: this._config.options,
});
```

With adapter, you can use consistent APIs for different wallets:

```js
// TronLink
const tronlinkAdapter = new TronLinkAdapter();
await tronlinkAdapter.connect();
await tronlinkAdapter.signMessage(message);

// Ledger
const ledgerAdapter = new LedgerAdapter();
await ledgerAdapter.connect();
await ledgerAdapter.signMessage(message);

// WalletConnect
const walletconnectAdapter = new WalletConnectAdapter();
await walletconnectAdapter.connect();
await walletconnectAdapter.signMessage(message);
```

## React Hooks

React hook is a hook to manage the global state of wallet, such as current selected wallet and the connect state, address, and so on. It also provides some methods to interact with wallet.

When your dapp supports multiple wallets, with the help of `useWallet()` hook you can easily:

-   select which wallet to use
-   connect to the selected wallet
-   disconnect to the selected wallet
-   call `signMessage` or `signTransaction` of the selected wallet

Examples:

```jsx
function Comp() {
   const { wallet, address, connected, select, connect, disconnect, signMessage, signTransaction } = useWallet();
   return (
       <div>
           <button onClick={() => select('TronLink')}>Select Wallet</button>
           <button onClick={connect}>Connect</button>
           <button onClick={disconnect}>Disconnect</button>
           <button onClick={() => signMessage('Hello World')}>Sign Message</button>
       </div>
   );
}
```

## React UI Components

`useWallet()` only contains logic to manage wallet state. Besides, we provide a set of out-of-box components to help you interact with wallets:

-   `WalletSelectButton`: Show wallets dialog to select a wallet
-   `WalletConnectButton`: Connect to the selected wallet
-   `WalletDisconnectButton`: Disconnect to the selected wallet
-   `WalletActionButton`: A Button with multiple actions include `select/connect/disconnect`

Here is the demo image:
![demo.png](https://raw.githubusercontent.com/tronprotocol/tronwallet-adapter/main/demo.png)


## Vue hook

Vue hook is a hook to manage the global state of wallet, such as current selected wallet and the connect state, address, and so on. It also provides some methods to interact with wallet.

When your dapp supports multiple wallets, with the help of `useWallet()` hook you can easily:

-   select which wallet to use
-   connect to the selected wallet
-   disconnect to the selected wallet
-   call `signMessage` or `signTransaction` of the selected wallet

Examples:
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

## Vue UI Components

`useWallet()` only contains logic to manage wallet state. Besides, we provide a set of out-of-box components to help you interact with wallets:

-   `WalletSelectButton`: Show wallets dialog to select a wallet
-   `WalletConnectButton`: Connect to the selected wallet
-   `WalletDisconnectButton`: Disconnect to the selected wallet
-   `WalletActionButton`: A Button with multiple actions include `select/connect/disconnect`

Here is the demo image:
![demo.png](https://raw.githubusercontent.com/tronprotocol/tronwallet-adapter/main/demo.png)