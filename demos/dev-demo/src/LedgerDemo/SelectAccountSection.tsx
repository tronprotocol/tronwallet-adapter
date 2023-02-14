import { FormControl, FormLabel, RadioGroup, Radio, Button, FormControlLabel } from '@mui/material';
import type { Account, GetAccounts } from '@tronweb3/tronwallet-adapter-ledger';
import { useEffect, useState } from 'react';
interface Props {
    onConfirm: (acc: Account) => void;
    onCancel: () => void;
    getAccounts?: GetAccounts;
    accounts: Account[];
}
export function SelectAccountSection(props: Props) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    useEffect(() => {
        setAccounts([...props.accounts]);
    }, [props.accounts]);
    function onChange(e: any) {
        const idx = +e.target.value;
        const a = accounts?.find((item) => item.index === idx) || accounts?.[0];
        setSelectedAccount(a);
    }

    function onCancel() {
        setSelectedAccount(null);
        props.onCancel();
    }
    async function onConfirm() {
        const account = selectedAccount || accounts[0];
        props.onConfirm(account);
    }
    async function onLoadMore() {
        const last = accounts[accounts.length - 1].index;
        const res = await props.getAccounts?.(last + 1, last + 5);
        setAccounts((old) => {
            return [...old, ...(res || [])];
        });
    }
    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <FormControl>
                    <FormLabel>Account</FormLabel>
                    <RadioGroup value={selectedAccount?.index || 0} onChange={onChange}>
                        {accounts.map((item) => (
                            <FormControlLabel key={item.index} value={item.index} control={<Radio />} label={item.address} />
                        ))}
                    </RadioGroup>
                </FormControl>
            </div>
            <div>
                <Button variant="contained" onClick={onLoadMore} style={{ marginRight: 10 }}>
                    Load more
                </Button>
                <Button variant="contained" onClick={onCancel} style={{ marginRight: 10 }}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={onConfirm}>
                    Confirm
                </Button>
            </div>
        </div>
    );
}
