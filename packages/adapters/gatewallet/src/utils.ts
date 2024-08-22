import { isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportGateWallet() {
    return !!(window.gatewallet && window.gatewallet.tronLink);
}

export const isGateApp = /GateApp/i.test(navigator.userAgent);

export function openGateWallet() {
    if (!isGateApp && isInMobileBrowser()) {
        window.location.href =
            'https://gateio.onelink.me/DmA6/web3?dappUrl=' + encodeURIComponent(window.location.href);
        return true;
    }
    return false;
}
