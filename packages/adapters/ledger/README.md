# `@tronweb3/tronwallet-adapter-ledger`

This package provides an adapter to connect Ledger Wallet.

## Usage

```typescript
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';

const App = () => {
    const adapters = useMemo(
        () => [
            new LedgerAdapter({
                // Initial account number to get once connection is created
                accountNumber: 5,
            }),
        ],
        []
    );
};
```
