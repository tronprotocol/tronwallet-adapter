import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import type { Account, GetAccounts } from '@tronweb3/tronwallet-adapter-ledger/lib/types/LedgerWallet.js';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

interface SelectAccountModalPros {
    accounts: Account[];
    getAccounts: GetAccounts;
    onCancel: () => void;
    onConfirm: (account: Account) => void;
}

export function selectAccount(config: { accounts: Account[]; getAccounts: GetAccounts }) {
    const div = document.createElement('div');
    document.body.append(div);
    const root = createRoot(div);

    return new Promise<Account>((resolve, reject) => {
        function onConfirm(account: Account) {
            resolve(account);
            root.unmount();
            div.remove();
        }
        function onCancel() {
            reject('Select account operation is canceled.');
            root.unmount();
            div.remove();
        }
        root.render(<SelectAccountModal accounts={config.accounts} getAccounts={config.getAccounts} onCancel={onCancel} onConfirm={onConfirm}></SelectAccountModal>);
    });
}
export function SelectAccountModal(props: SelectAccountModalPros) {
    const [visible, setVisible] = useState(true);
    const [selectedIdx, setSelectIdx] = useState(0);
    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        setAccounts([...props.accounts]);
    }, [props.accounts, setAccounts]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSelectIdx(+e.target.value);
    }
    function onCancel() {
        props.onCancel?.();
        setVisible(false);
    }
    function onConfirm() {
        const account = accounts.find((item) => item.index === selectedIdx);
        props.onConfirm?.(account || accounts[0]);
        setVisible(false);
    }
    async function onLoadMore() {
        const last = accounts[accounts.length - 1].index;
        const res = await props.getAccounts(last + 1, last + 1 + 3);
        setAccounts((accounts) => {
            return [...accounts, ...res];
        });
    }
    return (
        <Dialog onClose={onCancel} open={visible}>
            <DialogTitle>Select Account</DialogTitle>
            <DialogContent>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <FormControl>
                        <FormLabel>Account</FormLabel>
                        <RadioGroup value={selectedIdx} onChange={handleChange}>
                            {accounts.map((item) => (
                                <FormControlLabel key={item.index} value={item.index} control={<Radio />} label={item.address} />
                            ))}
                        </RadioGroup>
                    </FormControl>
                    <Button onClick={onLoadMore}>Load more</Button>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm}>Ok</Button>
            </DialogActions>
        </Dialog>
    );
}
