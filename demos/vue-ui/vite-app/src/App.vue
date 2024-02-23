<script setup lang="ts">
import VueUiDemo from './components/VueUiDemo.vue';
import HooksDemo from './components/HooksDemo.vue';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-vue-hooks';
import { Adapter } from '@tronweb3/tronwallet-abstract-adapter';
import {
    BitKeepAdapter,
    LedgerAdapter,
    OkxWalletAdapter,
    TokenPocketAdapter,
    TronLinkAdapter,
    WalletConnectAdapter,
} from '@tronweb3/tronwallet-adapters';
import { WalletModalProvider } from '@tronweb3/tronwallet-adapter-vue-ui';
const tronLink = new TronLinkAdapter();
const walletConnect = new WalletConnectAdapter({
    network: 'Nile',
    options: {
        relayUrl: 'wss://relay.walletconnect.com',
        // example WC app project ID
        projectId: '5fc507d8fc7ae913fff0b8071c7df231',
        metadata: {
            name: 'Test DApp',
            description: 'JustLend WalletConnect',
            url: 'https://your-dapp-url.org/',
            icons: ['https://your-dapp-url.org/mainLogo.svg'],
        },
    },
    web3ModalConfig: {
        themeMode: 'dark',
        themeVariables: {
            '--w3m-z-index': '1000',
        },
        // explorerRecommendedWalletIds: 'NONE',
        enableExplorer: true,
        explorerRecommendedWalletIds: [
            '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f',
            '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
            '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        ],
        // mobileWallets: [],
        // desktopWallets: []
        // explorerExcludedWalletIds: [
        //   '2c81da3add65899baeac53758a07e652eea46dbb5195b8074772c62a77bbf568'
        // ]
    },
});
const ledger = new LedgerAdapter({
    accountNumber: 2,
});
const tokenPocket = new TokenPocketAdapter();
const bitKeep = new BitKeepAdapter();
const okxWalletAdapter = new OkxWalletAdapter();

const adapters = [tronLink, walletConnect, ledger, tokenPocket, bitKeep, okxWalletAdapter];

function onAdapterChanged(adapter: Adapter) {
    console.log('[wallet hooks] onAdapterChanged: ', adapter?.name);
}
function onReadyStateChanged(readyState: ReadyState) {
    console.log('[wallet hooks] onReadyStateChanged: ', readyState);
}
function onConnect(address: string) {
    console.log('[wallet hooks] onConnect: ', address);
}
function onDisconnect() {
    console.log('[wallet hooks] onDisconnect');
}
function onAccountsChanged(account: string) {
    console.log('[wallet hooks] onAccountsChanged: ', account);
}
function onChainChanged(chainInfo: any) {
    console.log('[wallet hooks] onChainChanged: ', chainInfo);
}
</script>

<template>
    <WalletProvider
        :adapters="adapters"
        @adapter-changed="onAdapterChanged"
        @ready-state-changed="onReadyStateChanged"
        @connect="onConnect"
        @disconnect="onDisconnect"
        @chain-changed="onChainChanged"
        @accounts-changed="onAccountsChanged"
    >
        <WalletModalProvider>
            <VueUiDemo />
            <HooksDemo></HooksDemo>
        </WalletModalProvider>
    </WalletProvider>
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
