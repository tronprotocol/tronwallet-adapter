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
import { AppWraper } from './AppWraper.js';
const vConsole = new VConsole();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <AppWraper></AppWraper>
        </ThemeProvider>
    </React.StrictMode>
);
