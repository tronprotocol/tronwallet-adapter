import React, { useMemo } from 'preact/compat';
import { getLangText } from './lang.js';
import { LedgerIcon } from './LedgerIcon.js';
import { LoadingIcon } from './LoadingIcon.js';
export function ConfirmContent(props: { address: string }) {
    const langText = useMemo(() => getLangText(), []);
    return (
        <div style={{ textAlign: 'center' }}>
            <LedgerIcon></LedgerIcon>
            <div className="ledger-connecting-pop">
                <ul className="ledger-connecting-pop-content">
                    <li className="title">{langText.checkTitle}</li>
                    <li>
                        <strong style={{ color: '#B0170D', textAlign: 'left', fontWeight: '600' }}>
                            {props.address}
                        </strong>
                    </li>
                    <li>{langText.checkTip0}</li>
                    <li>{langText.checkTip1}</li>
                </ul>
                <div className="mt-4">
                    <LoadingIcon></LoadingIcon>
                    <div>
                        <div className="text-muted">
                            <span>{langText.confirmTip}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
