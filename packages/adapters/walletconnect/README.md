# `@tronweb3/tronwallet-adapter-walletconnect`

This package provides an adapter to enable tron dapps to connect [WalletConnect](https://walletconnect.com/).

## Usage

```typescript
import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect';

const App = () => {
    const adapters = useMemo(
        () => [
            new WalletConnectAdapter({
                network: 'Nile',
                options: {
                    relayUrl: 'wss://relay.walletconnect.com',
                    // example WC app project ID
                    projectId: 'e899c82be21d4acca2c8aec45e893598',
                    metadata: {
                        name: 'Example App',
                        description: 'Example App',
                        url: 'https://yourdapp-url.com',
                        icons: ['https://yourdapp-url.com/icon.png'],
                    },
                },
            }),
        ],
        []
    );
};
```
