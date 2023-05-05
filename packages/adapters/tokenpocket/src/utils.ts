import { isInBrowser, isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';

export function supportTokenPocket() {
    return !!window.tronWeb && typeof (window as any).tokenpocket !== 'undefined';
}

/**
 * Detect if in TokenPocketApp
 * There will be a `tokenpocket` object on window
 */
export function isInTokenPocket() {
    return isInBrowser() && typeof (window as any).tokenpocket !== 'undefined';
}

export function openTokenPocket() {
    if (!supportTokenPocket() && isInMobileBrowser() && !isInTokenPocket()) {
        const { origin, pathname, search, hash } = window.location;
        const url = origin + pathname + search + hash;
        const params = {
            action: 'open',
            actionId: Date.now() + '',
            callbackUrl: 'http://someurl.com', // no need callback
            blockchain: 'Tron',
            chain: 'Tron',
            url,
            protocol: 'TokenPocket',
            version: '1.0',
        };
        window.location.href = `tpdapp://open?params=${encodeURIComponent(JSON.stringify(params))}`;
        return true;
    }
    return false;
}
