import type { EIP1193Provider } from '@tronweb3/abstract-adapter-evm';

export function getMetaMaskProvider(): null | EIP1193Provider {
    if (!window.ethereum) {
        return null;
    }
    if (window.ethereum.isMetaMask && !(window.ethereum as any).overrideIsMetaMask) {
        return window.ethereum as EIP1193Provider;
    }
    /**
     * When install CoinBase Wallet and MetaMask Wallet, ethereum will be override by CoinBase.
     */
    // @ts-ignore
    return window.ethereum.providers?.find((item: EIP1193Provider) => item.isMetaMask) || null;
}

export function isMetaMaskMobileWebView() {
    if (typeof window === 'undefined') {
        return false;
    }

    // @ts-ignore
    return Boolean(window.ReactNativeWebView) && Boolean(navigator.userAgent.endsWith('MetaMaskMobile'));
}

export function openMetaMaskWithDeeplink() {
    const { href, protocol } = window.location;
    const originLink = href.replace(protocol, '').slice(2);
    const link = `https://metamask.app.link/dapp/${originLink}`;
    const dappLink = `dapp://${originLink}`;
    const userAgent = window?.navigator?.userAgent || '';
    if (/\bAndroid(?:.+)Mobile\b/i.test(userAgent)) {
        window.location.href = dappLink;
    } else {
        window.open(link, '_blank');
    }
}
