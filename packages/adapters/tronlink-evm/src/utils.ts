import type { EIP1193Provider } from '@tronweb3/abstract-adapter-evm';

export function getTronLinkEvmProvider(): null | EIP1193Provider {
    if (window.TronLinkEVM && (window.TronLinkEVM as any).isTronLink) {
        return window.TronLinkEVM;
    }
    return null;
}
