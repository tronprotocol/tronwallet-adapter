import { useWallet } from '@tronweb3/tronwallet-adapter-vue-hooks';
import { computed, defineComponent } from 'vue';
import { Button, ButtonProps } from './Button.js';
export const WalletConnectButton = defineComponent({
    props: ButtonProps,
    setup(props, { slots }) {
        const { wallet, connect, connecting, connected } = useWallet();
        async function handleClick() {
            let preventDefault = false;
            if (props.onClick) {
                preventDefault = await props.onClick();
            }
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            if (!preventDefault) {
                await connect().catch(() => {
                    //
                });
            }
        }

        const content = computed(() => {
            return slots.default
                ? slots.default()
                : connecting.value
                ? 'Connecting ...'
                : connected.value
                ? 'Connected'
                : wallet.value
                ? 'Connect'
                : 'Connect Wallet';
        });

        return () => (
            <Button
                {...{ ...props, onClick: handleClick }}
                data-testid="wallet-connect-button"
                className={`wallet-button ${props.className}`}
                disabled={props.disabled || !wallet.value || connecting.value || connected.value}
                icon={props.icon ? props.icon : wallet.value ? wallet.value.adapter.icon : ''}
            >
                {content.value}
            </Button>
        );
    },
});
