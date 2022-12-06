import { AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import type { Wallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import type { FC } from 'react';
import React from 'react';
import { Button } from './Button.js';

export interface WalletItemProps {
    onClick: () => void;
    wallet: Wallet;
}

export const WalletItem: FC<WalletItemProps> = ({ onClick, wallet }) => {
    return (
        <div className="adapter-wallet-item">
            <Button onClick={onClick} icon={wallet.adapter.icon} tabIndex={0}>
                {wallet.adapter.name}
                <span className="status-text">{wallet.state !== AdapterState.NotFound ? 'Detected' : 'NotFound'}</span>
            </Button>
        </div>
    );
};
