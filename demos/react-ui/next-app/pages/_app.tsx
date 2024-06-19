import '../styles/globals.css';
import type { AppProps } from 'next/app';
import type { Adapter, WalletError } from '@tronweb3/tronwallet-abstract-adapter';
import { WalletDisconnectedError, WalletNotFoundError } from '@tronweb3/tronwallet-abstract-adapter';
// @ts-ignore
import { toast } from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui';
import '@tronweb3/tronwallet-adapter-react-ui/style.css';
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';
export default function App({ Component, pageProps }: AppProps) {
    function onError(e: WalletError) {
        if (e instanceof WalletNotFoundError) {
            toast.error(e.message);
        } else if (e instanceof WalletDisconnectedError) {
            toast.error(e.message);
        } else toast.error(e.message);
    }
    const [adapters, setAdapters] = useState<Adapter[]>([]);
    useEffect(() => {
        import('@tronweb3/tronwallet-adapters').then((res) => {
            const {
                BitKeepAdapter,
                OkxWalletAdapter,
                TokenPocketAdapter,
                TronLinkAdapter,
                WalletConnectAdapter
            } = res;
                const tronLinkAdapter = new TronLinkAdapter();
            const ledger = new LedgerAdapter({
                accountNumber: 2,
            });
            const walletConnectAdapter = new WalletConnectAdapter({
                network: 'Nile',
                options: {
                    relayUrl: 'wss://relay.walletconnect.com',
                    // example WC app project ID
                    projectId: '5fc507d8fc7ae913fff0b8071c7df231',
                    metadata: {
                        name: 'Test DApp',
                        description: 'JustLend WalletConnect',
                        url: 'https://your-dapp-url.org/',
                        icons: ['https://your-dapp-url.org/mainLogo.svg'],
                    },
                },
                web3ModalConfig: {
                    themeMode: 'dark',
                    themeVariables: {
                        '--w3m-z-index': '1000',
                    },
                },
            });
            const bitKeepAdapter = new BitKeepAdapter();
            const tokenPocketAdapter = new TokenPocketAdapter();
            const okxwalletAdapter = new OkxWalletAdapter();
            setAdapters([tronLinkAdapter, bitKeepAdapter, tokenPocketAdapter, okxwalletAdapter, walletConnectAdapter, ledger])
        });
    }, [setAdapters])

    /**
     * wrap your app content with WalletProvider and WalletModalProvider
     * WalletProvider provide some useful properties and methods
     * WalletModalProvider provide a Modal in which you can select wallet you want use.
     *
     * Also you can provide a onError callback to process any error such as ConnectionError
     */
    return (
        <WalletProvider onError={onError} adapters={adapters} disableAutoConnectOnLoad={true}>
            <WalletModalProvider>
                <Component {...pageProps} />
            </WalletModalProvider>
        </WalletProvider>
    );
}
