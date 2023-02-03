/**
 * check simply if current environment is browser or not
 * @returns boolean
 */
export function isInBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';
}

/**
 *
 * @param {Function} check funcion to check if adapter is installed. return true if
 * @returns
 */
export function checkAdapterState(check: () => boolean): void {
    if (!isInBrowser()) return;

    const disposers: (() => void)[] = [];

    function dispose() {
        for (const dispose of disposers) {
            dispose();
        }
    }
    function checkAndDispose() {
        if (check()) {
            dispose();
        }
    }

    const interval = setInterval(checkAndDispose, 500);
    disposers.push(() => clearInterval(interval));

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndDispose, { once: true });
        disposers.push(() => document.removeEventListener('DOMContentLoaded', checkAndDispose));
    }

    if (document.readyState !== 'complete') {
        window.addEventListener('load', checkAndDispose, { once: true });
        disposers.push(() => window.removeEventListener('load', checkAndDispose));
    }
    checkAndDispose();
    // stop all task after 1min
    setTimeout(dispose, 60 * 1000);
}

/**
 * Simplily detect mobile device
 */
export function isInMobileBrowser() {
    return navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i);
}
