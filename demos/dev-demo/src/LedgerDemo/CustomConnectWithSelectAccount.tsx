import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { LedgerAdapter } from '@tronweb3/tronwallet-adapter-ledger';
import type { Account } from '@tronweb3/tronwallet-adapter-ledger';
import '../tronweb';
import type { LedgerUtils, SelectAccount } from '@tronweb3/tronwallet-adapter-ledger/lib/types/LedgerWallet.js';
import { ConnectTip } from './ConnectTip.js';
import { Button } from '@mui/material';
import { SelectAccountSection } from './SelectAccountSection.js';
import { ConnectedSection } from './ConnectedSection.js';

export function CustomConnectWithSelectAccount() {
    const [step, setStep] = useState<number>(0);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [ledgerUtils, setledgerUtils] = useState<LedgerUtils | null>(null);
    const [selectAccountCallback, setSelectAccountCallback] = useState<{
        resolve: (a: Account) => void;
        reject: (e: any) => void;
    } | null>(null);

    const selectAccount = useCallback<SelectAccount>(
        async function ({ accounts, ledgerUtils }) {
            setAccounts(accounts);
            setledgerUtils(ledgerUtils);
            setStep(1);
            return new Promise((resolve, reject) => {
                setSelectAccountCallback({ resolve, reject });
            });
        },
        [setSelectAccountCallback]
    );
    const adapter = useMemo(() => {
        const adapter = new LedgerAdapter({
            beforeConnect: () => {
                //
            },
            selectAccount,
        });
        return adapter;
    }, [selectAccount]);

    async function onConnect() {
        try {
            await adapter.connect();
        } catch (e) {
            alert(e);
            setStep(0);
        }
    }

    function onCancel() {
        selectAccountCallback?.reject(new Error('User canceled'));
    }
    async function onConfirm(account: Account) {
        setStep(2);
        setSelectedAccount(account);
        await ledgerUtils?.getAddress(account.index, true);
        setStep(3);
        selectAccountCallback?.resolve(account);
    }

    const VerifyAddressSection = (
        <div>
            Please confirm your address on ledger is same as <strong>{selectedAccount?.address}</strong>
        </div>
    );
    const SuccessSection = <ConnectedSection adapter={adapter}></ConnectedSection>;

    const sectionMap: Record<number, ReactNode> = {
        0: <ConnectTip></ConnectTip>,
        1: <SelectAccountSection accounts={accounts} onCancel={onCancel} onConfirm={onConfirm} getAccounts={ledgerUtils?.getAccounts}></SelectAccountSection>,
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
