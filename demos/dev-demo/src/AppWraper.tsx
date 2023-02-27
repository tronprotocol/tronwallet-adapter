import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui';
import { LedgerAdapter, TronLinkAdapter, WalletConnectAdapter } from '@tronweb3/tronwallet-adapters';
import { useMemo } from 'react';
import App from './App.js';

export function AppWraper() {
    const adapters = useMemo(() => {
        return [
            new TronLinkAdapter(),
            new LedgerAdapter(),
            new WalletConnectAdapter({
                network: 'Nile',
                options: {
                    relayUrl: 'wss://relay.walletconnect.com',
                    // example walletconnect app project ID
                    projectId: 'e899c82be21d4acca2c8aec45e893598',
                    metadata: {
                        name: 'Example App',
                        description: 'Example App',
                        url: 'https://yourdapp-url.com',
                        icons: ['https://yourdapp-url.com/icon.png'],
                    },
                },
            }),
        ];
    }, []);
    return (
        <WalletProvider autoConnect={false} adapters={adapters} onError={console.log}>
            <WalletModalProvider>
                <App></App>
            </WalletModalProvider>
        </WalletProvider>
    );
}
