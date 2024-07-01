import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import type { Adapter } from '@tronweb3/tronwallet-abstract-adapter';
import { AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import { Box, Button, Typography, Alert, TextField } from '@mui/material';
import { tronWeb } from './tronweb.js';
const receiver = 'TMDKznuDWaZwfZHcM61FVFstyYNmK6Njk1';

export function XDEFIWalletAdapterDemo() {
    const [connectState, setConnectState] = useState(AdapterState.NotFound);
    const [account, setAccount] = useState('');
    const [readyState, setReadyState] = useState('');
    const [chainId, setChainId] = useState<string>('');
    const [open, setOpen] = useState(false);
    const [signMessage, setSignMessage] = useState('Hello, Adapter');
    const [signedMessage, setSignedMessage] = useState('');
    const adapter = useMemo(() => new TronLinkAdapter({
        openTronLinkAppOnMobile: true,
        openUrlWhenWalletNotFound: false,
        checkTimeout: 3000
    }), []);

    useEffect(() => {
        setConnectState(adapter.state);
        setAccount(adapter.address || '');
        setReadyState(adapter.readyState);
        if (adapter.connected) {
            adapter.network().then((res) => {
                setChainId(res.chainId)
            }).catch(e => {
                console.log(e)
            })
        }

        adapter.on('readyStateChanged', () => {
            setReadyState(adapter.readyState)
        })
        adapter.on('connect', async () => {
            setAccount(adapter.address || '');
            adapter.network().then((res) => {
                setChainId(res.chainId)
            }).catch(e => {
                console.error('network() error:',e)
            })
        });
        adapter.on('stateChanged', (state) => {
            setConnectState(state);
        });
        adapter.on('accountsChanged', (data, preaddr) => {
            setAccount(data as string);
        });

        adapter.on('chainChanged', (data) => {
            setChainId((data as any).chainId);
        });

        adapter.on('disconnect', () => {
            setAccount(adapter.address || '')
        });

        return () => {
            adapter.removeAllListeners();
        };
    }, [adapter]);

    async function onSignTransaction() {
        const tronWeb = (window.tron as any).tronWeb as any;
        const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.000001), adapter.address);
        const signedTransaction = await adapter.signTransaction(transaction);
        const res = await tronWeb.trx.sendRawTransaction(signedTransaction);
        setOpen(true);
    }

    const onSignMessage = useCallback(
        async function () {
            const res = await adapter.signMessage(signMessage);
            setSignedMessage(res);
        },
        [adapter, signMessage, setSignedMessage]
    );

    const onVerifyMessage = useCallback(
        async function () {
            const address = await tronWeb.trx.verifyMessageV2(signMessage, signedMessage);
            alert(address === adapter.address ? 'success verify' : 'failed verify');
        },
        [signMessage, signedMessage, adapter]
    );

    async function handleConnect() {
        try {
            await adapter?.connect();
        } catch(e: any) {
            console.log(e.error?.message || e.message);
        }
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 900 }}>
            <h1>XDEFI Wallet Adapter Demo Demo</h1>
            <Typography variant="h6" gutterBottom>
                Your account address:
            </Typography>
            <Detail>{account}</Detail>

            <Typography variant="h6" gutterBottom>
                Current network: {chainId}
            </Typography>

            <Typography variant="h6" gutterBottom>
                ReadyState: {readyState}
            </Typography>
            <Typography variant="h6" gutterBottom>
                Current connection status:
                <span style={{ color: adapter?.connected ? '#08f108' : 'orange' }}> {connectState}</span>
            </Typography>
            <Typography variant="h6" gutterBottom>
                <TextField label="Message to sign" size="small" value={signMessage} onChange={(e) => setSignMessage(e.target.value)}></TextField>
            </Typography>
            <Detail>
                <Button variant="contained" disabled={adapter?.connected} onClick={handleConnect}>
                    Connect
                </Button>
                
                <Button variant="contained" disabled={!adapter?.connected} onClick={() => adapter?.disconnect()}>
                    Disconnect
                </Button>
                
                <Button variant="contained" disabled={!adapter?.connected} onClick={onSignTransaction}>
                    Transfer
                </Button>
            </Detail>
            <Detail>
                <Button variant="contained" onClick={onSignMessage}>
                    Sign Message
                </Button>
                
                <Button variant="contained" disabled={!signedMessage} onClick={onVerifyMessage}>
                    Verify Signed Message
                </Button>
            </Detail>
            {open && (
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%', marginTop: 1 }}>
                    Success! You can confirm your transfer on{' '}
                    <a target="_blank" rel="noreferrer" href={`https://nile.tronscan.org/#/address/${adapter.address}`}>
                        Tron Scan
                    </a>
                </Alert>
            )}

            <MultiSignDemo address={account} adapter={adapter}></MultiSignDemo>
        </Box>
    );
}

export function Detail(props: { children: ReactNode }) {
    return <div style={{ margin: 15 }}>{props.children}</div>;
}

function MultiSignDemo(props: { address: string; adapter: Adapter }) {
    const [open, setOpen] = useState(false);
    const [transferTransaction, setTransferTransaction] = useState(null);
    const [canSend, setCanSend] = useState(false);

    const multiSignWithAddress1 = useCallback(
        async function () {
            const tronWeb = (window.tron as any).tronWeb as any;
            const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.000001), props.address, { permissionId: 2 });
            const signedTransaction = await props.adapter.multiSign(transaction, null, 2);
            setTransferTransaction(signedTransaction);
        },
        [props.adapter, setTransferTransaction, props.address]
    );

    const multiSignWithAddress2 = useCallback(
        async function () {
            const signedTransaction = await props.adapter.multiSign(transferTransaction as any, null, 2);
            setTransferTransaction(signedTransaction);
            const signWeight = await tronWeb.trx.getSignWeight(signedTransaction, 2);
            if (signWeight.current_weight >= 2) {
                setCanSend(true);
            }
        },
        [transferTransaction, setTransferTransaction, setCanSend, props.adapter]
    );
    async function broadcast() {
        const res = await tronWeb.trx.broadcast(transferTransaction);
        setOpen(true);
    }

    return (
        <>
            <h3>MultiSign Demo</h3>

            <p>You can click following buttons to multiSign and send the Transaction</p>
            <div>
                <Button disabled={!props.address} variant="contained" onClick={multiSignWithAddress1}>
                    Sign with 1st Address
                </Button>
                <Button disabled={!transferTransaction} style={{ marginLeft: 10 }} variant="contained" onClick={multiSignWithAddress2}>
                    Sign with 2nd Address
                </Button>
                <Button style={{ marginLeft: 10 }} variant="contained" onClick={broadcast}>
                    Send the transaction
                </Button>
            </div>
            {open && (
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%', marginTop: 1 }}>
                    Success! You can confirm your transfer on{' '}
                    <a target="_blank" rel="noreferrer" href={`https://nile.tronscan.org/#/address/${props.address}`}>
                        Tron Scan
                    </a>
                </Alert>
            )}
        </>
    );
}
