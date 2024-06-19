import { isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportOkxWallet() {
    return !!(window.okxwallet && window.okxwallet.tronLink);
}

export const isOKApp = /OKApp/i.test(navigator.userAgent);

export function openOkxWallet() {
    if (!isOKApp && isInMobileBrowser()) {
        window.location.href = 'okx://wallet/dapp/url?dappUrl=' + encodeURIComponent(window.location.href);
        return true;
    }
    return false;
}
