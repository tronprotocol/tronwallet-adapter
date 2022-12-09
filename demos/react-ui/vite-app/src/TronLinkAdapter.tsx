import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import type { NetworkNodeConfig } from '@tronweb3/tronwallet-abstract-adapter';
import { AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import { Box, Button, Typography, Tooltip } from '@mui/material';

function App() {
    const [connectState, setConnectState] = useState(AdapterState.NotFound);
    const [account, setAccount] = useState('');
    const [netwok, setNetwork] = useState<{ node: NetworkNodeConfig }>({} as any);
    const [signedMessage, setSignedMessage] = useState('');

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
            setNetwork(data as any);
        });

        adapter.on('disconnect', () => {
            console.log('---disconnect');
        });

        return () => {
            adapter.removeAllListeners();
        };
    }, [adapter]);

    async function sign() {
        const res = await adapter?.signMessage('helloworld');
        setSignedMessage(res);
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
                Your account address:
            </Typography>
            <Detail>{account}</Detail>

            <Typography variant="h6" gutterBottom>
                Current network you choose:
            </Typography>
            <Box sx={{ ml: 4 }}>
                <Typography variant="body1" gutterBottom>
                    <strong>fullNode: &nbsp;&nbsp;</strong>
                    {netwok?.node?.fullNode}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>solidityNode: &nbsp;&nbsp;</strong>
                    {netwok?.node?.solidityNode}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>eventServer: &nbsp;&nbsp;</strong>
                    {netwok?.node?.eventServer}
                </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
                Current connection status:&nbsp;&nbsp;
                <span style={{ color: adapter?.connected ? '#08f108' : 'orange' }}>{connectState}</span>
            </Typography>
            <Detail>
                <Button variant="contained" disabled={adapter?.connected} onClick={() => adapter?.connect()}>
                    Connect
                </Button>
            </Detail>

            <Typography variant="h6" gutterBottom>
                Sign a message:
            </Typography>
            <Detail>
                <Button disabled={!adapter?.connected} onClick={sign}>
                    Sign "helloworld"
                </Button>
            </Detail>

            <br />
            <Typography variant="h6" gutterBottom>
                SignedMessage:
            </Typography>
            <Detail>
                <Tooltip title={signedMessage} placement="top-start">
                    <span>{signedMessage.slice(0, 50)}</span>
                </Tooltip>
            </Detail>
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

export default App;
