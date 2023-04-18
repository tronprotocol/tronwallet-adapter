# `@tronweb3/tronwallet-adapter-ledger`

This package provides an adapter for the Ledger Wallet.

## Demo

```typescript
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';
import TronWeb from 'tronweb';
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { 'TRON-PRO-API-KEY': 'your api key' },
});

const adapter = new LedgerAdapter({
    // Initial total accounts to get once connection is created
    accountNumber: 5,
    // Custom derivate path for address
    getDerivationPath(index) {
        return `44'/195'/0'/0/${index}`;
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

-   `Constructor(config: LedgerAdapterConfig)`

    ```typescript
    interface LedgerAdapterConfig {
        /**
         * Set if open Wallet's website when wallet is not installed.
         * Default is true.
         */
        openUrlWhenWalletNotFound?: boolean;
        /**
         * Initial total accounts to get once connection is created, default is 1
         */
        accountNumber?: number;

        /**
         * Hook function to call before connecting to ledger and geting accounts.
         * By default, a modal will popup to reminder user to prepare the ledger and enter Tron app.
         * You can specify a function to disable this modal.
         */
        beforeConnect?: () => Promise<unknown> | unknown;

        /**
         * Hook function to call after connecting to ledger and geting initial accounts.
         * The function should return the selected account including the index of account.
         * Following operations such as `signMessage` will use the selected account.
         */
        selectAccount?: (params: { accounts: Account[]; ledgerUtils: LedgerUtils }) => Promise<Account>;

        /**
         * Function to get derivate BIP44 path by index.
         * Default is `44'/195'/${index}'/0/0`
         */
        getDerivationPath?: (index: number) => string;
    }
    interface Account {
        /**
         * The index to get BIP44 path.
         */
        index: number;
        /**
         * The BIP44 path to derivate address.
         */
        path: string;
        /**
         * The derivated address.
         */
        address: string;
    }
    interface LedgerUtils {
        /**
         * Get accounts from ledger by index. `from` is included and `to` is excluded.
         * User can use the function to load more accounts.
         */
        getAccounts: (from: number, to: number) => Promise<Account[]>;
        /**
         * Request to get an address with specified index using getDerivationPath(index) to get BIP44 path.
         * If `display` is true, will request user to approve on ledger.
         * The promise will resove if user approve and reject if user cancel the operation.
         */
        getAddress: (index: number, display: boolean) => Promise<{ publicKey: string; address: string }>;
    }
    ```

-   Property: `ledgerUtils`
    `ledgerUtils` on LedgerAdapter is used to get useful functions to interact with Ledger directly. `ledgerUtils` is defined as last section.

    -   `getAccounts(from: number, to: number)` is a wrapped function to get multiple accounts by index range from ledger.
        For example:

        ```typescript
        const adapter = new LedgerAdapter();
        // get 5 accounts from ledger
        const accounts = await adapter.ledgerUtils.getAcccounts(0, 5);
        // [{ address: string, index: 0, path: "44'/195'/0'/0/0" }, ...]
        ```

    -   `getAddress: (index: number, display: boolean)` is a raw function to request an address from ledger.
        If `display` is true, will request user to approve on ledger.
        For example, following code will request user approve on Ledger to confirm to connect their ledger.

        ```typescript
        const adapter = new LedgerAdapter();
        const result = await adapter.ledgerUtils.getAddress(0, true);
        // { address: 'some address', publicKey: 'publicKey for address' }
        ```

### Caveats

-   `multiSign()` and `switchChain(chainId: string)` are not supported.

For more information about tronwallet adapters, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters)
