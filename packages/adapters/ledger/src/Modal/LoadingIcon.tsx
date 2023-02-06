import React from 'preact/compat';

export function LoadingIcon() {
    return (
        <div className="ledger-ant-spin ledger-ant-spin-lg ledger-ant-spin-spinning spin">
            <span className="ledger-ant-spin-dot">
                <i className="ledger-ant-spin-dot-item"></i>
                <i className="ledger-ant-spin-dot-item"></i>
                <i className="ledger-ant-spin-dot-item"></i>
                <i className="ledger-ant-spin-dot-item"></i>
            </span>
        </div>
    );
}
