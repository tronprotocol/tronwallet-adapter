import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import type { FC, MouseEventHandler } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { ButtonProps } from './Button.js';
import { Button } from './Button.js';

export const WalletDisconnectButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const { wallet, disconnect, disconnecting, connected } = useWallet();

    const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
        (event) => {
            if (onClick) onClick(event);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            if (!event.defaultPrevented) disconnect().catch(() => {});
        },
        [onClick, disconnect]
    );

    const content = useMemo(() => {
        if (children) return children;
        if (disconnecting) return 'Disconnecting ...';
        if (wallet) return 'Disconnect';
        return 'Disconnect Wallet';
    }, [children, disconnecting, wallet]);

    return (
        <Button
            data-testid="wallet-disconnect-button"
            disabled={disabled || !wallet || !connected}
            icon={wallet ? wallet.adapter.icon : ''}
            onClick={handleClick}
            {...props}
        >
            {content}
        </Button>
    );
};
