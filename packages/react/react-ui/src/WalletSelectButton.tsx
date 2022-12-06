import React, { useCallback } from 'react';
import type { MouseEvent, FC } from 'react';
import { Button } from './Button.js';
import type { ButtonProps } from './Button.js';
import { useWalletModal } from './useWalletModal.js';

export const WalletSelectButton: FC<ButtonProps> = function ({ children = 'Select Wallet', onClick, ...props }) {
    const { visible, setVisible } = useWalletModal();

    const handleClick = useCallback(
        (event: MouseEvent<HTMLButtonElement>) => {
            if (onClick) onClick(event);
            if (!event.defaultPrevented) setVisible(!visible);
        },
        [onClick, setVisible, visible]
    );

    return (
        <Button data-testid="wallet-select-button" onClick={handleClick} {...props}>
            {children}
        </Button>
    );
};
