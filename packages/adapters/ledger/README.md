# `@tronweb3/tronwallet-adapter-ledger`

This package provides an adapter for the Ledger Wallet.

## Usage

```typescript
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';

const App = () => {
    const adapters = useMemo(
        () => [
            new LedgerAdapter({
                // Initial total accounts to get once connection is created
                accountNumber: 5,
            }),
        ],
        []
    );
};
```

For more information about tronwallet adapters, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters)
