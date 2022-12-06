import { createContext, useContext } from 'react';

export interface WalletModalContextProps {
    visible: boolean;
    setVisible: (open: boolean) => void;
}

const DEFAULT_VALUE = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setVisible(_open: boolean) {
        printError();
    },
    visible: false,
};
Object.defineProperty(DEFAULT_VALUE, 'visible', {
    get() {
        printError();
        return false;
    },
});

function printError() {
    console.error('WalletModalProvider is not provided.' + 'Please wrap your components with WalletModalProvider.');
}

export const WalletModalContext = createContext<WalletModalContextProps>(DEFAULT_VALUE as any);

export function useWalletModal(): WalletModalContextProps {
    return useContext(WalletModalContext);
}
