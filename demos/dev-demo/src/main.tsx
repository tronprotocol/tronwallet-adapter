import * as React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@tronweb3/tronwallet-adapter-react-ui/style.css';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-react-hooks';
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-react-ui';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import VConsole from 'vconsole';
import './index.css';
const vConsole = new VConsole();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <WalletProvider autoConnect={true}>
                <WalletModalProvider>
                    <App></App>
                </WalletModalProvider>
            </WalletProvider>
        </ThemeProvider>
    </React.StrictMode>
);
