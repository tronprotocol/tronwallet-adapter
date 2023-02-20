import type { RenderableProps } from 'preact';
import React from 'preact/compat';
import { useLayoutEffect } from 'preact/hooks';
import { useMemo } from 'preact/hooks';
import { useRef } from 'preact/hooks';
import { useEffect } from 'preact/hooks';
import { useState } from 'preact/hooks';
import type { Account, GetAccounts } from '../LedgerWallet.js';
import { getLangText } from './lang.js';

export type SelectAccountProps = RenderableProps<{
    accounts: Account[];
    selectedIndex: number;
    onCancel: () => void;
    onConfirm: (account: Account) => void;
    getAccounts: GetAccounts;
}>;

export function SelectAccount(props: SelectAccountProps) {
    const [index, setIndex] = useState(0);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(false);

    const loadBtnRef = useRef<HTMLButtonElement>(null);
    const langText = useMemo(() => getLangText(), []);

    useEffect(() => {
        setAccounts([...props.accounts]);
    }, [props.accounts]);

    useEffect(() => {
        setIndex(props.selectedIndex);
    }, [props.selectedIndex]);

    function onInput(e: any) {
        setIndex(+e.target.value);
    }

    function onConfirm() {
        const selected = accounts.find((item) => item.index === index);
        props.onConfirm(selected || accounts?.[0]);
    }
    function onCancel() {
        props.onCancel();
    }

    async function onLoadMore() {
        setLoading(true);
        const last = accounts[accounts.length - 1] || { index: -1 };
        const from = last.index + 1;
        const to = last.index + 6;
        try {
            const result = await props.getAccounts(from, to);
            setAccounts((accounts) => [...accounts, ...result]);
        } finally {
            setLoading(false);
        }
    }
    useLayoutEffect(() => {
        loadBtnRef.current?.scrollIntoView?.();
    }, [accounts]);
    return (
        <div style={{ paddingLeft: 40 }} className="ledger-select" data-testid="select-account-content">
            <span className="title">{langText.selectTip}</span>
            <div className="ledger-select-list-wrap">
                <ul className="ledger-select-list" data-testid="select-account-list">
                    {accounts.map((account, idx) => {
                        return (
                            <li key={idx} className="ledger-select-item">
                                <label htmlFor={`ledger-select-radio${idx}`}>
                                    <input
                                        className={account.index === index ? 'checked' : ''}
                                        id={`ledger-select-radio${idx}`}
                                        type="radio"
                                        name="selectedAddress"
                                        value={account.index}
                                        checked={account.index === index}
                                        onInput={onInput}
                                    />
                                    <span>{account.address}</span>
                                </label>
                            </li>
                        );
                    })}
                </ul>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        data-testid="btn-load-more"
                        ref={loadBtnRef}
                        style={{ marginTop: 10 }}
                        disabled={loading}
                        className="ledger-select-button"
                        onClick={onLoadMore}
                    >
                        <span style={{ marginRight: loading ? 10 : 0 }}>{langText.loadMore}</span>
                        {loading ? (
                            /* prettier-ignore */
                            <svg width="18" height="18" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#fff"><g fill="none" fillRule="evenodd"><g transform="translate(1 1)" strokeWidth="2"><circle strokeOpacity=".5" cx="18" cy="18" r="18"/><path d="M36 18c0-9.94-8.06-18-18-18"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite"/></path></g></g></svg>
                        ) : null}
                    </button>
                </div>
            </div>
            <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    data-testid="btn-cancel"
                    style={{ marginRight: 10 }}
                    className="ledger-select-button default-button"
                    onClick={onCancel}
                >
                    {langText.cancel}
                </button>
                <button
                    data-testid="btn-confirm"
                    disabled={loading}
                    className="ledger-select-button"
                    onClick={onConfirm}
                >
                    {langText.confirm}
                </button>
            </footer>
        </div>
    );
}
