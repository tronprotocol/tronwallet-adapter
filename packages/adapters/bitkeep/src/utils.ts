import { isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportBitKeep() {
    return !!window.tronLink && (window as any).isBitKeep;
}

export function openBitKeep() {
    if (isInMobileBrowser() && !supportBitKeep()) {
        const { origin, pathname, search, hash } = window.location;
        const url = origin + pathname + search + hash;
        location.href = `https://bkcode.vip?action=dapp&url=${encodeURIComponent(url)}`;
        return true;
    }
    return false;
}
