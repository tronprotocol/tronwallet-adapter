import React, { useState } from 'react';
import { WalletSelectModal } from './Modal/WalletSelectModal.js';
import { WalletModalContext } from './useWalletModal.js';

export function WalletModalProvider({ children, ...props }: any) {
    const [visible, setVisible] = useState(false);
    return (
        <WalletModalContext.Provider
            value={{
                visible,
                setVisible,
            }}
        >
            {children}
            {<WalletSelectModal visible={visible} onClose={() => setVisible(false)} {...props} />}
        </WalletModalContext.Provider>
    );
}
