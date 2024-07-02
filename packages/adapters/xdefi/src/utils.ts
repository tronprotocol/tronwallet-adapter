import { isInBrowser, isInMobileBrowser } from '@tronweb3/tronwallet-abstract-adapter';
import type { Tron } from './types.js';

export function supportTron() {
    return !!(window.tron && window.tron.isTronLink);
}
export function supportTronLink() {
    return !!(supportTron() || window.tronLink || window.tronWeb);
}

export async function waitTronReady(tronObj: Tron | any) {
    return new Promise<void>((resolve, reject) => {
        const interval = setInterval(() => {
            if (tronObj.tronWeb) {
                clearInterval(interval);
                clearTimeout(timeout);
                resolve();
            }
        }, 50);
        const timeout = setTimeout(() => {
            clearInterval(interval);
            reject('`window.xfi.tron.tronweb` is not ready.');
        }, 2000);
    });
}
