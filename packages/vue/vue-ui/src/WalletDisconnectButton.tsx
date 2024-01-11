import { useWallet } from '@tronweb3/tronwallet-adapter-vue-hooks';
import { computed, defineComponent } from 'vue';
import { Button, ButtonProps } from './Button.js';
export const WalletDisconnectButton = defineComponent({
    props: ButtonProps,
    emits: ['click'],
    setup(props, { slots }) {
        const { wallet, disconnect, disconnecting, connected } = useWallet();
        function handleClick() {
            let preventDefault = false;
            if (props.onClick) {
                preventDefault = props.onClick();
            }
            if (!preventDefault) {
                disconnect().catch(() => {
                    //
                });
            }
        }
        const content = computed(() => {
            if (slots.default) return slots.default();
            if (disconnecting.value) return 'Disconnecting ...';
            if (wallet.value) return 'Disconnect';
            return 'Disconnect Wallet';
        });
        return () => (
            <Button
                {...props}
                data-testid="wallet-disconnect-button"
                disabled={props.disabled || !wallet.value || !connected.value}
                icon={wallet.value ? wallet.value.adapter.icon : ''}
                onClick={handleClick}
            >
                {content.value}
            </Button>
        );
    },
});
