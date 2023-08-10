# `@tronweb3/tronwallet-abstract-evm-adapter`

This is the abstract interface definition of Evm Wallet Adapters. All wallet adapters implement abstract interface to provide unified interface.

## API Reference

### Adapter

The `Adapter` class defines the common interface for all adapters of specified wallets.

#### Constructor

-   `constructor(options)`: adapter constructor method, an optional config is valid. For detailed options type, refer to the specified adapter.
-   [MetaMask Adapter](https://github.com/tronprotocol/tronwallet-adapter/blob/main/packages/adapters/metamask/README.md)

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

-   `connect(): Promise<string>`: connect to the wallet. If the wallet is not avaliable, this method will throw an `WalletNotFoundError`.

-   `signMessage(params: { message: string, address?: string }): Promise<string>`: Sign a string, return the signature. If `address` is omitted, the default is `adapter.address`.

    ```typescript
    const message = 'Hello Web3!';
    const signature = await adapter.signMessage({ message });
    ```

-   `signTypedData(params: { typedData: Object, address?: string }): Promise<string>`: Sign a typed data, return the signature. If `address` is omitted, the default is `adapter.address`.

    It follows the [EIP-712](https://eips.ethereum.org/EIPS/eip-712) specification to allow users to sign typed structured data that can be verified on-chain

    ```typescript
    const typedData = {
        domain: {
            chainId: 1,
            name: 'Ether Mail',
            verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
            version: '1',
        },
        primaryType: 'Mail',
        types: {
            Mail: [
                { name: 'from', type: 'string' },
                { name: 'to', type: 'string' },
                { name: 'contents', type: 'string' },
            ],
        },
        message: {
            from: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            to: '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            contents: 'Hello',
        },
    };
    const signature = await adapter.signTypedData({ typedData: typedData });
    ```

-   `sendTransaction(transaction?)`: Sign and send a transaction, return the signature. The parameter is the same as `eth_sendTransaction` JSON-RPC request.

    ```javascript
    const transaction = {
        from: adapter.address, // The user's active address.
        to: 'address', // Required except during contract publications.
        value: 1000, // Only required to send ether to the recipient from the initiating external account.
        gasLimit: '0x5028', // Customizable by the user during MetaMask confirmation.
        maxPriorityFeePerGas: '0x3b9aca00', // Customizable by the user during MetaMask confirmation.
        maxFeePerGas: '0x2540be400', // Customizable by the user during MetaMask confirmation.
    };
    const signature = await adapter.sendTransaction(transaction);
    ```

-   `addChain(chainInfo: Chain): Promise<null>`: Add the specified chain to wallet using `wallet_addEthereumChain` request. This method is specified by [EIP-3085](https://eips.ethereum.org/EIPS/eip-3085).

    ```typescript
    const chainInfo = {
        chainId: '0x539',
        chainName: 'Localhost',
        nativeCurrency: {
            name: 'Ethereum Token',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['http://localhost:8545'],
    };
    await adapter.addChain(chainInfo);
    ```

-   `switchChain(chainId: string): Promise<null>;`: request wallet to switch chain by `chainId`, the chain ID as a 0x-prefixed hexadecimal string. This method is specified by [EIP-3326](https://ethereum-magicians.org/t/eip-3326-wallet-switchethereumchain).

    ```typescript
    await adapter.switchChain('0x539');
    ```

-   `watchAsset(asset: Asset): Promise<null>`: Requests that the user track the specified ERC-20 token or NFT(s) in the wallet. This method is specified by [EIP-747](https://eips.ethereum.org/EIPS/eip-747).

    ```typescript
    const assetInfo = {
        type: 'ERC20',
        options: {
            address: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
            symbol: 'FOO',
            decimals: 18,
            image: 'https://foo.io/token-image.svg',
        },
    };
    await adapter.watchAsset(assetInfo);
    ```

    The parameter is an object containing the following metadata of the token to watch:

    -   type - Supports ERC-20, ERC-721, and ERC-1155 tokens. Support for ERC-721 and ERC-1155 tokens is experimental and currently only available on the extension (not on mobile).
    -   options - An object containing:
        -   address - The address of the token contract.
        -   symbol - The symbol of the token, up to 11 characters (optional for ERC-20 tokens).
        -   decimals - The number of token decimals (optional for ERC-20 tokens).
        -   image - A URL string of the token logo (optional for ERC-20 tokens).
        -   tokenId - The unique identifier of the NFT (required for ERC-721 and ERC-1155 tokens).

#### Events

`Adapter` extends the `EventEmitter` class in `eventemitter3` package. So you can listen to the events by `adapter.on('connect', function() {})`.

Events are as follows:

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
-   `accountsChanged(address: string, preAddress: string)`: Emit when the user's exposed account address changes.

```typescript
adapter.on('accountsChanged', (accounts: Array<string>) => {
    if (accounts.length > 0) {
        // the wallet connected and you can call adapter.signMessage() or adapter.sendTransaction()
    } else {
        // the wallet is disconnected
    }
});
```

-   `chainChanged(chainId: number)`: Emit when users change the current selected chain in wallet. The parameter is the new network infomation：

```typescript
adapter.on('chainChanged', handler: (chainId: string) => void);
```

-   `connect(address)`: Emit when the wallet is first able to submit RPC requests to a chain.

```typescript
interface ConnectInfo {
  chainId: string;
}

adapter.on('connect', handler: (connectInfo: ConnectInfo) => void);
```

-   `disconnect()`: Emit if it becomes unable to submit RPC requests to a chain. In general, this only happens due to network connectivity issues or some unforeseen error.

```typescript
interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}
adapter.on('disconnect', handler: (error: ProviderRpcError) => void);
```

The more detailed information for `connect/disconnect/accountsChanged/chainChanged` is specified in [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193#events-1).

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
-   `WalletDisconnectedError`: Occurs when wallet is disconnected. Used by some wallets which won't connect automatically when call `signMessage()` or `signTransaction()`.
-   `WalletConnectionError`: Occurs when try to connect a wallet.

Following exmaple shows how to get original error info with `WalletError`:

```js
const adapter = new TronLinkAdapter();
try {
    await adapter.connect();
} catch (e: any) {
    const originalError = e.error;
}
```
