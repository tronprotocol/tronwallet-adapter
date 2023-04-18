import { isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportOkxWallet() {
    return !!(window.okxwallet && window.okxwallet.tronLink);
}

export function openOkxWallet() {
    if (!supportOkxWallet() && isInMobileBrowser()) {
        window.location.href = `okx://wallet/dapp/details?dappUrl=${window.location.href}`;
        return true;
    }
    return false;
}
