import { isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportBitgetWallet() {
    return !!window.tronLink && (window as any).isBitKeep;
}

export function openBitgetWallet() {
    if (isInMobileBrowser() && !supportBitgetWallet()) {
        const { origin, pathname, search, hash } = window.location;
        const url = origin + pathname + search + hash;
        location.href = `https://bkcode.vip?action=dapp&url=${encodeURIComponent(url)}`;
        return true;
    }
    return false;
}
