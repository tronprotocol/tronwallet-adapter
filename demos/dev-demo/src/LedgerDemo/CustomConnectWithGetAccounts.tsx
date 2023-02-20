import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';
import type { Account } from '@tronweb3/tronwallet-adapter-ledger';
import '../tronweb';
import { ConnectTip } from './ConnectTip.js';
import { SelectAccountSection } from './SelectAccountSection.js';
import { Button } from '@mui/material';
import { ConnectedSection } from './ConnectedSection.js';

export function CustomConnectWithGetAccounts() {
    const [step, setStep] = useState<number>(0);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);

    const adapter = useMemo(() => {
        const adapter = new LedgerAdapter({});
        return adapter;
    }, []);

    async function onConnect() {
        try {
            const res = await adapter.ledgerUtils.getAccounts(0, 3);
            setAccounts(res);
            setStep(1);
        } catch (e) {
            setStep(0);
            alert(e);
        }
    }

    function onCancel() {
        setStep(0);
        alert('Canceled.');
        setSelectedAccount(null);
    }
    async function onConfirm(account: Account) {
        setStep(2);
        setSelectedAccount(account);
        try {
            await adapter.ledgerUtils.getAddress(account.index, true);
            await adapter.connect({ account });
            setStep(3);
        } catch (e) {
            alert(3);
            setStep(0);
        }
    }

    const VerifyAddressSection = (
        <div>
            Please confirm your address on ledger is same as <strong>{selectedAccount?.address}</strong>
        </div>
    );
    const SuccessSection = <ConnectedSection adapter={adapter}></ConnectedSection>;

    const sectionMap: Record<number, ReactNode> = {
        0: <ConnectTip></ConnectTip>,
        1: <SelectAccountSection accounts={accounts} onCancel={onCancel} onConfirm={onConfirm} getAccounts={adapter.ledgerUtils.getAccounts}></SelectAccountSection>,
        2: VerifyAddressSection,
        3: SuccessSection,
    };
    const Section = <div>{sectionMap[step]}</div>;

    return (
        <div className="App">
            <div>{Section}</div>
            <p> </p>
            <Button variant="contained" onClick={onConnect}>
                Connect
            </Button>
        </div>
    );
}
