# `@tronweb3/tronwallet-adapter-tokenpocket`

This package provides an adapter to enable TRON DApps to connect to the [TokenPocket Wallet App](https://tokenpocket.pro/).

## Demo

```typescript
import { TokenPocketAdapter } from '@tronweb3/tronwallet-adapter-tokenpocket';
// import TronWeb from 'tronweb';

const adapter = new TokenPocketAdapter();
// connect to TokenPocket
await adapter.connect();

// then you can get address
console.log(adapter.address);

// create a send TRX transaction
const unSignedTransaction = await tronWeb.transactionBuilder.sendTrx(targetAddress, 100, adapter.address);
// using adapter to sign the transaction
const signedTransaction = await adapter.signTransaction(unSignedTransaction);
// broadcase the transaction
await tronWeb.trx.sendRawTransaction(signedTransaction);
```

## Documentation

For more information about tronwallet adapters, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters)

### Caveats

-   TokenPocket App doesn't implement `signMessage()`, `multiSign()` and `switchChain()`.
-   TokenPocket App will reload current page so there is no need to listen `accountsChanged` event.
