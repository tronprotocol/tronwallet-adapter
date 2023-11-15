# `@tronweb3/tronwallet-adapter-metamask`

This package provides an adapter to enable DApps to connect to the [MetaMask Wallet extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) and [MetaMask Wallet App](https://metamask.io/).

## Demo

```typescript
import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask';

const adapter = new MetaMaskAdapter();
// connect
await adapter.connect();

// then you can get address
console.log(adapter.address);

// just use the sendTransaction method to send a transfer transaction.
const transaction = {
    value: '0x' + Number(0.01 * Math.pow(10, 18)).toString(16), // 0.01 is 0.01ETH
    to: 'your target address',
    from: adapter.address,
};
await adapter.sendTransaction(transaction);
```

## Documentation

### API

-   `Constructor(config: MetaMaskAdapterOptions)`

    ```typescript
    import { MetaMaskAdapter } from '@tronweb3/tronwallet-adapter-metamask';
    interface MetaMaskAdapterOptions {
        /**
         * Set if open MetaMask app when in mobile device.
         * Default is true.
         */
        useDeeplink?: boolean;
    }
    const metaMaskAdapter = new MetaMaskAdapter({ useDeeplink: false });
    ```

More detailed API can be found in [Abstract Adapter](https://github.com/tronprotocol/tronwallet-adapter/blob/main/packages/adapters/abstract-adapter-evm/README.md).
