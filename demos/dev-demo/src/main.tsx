import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@tronweb3/tronwallet-adapter-react-ui/style.css';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui';
import VConsole from 'vconsole';
const vConsole = new VConsole();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <WalletProvider autoConnect={true}>
            <WalletModalProvider>
                <App></App>
            </WalletModalProvider>
        </WalletProvider>
    </React.StrictMode>
);
