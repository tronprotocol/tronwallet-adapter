import type { Ref } from 'vue';
import { inject, readonly, ref } from 'vue';

export interface WalletModalContextProps {
    visible: Readonly<Ref<boolean>>;
    setVisible: (open: boolean) => void;
}

const DEFAULT_VALUE = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setVisible(_open: boolean) {
        printError();
    },
    visible: readonly(ref(false)),
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

export function useWalletModal(): WalletModalContextProps {
    const TronWalletModalContext = inject('TronWalletModalContext', DEFAULT_VALUE);
    return TronWalletModalContext;
}
