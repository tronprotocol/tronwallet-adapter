import React, { useState } from 'react';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import {
    WalletActionButton,
    WalletConnectButton,
    WalletDisconnectButton,
    WalletModalProvider,
    WalletSelectButton,
} from '@tronweb3/tronwallet-adapter-react-ui';
import toast from 'react-hot-toast';
import {
    Alert,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
} from '@mui/material';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import { tronWeb } from './api/tronweb';
import { Button } from '@tronweb3/tronwallet-adapter-react-ui';
const rows = [
    { name: 'Connect Button', reactUI: WalletConnectButton },
    { name: 'Disconnect Button', reactUI: WalletDisconnectButton },
    { name: 'Select Wallet Button', reactUI: WalletSelectButton },
    { name: 'Multi Action Button', reactUI: WalletActionButton },
];
export default function Home() {
    return (
        <div>
            <UIComponent></UIComponent>
            <Profile></Profile>
            <SignDemo></SignDemo>
        </div>
    );
}

function UIComponent() {
    return (
        <div>
            <h2>UI Component</h2>
            <TableContainer style={{ overflow: 'visible' }} component="div">
                <Table sx={{}} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Component</TableCell>
                            <TableCell align="left">React UI</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell align="left">
                                    <row.reactUI></row.reactUI>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

function Profile() {
    const { address, connected, wallet } = useWallet();
    return (
        <div>
            <h2>Wallet Connection Info</h2>
            <p>
                <span>Connection Status:</span> {connected ? 'Connected' : 'Disconnected'}
            </p>
            <p>
                <span>Your selected Wallet:</span> {wallet?.adapter.name}
            </p>
            <p>
                <span>Your Address:</span> {address}
            </p>
        </div>
    );
}

function SignDemo() {
    const { signMessage, signTransaction, address } = useWallet();
    const [message, setMessage] = useState('');
    const [signedMessage, setSignedMessage] = useState('');
    const receiver = 'TMDKznuDWaZwfZHcM61FVFstyYNmK6Njk1';
    const [open, setOpen] = useState(false);

    async function onSignMessage() {
        const res = await signMessage(message);
        setSignedMessage(res);
    }

    async function onSignTransaction() {
        const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.000001), address);
        console.log(transaction);

        const signedTransaction = await signTransaction(transaction);
        // const signedTransaction = await tronWeb.trx.sign(transaction);
        const res = await tronWeb.trx.sendRawTransaction(signedTransaction);
        setOpen(true);
    }
    return (
        <div>
            <h2>Sign a message</h2>
            <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', wordBreak: 'break-all' }}>
                You can sign a message by click the button.
            </p>
            <Button style={{ marginRight: '20px' }} onClick={onSignMessage}>
                SignMessage
            </Button>
            <TextField
                size="small"
                onChange={(e) => setMessage(e.target.value)}
                placeholder="input message to signed"
            ></TextField>
            <p>Your sigedMessage is: {signedMessage}</p>
            <h2>Sign a Transaction</h2>
            <p style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', wordBreak: 'break-all' }}>
                You can transfer 0.1 Trx to &nbsp;<i>{receiver}</i>&nbsp;by click the button.
            </p>
            <Button onClick={onSignTransaction}>Transfer</Button>
            {open && (
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%', marginTop: 1 }}>
                    Success! You can confirm your transfer on{' '}
                    <a target="_blank" rel="noreferrer" href={`https://nile.tronscan.org/#/address/${address}`}>
                        Tron Scan
                    </a>
                </Alert>
            )}
        </div>
    );
}
