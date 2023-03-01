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
                // Custom derivate path for address
                getDerivationPath(index) {
                    return `44'/195'/0'/0/${index}`;
                },
            }),
        ],
        []
    );
};
```

For more information about tronwallet adapters, please refer to [`@tronweb3/tronwallet-adapters`](https://github.com/tronprotocol/tronwallet-adapter/tree/main/packages/adapters/adapters)
