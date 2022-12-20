# TronWallet Adapter for Tron Apps

This is a quick setup guide and examples about how to add TronWallet Adapters to a React-based Tron DApp.

## Quick Setup (using React UI)

### Install

Install these dependencies:

```shell
npm install --save \
    @tronweb3/tronwallet-abstract-adapter \
    @tronweb3/tronwallet-adapters \
    @tronweb3/tronwallet-adapter-react-hooks \
    @tronweb3/tronwallet-adapter-react-ui
```

### Setup

`@tronweb3/tronwallet-adapter-react-hooks` and `@tronweb3/tronwallet-adapter-react-ui` provide a global state by `Context.Provider`. Accordingly, developers need to wrap `App` content within the `WalletProvider` and `WalletModalProvider`.

```jsx
import React, { useMemo } from 'react';
import { useWallet, WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui';
import { WalletDisconnectedError, WalletError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';

function App() {
    function onError(e: WalletError) {
        if (e instanceof WalletNotFoundError) {
            // some alert for wallet not found
        } else if (e instanceof WalletDisconnectedError) {
            // some alert for wallet not connected
        } else {
            console.error(e.message);
        }
    }
    const adapters = useMemo(function () {
        const tronLink = new TronLinkAdapter();
        const ledger = new LedgerAdapter({
            accountNumber: 2,
        });
        return [tronLink, ledger];
    }, []);
    return (
        <WalletProvider onError={onError} adapters={adapters}>
            <WalletModalProvider>{/* Place your app's components here */}</WalletModalProvider>
        </WalletProvider>
    );
}
```

### Usage

```jsx
import React, { useMemo } from 'react';
import TronWeb from 'tronweb';
const tronWeb: any = new TronWeb({
    fullHost: 'https://api.nileex.io', // here we use Nile test net
});

function SignDemo() {
    // You can call `useWallet` to get wallets state and methods
    const { wallet, address, connected, signMessage, signTransaction } = useWallet();
    const receiver = 'target address to tranfer';

    async function onSignMessage() {
        const res = await signMessage('Hello World');
    }

    async function onSignTransaction() {
        const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.1), address);
        const signedTransaction = await signTransaction(transaction);
        const res = await tronWeb.trx.sendRawTransaction(signedTransaction);
        console.log(res);
    }
    return (
        <div>
            <div>
                <h2>Wallet Connection Info</h2>
                <p>
                    {' '}
                    <span>Connection Status:</span> {connected ? 'Connected' : 'Disconnected'}{' '}
                </p>
                <p>
                    {' '}
                    <span>Your selected Wallet:</span> {wallet?.adapter.name}{' '}
                </p>
                <p>
                    {' '}
                    <span>Your Address:</span> {address}{' '}
                </p>
            </div>
            <div>
                <h2>Sign a message</h2>
                <button onClick={onSignMessage}> SignMessage </button>
                <h2>Sign a Transaction</h2>
                <button onClick={onSignTransaction}> Transfer </button>
            </div>
        </div>
    );
}
```
