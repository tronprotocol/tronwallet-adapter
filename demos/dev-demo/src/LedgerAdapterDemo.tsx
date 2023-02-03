import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react';
import { LedgerAdapter } from '@tronweb3/tronwallet-adapters';
import { AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import { Box, Button, Typography, Alert, TextField } from '@mui/material';
import { tronWeb } from './tronweb';

export function LedgerAdapterDemo() {
    const [connectState, setConnectState] = useState(AdapterState.NotFound);
    const [account, setAccount] = useState('');
    const [signMessage, setSignMessage] = useState('Hello, Adapter');
    const [signedMessage, setSignedMessage] = useState('')
    const receiver = 'TMDKznuDWaZwfZHcM61FVFstyYNmK6Njk1';
    
    const [open, setOpen] = useState(false);
    const adapter = useMemo(() => new LedgerAdapter({ accountNumber: 2 }), []);

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

        adapter.on('disconnect', () => {
            console.log('---disconnect');
        });

        return () => {
            adapter.removeAllListeners();
        };
    }, [adapter]);

    async function onSignTransaction() {
        const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.1), adapter.address);
        const signedTransaction = await adapter.signTransaction(transaction);
        // const signedTransaction = await tronWeb.trx.sign(transaction);
        const res = await tronWeb.trx.sendRawTransaction(signedTransaction);
        setOpen(true);
    }

    const onSignMessage = useCallback(async function () {
        const res = await adapter.signMessage(signMessage);
        setSignedMessage(res);
    }, [adapter, signMessage, setSignedMessage]);

    const onVerifyMessage = useCallback(async function() {
        const address = await tronWeb.trx.verifyMessageV2(signMessage, signedMessage);
        alert(address === adapter.address ? '验证成功' : '验证失败')
    }, [signMessage, signedMessage, adapter])

    return (
        <Box sx={{ width: '100%', maxWidth: 500 }}>
            <h1>Ledger Demo</h1>
            <Typography variant="h6" gutterBottom>
                Your account address:
            </Typography>
            <Detail>{account}</Detail>


            <Typography variant="h6" gutterBottom>
                Current connection status:&nbsp;&nbsp;
                <span style={{ color: adapter?.connected ? '#08f108' : 'orange' }}>{connectState}</span>
            </Typography>
            <Typography variant="h6" gutterBottom>
                <TextField value={signMessage} onChange={e => setSignMessage(e.target.value)}></TextField>
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
            <Detail>
                <Button variant="contained" onClick={onSignMessage}>Sign Message</Button>&nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained" disabled={!signedMessage} onClick={onVerifyMessage}>Verify Signed Message</Button>
            </Detail>
            {open && (
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%', marginTop: 1 }}>
                    Success! You can confirm your transfer on{' '}
                    <a target="_blank" rel="noreferrer" href={`https://nile.tronscan.org/#/address/${adapter.address}`}>
                        Tron Scan
                    </a>
                </Alert>
            )}
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

