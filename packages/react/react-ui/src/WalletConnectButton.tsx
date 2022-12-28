import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';
import type { FC, MouseEvent } from 'react';
import React, { useCallback, useMemo } from 'react';
import type { ButtonProps } from './Button.js';
import { Button } from './Button.js';

export const WalletConnectButton: FC<ButtonProps> = ({ children, disabled, onClick, ...props }) => {
    const { wallet, connect, connecting, connected } = useWallet();

    const handleClick = useCallback(
        async (event: MouseEvent<HTMLButtonElement>) => {
            if (onClick) onClick(event);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            if (!event.defaultPrevented) {
                await connect();
            }
        },
        [onClick, connect]
    );

    const content = useMemo(() => {
        if (children) return children;
        if (connecting) return 'Connecting ...';
        if (connected) return 'Connected';
        if (wallet) return 'Connect';
        return 'Connect Wallet';
    }, [children, connecting, connected, wallet]);

    return (
        <Button
            data-testid="wallet-connect-button"
            className="wallet-button"
            disabled={disabled || !wallet || connecting || connected}
            onClick={handleClick}
            icon={wallet ? wallet.adapter.icon : ''}
            {...props}
        >
            {content}
        </Button>
    );
};
