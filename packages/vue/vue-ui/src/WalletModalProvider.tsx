import { defineComponent, provide, readonly, ref } from 'vue';
import { WalletSelectModal } from './Modal/WalletSelectModal.js';
export const WalletModalProvider = defineComponent({
    setup(props, { slots }) {
        const visible = ref(false);
        function setVisible(v: boolean) {
            visible.value = v;
        }
        provide('TronWalletModalContext', {
            visible: readonly(visible),
            setVisible,
        });
        return () => (
            <>
                {slots.default ? slots.default() : ''}
                <WalletSelectModal visible={visible.value} onClose={() => setVisible(false)}></WalletSelectModal>
            </>
        );
    },
});
