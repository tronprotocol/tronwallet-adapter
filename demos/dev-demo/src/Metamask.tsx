import type { ReactNode } from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Button, Typography, Alert, TextField } from '@mui/material';
import { TronLinkEvmAdapter } from '@tronweb3/tronwallet-adapter-tronlink-evm'
import { Detail } from './TronLinkAdapterDemo.js';
import { recoverPersonalSignature, recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util'
function toHex(val: number): `0x${string}` {
    return `0x${Number(val).toString(16)}`
}
export function MetamaskAdapterDemo() {
    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState('');
    const [readyState, setReadyState] = useState('');
    const [chainId, setChainId] = useState<string>('');
    const [messageToSign, setMessageToSign] = useState('Hello, Adapter');
    const [signedHash, setSignedHash] = useState('');
    const adapter = useMemo(() => new TronLinkEvmAdapter(), []);
    const [lastSignType, setLastSignType] = useState('')

    useEffect(() => {
        setAccount(adapter.address || '');
        setReadyState(adapter.readyState);

        adapter.on('readyStateChanged', () => {
            console.log('readyState Changed:', adapter.readyState)
            setReadyState(adapter.readyState)
        })
        adapter.on('connect', () => {
            console.log('connect: ', adapter.address);
            setAccount(adapter.address || '');
            
        });
        adapter.on('accountsChanged', (data) => {
            console.log('accountsChanged: current', data);
            setAccount(data[0]);
            setIsConnected(!!(data?.[0]))
        });

        adapter.on('chainChanged', (chainId) => {
            console.log('chainChanged: ', chainId);
            setChainId(chainId);
        });

        adapter.on('disconnect', () => {
            console.log('disconnect');
        });

        return () => {
            adapter.removeAllListeners();
        };
    }, [adapter]);

    async function handleConnect() {
        await adapter.connect();
        setIsConnected(true)
        setAccount(adapter.address || '')
    }

    async function handleAddChain() {
        await adapter.addChain({
            chainId: toHex(1337),
            chainName: 'Localhost',
            nativeCurrency: {
                name: 'Ethereum Token',
                symbol: 'ETH',
                decimals: 18,
            },
            rpcUrls: ['http://localhost:8545']
        });
        alert('Add chain successfully.')
    }

    async function handleSwitchChain() {
        console.log('switch chain to: ', toHex(1))
        try {
            await adapter.switchChain(toHex(1));
            alert('Switch chain successfully.')
        } catch(e) {
            console.log('switchChain error: ', e);
        }
    }

    async function handleWatchAsset() {
        await adapter.watchAsset({
            type: 'ERC20',
            options: {
                address: '0x3883f5e181fccaF8410FA61e12b59BAd963fb645',
                symbol: 'THETA',
                decimals: 18
            }
        });
        alert('watch asset successfully.')
    }
    async function sendTransaction() {
        const transaction = {
            value: toHex(0.01 * Math.pow(10, 18)), // 0.01 is 0.01ETH
            to: '0x18B0FDE2FEA85E960677C2a41b80e7557AdcbAE0',
            from: adapter.address,
        }
        console.log('sendTransaction: ', transaction);
        await adapter.sendTransaction(transaction);
        alert('send transaction successfully.')
    }

    async function signMessage() {
        try {
            const res = await adapter.signMessage({ message: messageToSign });
            setSignedHash(res)
            setLastSignType('personalMessage')
        } catch(e) {
            console.log('signMessage error', e)
        }
    }

    async function verifyHash() {
        let valid;
        if (lastSignType === 'personalMessage') {
            const address = recoverPersonalSignature({
                data: messageToSign,
                signature: signedHash
            });
            console.log('recoveredAddress', address);
             valid = address.toLowerCase() === adapter.address!.toLowerCase();
        } else {
            const address = recoverTypedSignature({
                version: SignTypedDataVersion.V4,
                data: typedData as any,
                signature: signedHash
            });
            valid = address === adapter.address;
        }
        
        alert(valid ? 'The signature is valid' : 'The signature is invalid');
    }

    async function signTypedData() {
        try {
            
            const signedHash = await adapter.signTypedData({ typedData: typedData });
            setSignedHash(signedHash)
            setLastSignType('typedData')
        } catch (e) {
            console.error('sign typed data error: ', e);
        }
    }
    return (
        <Box sx={{ width: '100%', maxWidth: 900 }}>
            <h1>MetaMaskAdapter Demo</h1>
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
            
            <Detail>
                <Button variant="contained" disabled={isConnected} onClick={handleConnect}>
                    Connect
                </Button>
            </Detail>
            <Detail>
                <Button variant="contained" onClick={handleAddChain}>
                    Add localhost:8545 to MetaMask
                </Button>
                <Button variant="contained" onClick={handleSwitchChain}>
                    Switch to Localhost Blockchain
                </Button>
                <Button variant='contained' onClick={handleWatchAsset}>
                    Watch Asset
                </Button>
            </Detail>
            <Typography variant="h6" gutterBottom>
                <TextField label="Message to sign" size="small" value={messageToSign} onChange={(e) => setMessageToSign(e.target.value)}></TextField>
            </Typography>
            
            <Detail>
                <Button variant="contained" onClick={signMessage}>
                    Sign Message
                </Button>
                
                <Button variant="contained" onClick={signTypedData}>
                    Sign TypedData
                </Button>

                <Button variant="contained" disabled={!signedHash} onClick={verifyHash}>
                    Verify Signature
                </Button>
            </Detail>
            <Typography style={{ wordBreak: 'break-all'}} variant="h6" gutterBottom>
                Signed Hash: <Detail>{signedHash}</Detail>
            </Typography>
            <Detail>
                <Button variant="contained" onClick={sendTransaction}>
                    Transfer
                </Button>
            </Detail>
        </Box>
    );
}

const typedData = {
    domain: {
        chainId: 1,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
    },
    primaryType: 'Mail',
    types: {
        Mail: [
            { name: 'from', type: 'string' },
            { name: 'to', type: 'string' },
            { name: 'contents', type: 'string' },
        ],
    },
    message: {
        from: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        to: '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
        contents: 'Hello',
    },
};