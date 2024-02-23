import { isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportOkxWallet() {
    return !!(window.okxwallet && window.okxwallet.tronLink);
}

export const isOKApp = /OKApp/i.test(navigator.userAgent);

export function openOkxWallet() {
    if (!isOKApp && isInMobileBrowser()) {
        const encodedUrl =
            'https://www.okx.com/download?deeplink=' +
            encodeURIComponent('okx://wallet/dapp/url?dappUrl=' + encodeURIComponent(window.location.href));
        window.location.href = encodedUrl;
        return true;
    }
    return false;
}
