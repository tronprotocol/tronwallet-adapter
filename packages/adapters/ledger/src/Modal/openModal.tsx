import React, { render } from 'preact/compat';
import type { Account, GetAccounts } from '../LedgerWallet.js';
import { ConfirmContent } from './ConfirmContent.js';
import { ConnectingContent } from './ConnectingContent.js';
import { getLangText } from './lang.js';
import { Modal } from './Modal.js';
import { SelectAccount } from './SelectAccount.js';
import { modalStyleSheetContent } from './style.js';

function prepareDomNode() {
    const div = document.createElement('div');
    const style = document.createElement('style');
    style.innerHTML = modalStyleSheetContent;
    document.body.append(style);
    document.body.append(div);
    function onClose() {
        div.remove();
        style.remove();
    }
    return {
        onClose,
        div,
    };
}
export function openConnectingModal() {
    const { onClose, div } = prepareDomNode();
    const langText = getLangText();
    render(
        <Modal title={langText.loadingTitle} onClose={onClose}>
            <ConnectingContent></ConnectingContent>
        </Modal>,
        div
    );

    return onClose;
}

export function openVerifyAddressModal(address: string) {
    const { onClose, div } = prepareDomNode();
    const langText = getLangText();
    render(
        <Modal width={550} title={langText.loadingTitle} onClose={onClose}>
            <ConfirmContent address={address}></ConfirmContent>
        </Modal>,
        div
    );

    return onClose;
}

export function openSelectAccountModal(options: {
    accounts: Account[];
    selectedIndex?: number;
    getAccounts: GetAccounts;
}): Promise<Account> {
    const { onClose, div } = prepareDomNode();
    const langText = getLangText();
    return new Promise((resolve, reject) => {
        function onConfirm(account: Account) {
            resolve(account);
            onClose();
        }
        function onCancel() {
            reject(new Error('Operation is canceled.'));
            onClose();
        }
        render(
            <Modal title={langText.loadingTitle} onClose={onCancel}>
                <SelectAccount
                    accounts={options.accounts}
                    selectedIndex={options.selectedIndex || 0}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                    getAccounts={options.getAccounts}
                ></SelectAccount>
            </Modal>,
            div
        );
    });
}
