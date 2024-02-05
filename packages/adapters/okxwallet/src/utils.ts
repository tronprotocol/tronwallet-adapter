import { isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportOkxWallet() {
    return !!(window.okxwallet && window.okxwallet.tronLink);
}

export const isOKApp = /OKApp/i.test(navigator.userAgent);

export function openOkxWallet() {
    alert((navigator as any).userAgentData);
    if (!isOKApp && isInMobileBrowser()) {
        const encodedUrl =
            'https://www.okx.com/download?deeplink=' +
            encodeURIComponent('okx://wallet/dapp/url?dappUrl=' + encodeURIComponent(window.location.href));
        alert('deeplink');
        window.location.href = 'okx://wallet/dapp/url?dappUrl=' + encodeURIComponent(window.location.href);
        return true;
    }
    return false;
}
