import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { LedgerAdapter } from '@tronweb3/tronwallet-adapters';
import { AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import { Box, Button, Typography, Alert, TextField, DialogContent, DialogContentText } from '@mui/material';
import { tronWeb } from './tronweb';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { selectAccount as openSelectAccountModal } from './LedgerDemo/selectAccount.js';
import type { SelectAccount } from '@tronweb3/tronwallet-adapter-ledger/lib/types/LedgerWallet.js';
export const receiver = 'TMDKznuDWaZwfZHcM61FVFstyYNmK6Njk1';

export function LedgerAdapterDemo() {
    const [connectState, setConnectState] = useState(AdapterState.NotFound);
    const [account, setAccount] = useState('');
    const [signMessage, setSignMessage] = useState('Hello, Adapter');
    const [signedMessage, setSignedMessage] = useState('');

    const [open, setOpen] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [verifyAddressVisible, setVerifyAddressVisible] = useState(false);

    async function onConnect() {
        try {
            await adapter.connect();
            // eslint-disable-next-line no-useless-catch
        } catch (e: any) {
            alert(e.message);
            throw e;
        } finally {
            setLoadingVisible(false);
            setVerifyAddressVisible(false);
        }
    }

    const selectAccount = useCallback<SelectAccount>(async function ({ accounts, ledgerUtils }) {
        const account = await openSelectAccountModal({ accounts, getAccounts: ledgerUtils.getAccounts });
        return account;
    }, []);
    const adapter = useMemo(
        () =>
            new LedgerAdapter({
                accountNumber: 1,
                getDerivationPath(index: number) {
                    return `44'/195'/0'/0/${index}`;
                },
            }),
        []
    );

    useEffect(() => {
        setConnectState(adapter.state);
        setAccount(adapter.address || '');

        adapter.on('connect', () => {
            console.log('[Adapter Event] connect', adapter.address);
            setAccount(adapter.address || '');
        });
        adapter.on('stateChanged', (state) => {
            console.log('[Adapter Event] state change', state);
            setConnectState(state);
        });
        adapter.on('accountsChanged', (data) => {
            console.log('[Adapter Event] account changed', data);
            setAccount(data as string);
        });

        adapter.on('disconnect', () => {
            console.log('[Adapter Event] disconnect');
        });

        return () => {
            adapter.removeAllListeners();
        };
    }, [adapter]);

    async function onSignTransaction() {
        const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.1), adapter.address);
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
                <TextField label="Message to sign" size="small" value={signMessage} onChange={(e) => setSignMessage(e.target.value)}></TextField>
            </Typography>
            <Detail>
                <Button variant="contained" disabled={adapter?.connected} onClick={onConnect}>
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
                    Success! You can confirm your transfer on
                    <a target="_blank" rel="noreferrer" href={`https://nile.tronscan.org/#/address/${adapter.address}`}>
                        Tron Scan
                    </a>
                </Alert>
            )}

            <Dialog onClose={() => setLoadingVisible(false)} open={loadingVisible}>
                <DialogTitle>Connecting to Ledger....</DialogTitle>
                <DialogContent>
                    <DialogContentText>Please connect your ledger and enter TRON app...</DialogContentText>
                </DialogContent>
            </Dialog>

            <Dialog onClose={() => setVerifyAddressVisible(false)} open={verifyAddressVisible}>
                <DialogTitle>Verify on Ledger....</DialogTitle>
                <DialogContent>
                    <DialogContentText>Please approve on your ledger</DialogContentText>
                </DialogContent>
            </Dialog>
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
