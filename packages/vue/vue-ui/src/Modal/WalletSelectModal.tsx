import { useWallet } from '@tronweb3/tronwallet-adapter-vue-hooks';
import type { Wallet } from '@tronweb3/tronwallet-adapter-vue-hooks';
import { AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import { VuePortal } from './VuePortal.js';
import { WalletItem } from '../WalletItem.js';
import { computed, defineComponent, onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
import { createWrapperAndAppendToBody } from '../utils.js';

export const WalletSelectModal = defineComponent({
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['close'],
    setup(props, { emit }) {
        const wrapperId = 'vue-portal-modal-container';
        let element: HTMLDivElement | null;
        let systemCreated = false;
        const nodeRef = ref<HTMLDivElement | null>();
        const { wallets, select } = useWallet();
        const walletsList = computed(() => [
            ...wallets.value.filter((a: any) => a.state !== AdapterState.NotFound),
            ...wallets.value.filter((a: any) => a.state === AdapterState.NotFound),
        ]);

        const closeOnEscapeKey = (e: any) => (e.key === 'Escape' ? emit('close') : null);

        onBeforeMount(() => {
            element = document.querySelector(`#${wrapperId}`);
            if (!element) {
                element = createWrapperAndAppendToBody(wrapperId);
                systemCreated = true;
            }
        });
        onMounted(() => {
            document.body.addEventListener('keydown', closeOnEscapeKey);
        });
        onUnmounted(() => {
            document.body.removeEventListener('keydown', closeOnEscapeKey);
            if (element && systemCreated) {
                document.body.removeChild(element);
            }
        });

        const onWalletClick = (wallet: Wallet) => {
            select(wallet.adapter.name);
            emit('close');
        };

        return () => (
            <VuePortal wrapperId={wrapperId}>
                <div
                    data-testid="wallet-select-modal"
                    ref={(el) => (nodeRef.value = el as HTMLDivElement)}
                    class={`adapter-modal ${props.visible && 'adapter-modal-fade-in'}`}
                >
                    <div class="adapter-modal-wrapper">
                        <div class="adapter-modal-header">
                            <button onClick={() => emit('close')} class="close-button" tabindex={0}></button>
                            <div class="adapter-modal-title">
                                Connect a wallet on
                                <br />
                                Tron to continue
                            </div>
                        </div>

                        <div class="adapter-list">
                            {walletsList.value.map((wallet) => (
                                <WalletItem
                                    key={wallet.adapter.name}
                                    wallet={wallet}
                                    onClick={() => {
                                        onWalletClick(wallet);
                                    }}
                                ></WalletItem>
                            ))}
                        </div>
                    </div>
                </div>
            </VuePortal>
        );
    },
});
