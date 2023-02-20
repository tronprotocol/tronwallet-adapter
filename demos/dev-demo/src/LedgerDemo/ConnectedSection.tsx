import { Alert, Button, TextField } from '@mui/material';
import type { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';
import { useCallback, useState } from 'react';
import { receiver } from '../LedgerAdapterDemo.js';
import { tronWeb } from '../tronweb.js';

export function ConnectedSection(props: { adapter: LedgerAdapter }) {
    const [signMessage, setSignMessage] = useState('Hello, Adapter');
    const [signedMessage, setSignedMessage] = useState('');
    const [open, setOpen] = useState(false);

    const onSignMessage = useCallback(
        async function () {
            const res = await props.adapter.signMessage(signMessage);
            setSignedMessage(res);
        },
        [props.adapter, signMessage, setSignedMessage]
    );

    const onVerifyMessage = useCallback(
        async function () {
            const address = await tronWeb.trx.verifyMessageV2(signMessage, signedMessage);
            alert(address === props.adapter.address ? 'success verify' : 'failed verify');
        },
        [signMessage, signedMessage, props.adapter]
    );
    async function onSignTransaction() {
        const transaction = await tronWeb.transactionBuilder.sendTrx(receiver, tronWeb.toSun(0.1), props.adapter.address);
        const signedTransaction = await props.adapter.signTransaction(transaction);
        const res = await tronWeb.trx.sendRawTransaction(signedTransaction);
        setOpen(true);
    }
    return (
        <div>
            <div>
                <p>Connect successfully! </p>
                <p>Your address is {props.adapter.address}</p>
            </div>
            <TextField label="Message to sign" size="small" value={signMessage} onChange={(e) => setSignMessage(e.target.value)}></TextField>
            <div style={{ marginTop: 10 }}>
                <Button variant="contained" disabled={!props.adapter?.connected} onClick={onSignTransaction}>
                    Transfer
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained" onClick={onSignMessage}>
                    Sign Message
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained" disabled={!signedMessage} onClick={onVerifyMessage}>
                    Verify Signed Message
                </Button>
            </div>
            {open && (
                <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%', marginTop: 1 }}>
                    Success! You can confirm your transfer on
                    <a target="_blank" rel="noreferrer" href={`https://nile.tronscan.org/#/address/${props.adapter.address}`}>
                        Tron Scan
                    </a>
                </Alert>
            )}
        </div>
    );
}
