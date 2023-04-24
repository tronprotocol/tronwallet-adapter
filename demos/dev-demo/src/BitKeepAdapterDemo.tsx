import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
// import './App.css';
import type { Adapter } from '@tronweb3/tronwallet-abstract-adapter';
import { AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import { BitKeepAdapter } from '@tronweb3/tronwallet-adapter-bitkeep';
import { Box, Button, Typography, Tooltip, Select, MenuItem, Alert, FormControl, TextField } from '@mui/material';
import { tronWeb } from './tronweb.js';
const receiver = 'TMDKznuDWaZwfZHcM61FVFstyYNmK6Njk1';

export function BitKeepAdapterDemo() {
    const [connectState, setConnectState] = useState(AdapterState.NotFound);
    const [account, setAccount] = useState('');
    const [readyState, setReadyState] = useState('');
    const [chainId, setChainId] = useState<string>('');
    const [selectedChainId, setSelectedChainId] = useState('0xcd8690dc');
    const [open, setOpen] = useState(false);
    const [signMessage, setSignMessage] = useState('Hello, Adapter');
    const [signedMessage, setSignedMessage] = useState('');
    const adapter = useMemo(() => new BitKeepAdapter({
        openUrlWhenWalletNotFound: false,
        checkTimeout: 3000
    }), []);

    useEffect(() => {
        setConnectState(adapter.state);
        setAccount(adapter.address || '');
        setReadyState(adapter.readyState);
        adapter.network().then(async (res) => {
            console.log(res);
            setChainId(res.chainId);
            const balance = await tronWeb.trx.getBalance(adapter.address)
        }).catch(e => {
            console.log(e)
        })

        adapter.on('readyStateChanged', async () => {
            console.log('readyState: ', adapter.readyState)
            setReadyState(adapter.readyState)
            setConnectState(adapter.state)
        })
        adapter.on('connect', () => {
            console.log('connect: ', adapter.address);
            setAccount(adapter.address || '');
            setConnectState(AdapterState.Connected)
            adapter.network().then((res) => {
                console.log(res);
                setChainId(res.chainId)
            }).catch(e => {
                console.log(e)
            })
        });
        adapter.on('accountsChanged', (data, preaddr) => {
            console.log('accountsChanged: current', data,' pre: ', preaddr);
            setAccount(data as string);
        });

        adapter.on('chainChanged', (data) => {
            console.log('chainChanged: ', data);
            setChainId((data as any).chainId);
        });

        adapter.on('disconnect', () => {
            console.log('disconnect');
            setConnectState(AdapterState.Disconnect)
            setAccount(adapter.address || '');
        });

        return () => {
            adapter.removeAllListeners();
        };
    }, [adapter]);

    // function onSwitchChain() {
    //     adapter.switchChain(selectedChainId);
    // }

    async function onSignTransaction() {
        const tronWeb = (window as any).tronWeb as any;
        console.log(adapter.address)
        const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.001), adapter.address);
        console.log('before signtransaction')
        const signedTransaction = await adapter.signTransaction(transaction);
        // const signedTransaction = await tronWeb.trx.sign(transaction);
        console.log('after signtransaction')
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
            const address = await tronWeb.trx.verifyMessage(tronWeb.toHex(signMessage), signedMessage);
            alert(address === adapter.address ? 'success verify' : 'failed verify');
        },
        [signMessage, signedMessage, adapter]
    );

    async function handleConnect() {
        try {
            await adapter?.connect()
        } catch(e: any) {
            console.log(e.error?.message || e.message);
        }
    }
    return (
        <Box sx={{ width: '100%', maxWidth: 900 }}>
            <h1>BitKeep Demo</h1>
            <Typography variant="h6" gutterBottom>
                Your account address:
            </Typography>
            <Detail>{account}</Detail>

            <Typography variant="h6" gutterBottom>
                Current network you choose: {chainId}
            </Typography>

            <Typography variant="h6" gutterBottom>
                ReadyState: {readyState}
            </Typography>
            <Typography variant="h6" gutterBottom>
                Current connection status:&nbsp;&nbsp;
                <span style={{ color: adapter?.connected ? '#08f108' : 'orange' }}>{connectState}</span>
            </Typography>
            <Typography variant="h6" gutterBottom>
                <TextField label="Message to sign" size="small" value={signMessage} onChange={(e) => setSignMessage(e.target.value)}></TextField>
            </Typography>
            <Detail>
                <Button variant="contained" disabled={adapter?.connected} onClick={handleConnect}>
                    Connect
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained" disabled={!adapter?.connected} onClick={() => adapter?.disconnect()}>
                    Disconnect
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained" disabled={!adapter?.connected} onClick={onSignTransaction}>
                    Transfer
                </Button>
            </Detail>
            <Detail>
                <Button variant="contained" onClick={onSignMessage}>
                    Sign Message
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;
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
            {/* <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedChainId}
                label="Chain"
                size="small"
                onChange={(e) => setSelectedChainId(e.target.value)}
            >
                <MenuItem value={'0x2b6653dc'}>Mainnet</MenuItem>
                <MenuItem value={'0x94a9059e'}>Shasta</MenuItem>
                <MenuItem value={'0xcd8690dc'}>Nile</MenuItem>
            </Select>

            <Button style={{ margin: '0 20px' }} onClick={onSwitchChain} variant="contained">
                Switch Chain to {selectedChainId}
            </Button> */}
            {/* <MultiSignDemo address={account} adapter={adapter}></MultiSignDemo> */}
        </Box>
    );
}

export function Detail(props: { children: ReactNode }) {
    return <div style={{ margin: 15 }}>{props.children}</div>;
}

function MultiSignDemo(props: { address: string; adapter: Adapter }) {
    const [address1, setAddress1] = useState('');
    const [open, setOpen] = useState(false);

    const [transferTransaction, setTransferTransaction] = useState(null);
    const [canSend, setCanSend] = useState(false);

    const multiSignWithAddress1 = useCallback(
        async function () {
            const tronWeb = (window as any).tronWeb1 as any;
            const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.1), props.address, { permissionId: 2 });
            // debugger;
            console.log('before multiSign', transaction)
            const signedTransaction = await props.adapter.multiSign(transaction, null, 2);
            console.log('after multiSign', signedTransaction)
            setTransferTransaction(signedTransaction);
        },
        [props.adapter, setTransferTransaction, props.address]
    );
    async function broadcast() {
        const res = await tronWeb.trx.broadcast(transferTransaction);
        setOpen(true);
    }
    return (
        <>
            <h3>MultiSign Demo</h3>
            {/* <p>You can input two address and click approve button to give them permission.</p>
            <div>
                <TextField size="small" label="address to approve" value={address1} onChange={(e) => setAddress1(e.target.value)}></TextField>
                <Button style={{ marginLeft: 10 }} disabled={!address1} variant="contained" onClick={onApprove}>
                    Approve
                </Button>
            </div> */}

            <p>You can click following buttons to multiSign and send the Transaction</p>
            <div>
                <Button disabled={!props.address} variant="contained" onClick={multiSignWithAddress1}>
                    Sign with 1st Address
                </Button>
                {/* <Button disabled={!transferTransaction} style={{ marginLeft: 10 }} variant="contained" onClick={multiSignWithAddress2}>
                    Sign with 2nd Address
                </Button> */}
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
