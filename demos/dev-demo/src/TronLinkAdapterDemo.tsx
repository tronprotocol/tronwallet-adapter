import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
// import './App.css';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import { AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import { Box, Button, Typography, Tooltip, Select, MenuItem, Alert } from '@mui/material';

export function TronLinkAdapterDemo() {
    const [connectState, setConnectState] = useState(AdapterState.NotFound);
    const [account, setAccount] = useState('');
    const [chainId, setChainId] = useState<string>('');
    const [selectedChainId, setSelectedChainId] = useState('0xcd8690dc')
    const receiver = 'TMDKznuDWaZwfZHcM61FVFstyYNmK6Njk1';
    const [open, setOpen] = useState(false);
    const adapter = useMemo(() => new TronLinkAdapter(), []);

    useEffect(() => {
        console.log('--- new adapter ----');
        setConnectState(adapter.state);
        setAccount(adapter.address || '');

        adapter.on('connect', () => {
            console.log('---connect', adapter.address);
            setAccount(adapter.address || '');
        });
        adapter.on('stateChanged', (state) => {
            console.log('---state change', state);
            setConnectState(state);
        });
        adapter.on('accountsChanged', (data) => {
            console.log('---account changed', data);
            setAccount(data as string);
        });

        adapter.on('chainChanged', (data) => {
            console.log('---chain changed', data);
            setChainId((data  as any).chainId);
        });

        adapter.on('disconnect', () => {
            console.log('---disconnect');
        });

        return () => {
            adapter.removeAllListeners();
        };
    }, [adapter]);

    function onSwitchChain() {
        adapter.switchChain(selectedChainId)
    }

    async function onSignTransaction() {
        const tronWeb = (window.tron as any).tronWeb as any;
        const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.1), adapter.address);
        const signedTransaction = await adapter.signTransaction(transaction);
        // const signedTransaction = await tronWeb.trx.sign(transaction);
        const res = await tronWeb.trx.sendRawTransaction(signedTransaction);
        setOpen(true);
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 500 }}>
            <h1>TronLink Demo</h1>
            <Typography variant="h6" gutterBottom>
                Your account address:
            </Typography>
            <Detail>{account}</Detail>

            <Typography variant="h6" gutterBottom>
                Current network you choose: {chainId}
            </Typography>

            <Typography variant="h6" gutterBottom>
                Current connection status:&nbsp;&nbsp;
                <span style={{ color: adapter?.connected ? '#08f108' : 'orange' }}>{connectState}</span>
            </Typography>
            <Detail>
                <Button variant="contained" disabled={adapter?.connected} onClick={() => adapter?.connect()}>
                    Connect
                </Button>&nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained" disabled={!adapter?.connected} onClick={() => adapter?.disconnect()}>
                    Disconnect
                </Button>&nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained" disabled={!adapter?.connected} onClick={onSignTransaction}>Transfer</Button>
            </Detail>
            {open && (
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%', marginTop: 1 }}>
                    Success! You can confirm your transfer on{' '}
                    <a target="_blank" rel="noreferrer" href={`https://nile.tronscan.org/#/address/${adapter.address}`}>
                        Tron Scan
                    </a>
                </Alert>
            )}
            <Typography variant="h6" gutterBottom>
                You can switch chain by click the button.
            </Typography>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedChainId}
                label="Chain"
                onChange={(e) => setSelectedChainId(e.target.value)}
            >
                <MenuItem value={'0x2b6653dc'}>Mainnet</MenuItem>
                <MenuItem value={'0x94a9059e'}>Shasta</MenuItem>
                <MenuItem value={'0xcd8690dc'}>Nile</MenuItem>
            </Select>
            
            <Button style={{ marginRight: '20px' }} onClick={onSwitchChain}>
                Switch Chain to {selectedChainId}
            </Button>
        </Box>
    );
}

function Detail(props: { children: ReactNode }) {
    return (
        <Typography sx={{ ml: 4 }} variant="body1" gutterBottom>
            {props.children}
        </Typography>
    );
}

