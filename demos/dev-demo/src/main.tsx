import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import VConsole from 'vconsole';
const vConsole = new VConsole();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App></App>
    </React.StrictMode>
);
