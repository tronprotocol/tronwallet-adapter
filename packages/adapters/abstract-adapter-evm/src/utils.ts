/**
 * check simply if current environment is browser or not
 * @returns boolean
 */
export function isInBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';
}

/**
 * Simplily detect mobile device
 */
export function isInMobileBrowser() {
    return (
        typeof navigator !== 'undefined' &&
        !!navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i)
    );
}
