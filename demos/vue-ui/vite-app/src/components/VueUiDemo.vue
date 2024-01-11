<script setup lang="ts">
import { useWallet } from '@tronweb3/tronwallet-adapter-vue-hooks';
import {
    WalletSelectButton,
    WalletConnectButton,
    WalletActionButton,
    WalletDisconnectButton,
} from '@tronweb3/tronwallet-adapter-vue-ui';
import { ElTable, ElTableColumn } from 'element-plus';
import { markRaw } from 'vue';
const rows = [
    { name: 'Select Wallet Button', ui: markRaw(WalletSelectButton) },
    { name: 'Connect Button', ui: markRaw(WalletConnectButton) },
    { name: 'Disconnect Button', ui: markRaw(WalletDisconnectButton) },
    { name: 'Multi Action Button', ui: markRaw(WalletActionButton) },
];
const walletContext = useWallet();
console.log(walletContext);
</script>

<template>
    <div :style="{ width: '800px' }">
        <ElTable :data="rows">
            <ElTableColumn label="Component Name" prop="name"> </ElTableColumn>
            <ElTableColumn label="Component UI">
                <template #default="{ row: { ui } }">
                    <component :is="ui"></component>
                </template>
            </ElTableColumn>
        </ElTable>
    </div>
</template>
·
