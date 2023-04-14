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

export function openTokenPocket(
    { dappIcon, dappName }: { dappIcon: string; dappName: string } = { dappIcon: '', dappName: '' }
) {
    if (!supportTokenPocket() && isInMobileBrowser() && !isInTokenPocket()) {
        let defaultDappName = '',
            defaultDappIcon = '';
        try {
            defaultDappName = document.title;
            const link = document.querySelector('link[rel*="icon"]');
            if (link) {
                defaultDappIcon = new URL(link.getAttribute('href') || '', location.href).toString();
            }
        } catch (e) {
            // console.error(e);
        }
        const { origin, pathname, search, hash } = window.location;
        const url = origin + pathname + search + (hash.includes('?') ? hash : `${hash}?_=1`);
        const params = {
            action: 'open',
            actionId: Date.now() + '',
            callbackUrl: 'http://someurl.com', // no need callback
            blockchain: 'Tron',
            chain: 'Tron',
            dappIcon: dappIcon || defaultDappIcon,
            dappName: dappName || defaultDappName,
            url,
            protocol: 'TokenPocket',
            version: '1.0',
        };
        window.location.href = `tpdapp://open?params=${encodeURIComponent(JSON.stringify(params))}`;
        return true;
    }
    return false;
}
