# `@tronweb3/tronwallet-adapter-tronlink-evm`

This package provides an adapter to enable DApps to connect to the [TronLink Wallet extension](https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec).

## Demo

```typescript
import { TronLinkEvmAdapter } from '@tronweb3/tronwallet-adapter-tronlink-evm';

const adapter = new TronLinkEvmAdapter();
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

-   `Constructor()`

    ```typescript
    import { TronLinkEvmAdapter } from '@tronweb3/tronwallet-adapter-tronlink-evm';
    const tronLinkEvmAdapter = new TronLinkEvmAdapter();
    ```

**Caveat** Currently TronLink wallet does not support `addChain()` and `signTypedData()`.

More detailed API can be found in [Abstract Adapter](https://github.com/tronprotocol/tronwallet-adapter/blob/main/packages/adapters/abstract-adapter-evm/README.md).
