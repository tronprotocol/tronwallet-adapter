import * as React from 'react';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import ReactDOM from 'react-dom/client';
import '@tronweb3/tronwallet-adapter-react-ui/style.css';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { App } from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
// import vConsole from 'vconsole'
// new vConsole();
console.log(window.tronLink.ready, window.tronWeb.ready, window.tronWeb && window.tronWeb.defaultAddress)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <App></App>
            <Toaster />
        </ThemeProvider>
    </React.StrictMode>
);
