import { Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import type { AdapterName } from '@tronweb3/tronwallet-abstract-adapter';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import { useCallback, useState } from 'react';
import { Detail } from './TronLinkAdapterDemo.js';
import { tronWeb } from './tronweb.js';

export function ReactHooksDemo() {
    const { wallets, address, wallet, connected, select, connect, signMessage, disconnect } = useWallet();
    const [messageToSign, setMessageToSign] = useState('Adapter');
    const [signedMessage, setSignedMessage] = useState('');
    const [targetWallet, setTargetWallet] = useState(wallet?.adapter.name || 'TronLink');

    const onSignMessage = useCallback(
        async function () {
            const res = await signMessage(messageToSign);
            setSignedMessage(res || '');
        },
        [messageToSign, setSignedMessage, signMessage]
    );

    const onVerifyMessage = useCallback(
        async function () {
            const newAddress = await tronWeb.trx.verifyMessageV2(signMessage, signedMessage);
            alert(address === newAddress ? 'success verify' : 'failed verify');
        },
        [signMessage, signedMessage, address]
    );

    const onSelect = useCallback(
        async (e: any) => {
            await select(targetWallet as AdapterName);
        },
        [select, targetWallet]
    );
    return (
        <Box sx={{ width: '100%', maxWidth: 900 }}>
            <h1>useWallet() Demo</h1>

            <Typography variant="h6" gutterBottom>
                Your selected wallet:
            </Typography>
            <Detail>{wallet?.adapter.name}</Detail>
            <Typography variant="h6" gutterBottom>
                Your account:
            </Typography>
            <Detail>{address}</Detail>
            <Typography variant="h6" gutterBottom>
                Current connection status:&nbsp;&nbsp;
                <span style={{ color: wallet?.adapter.connected ? '#08f108' : 'orange' }}>{String(wallet?.adapter.connected)}</span>
            </Typography>
            <Typography variant="h6" gutterBottom>
                Current connection status2:&nbsp;&nbsp;
                <span style={{ color: connected ? '#08f108' : 'orange' }}>{String(connected)}</span>
            </Typography>
            <Typography variant="h6" gutterBottom>
                <TextField label="Message to sign" size="small" value={messageToSign} onChange={(e) => setMessageToSign(e.target.value)}></TextField>
            </Typography>
            <Detail>
                <Button variant="contained" disabled={wallet?.adapter?.connected} onClick={() => connect()}>
                    Connect
                </Button>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <Button variant="contained" disabled={!wallet?.adapter?.connected} onClick={() => disconnect()}>
                    Disconnect
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
            <Detail>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={targetWallet}
                    label="Chain"
                    size="small"
                    onChange={(e) => {
                        console.log(e);
                        setTargetWallet(e.target.value as any);
                    }}
                >
                    {wallets.map((w) => {
                        return (
                            <MenuItem key={w.adapter.name} value={w.adapter.name}>
                                {w.adapter.name}
                            </MenuItem>
                        );
                    })}
                </Select>
                <Button style={{ margin: '0 20px' }} onClick={onSelect} variant="contained">
                    Switch Chain to {targetWallet}
                </Button>
            </Detail>
        </Box>
    );
}
