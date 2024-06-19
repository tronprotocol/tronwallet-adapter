import { Button } from './Button.js';
import { ButtonProps } from './Button.js';
import { useWalletModal } from './useWalletModal.js';
import { defineComponent } from 'vue';

export const WalletSelectButton = defineComponent({
    props: ButtonProps,
    setup(props, { slots }) {
        const { visible, setVisible } = useWalletModal();
        const handleClick = async () => {
            let preventDefault = false;
            if (props.onClick) {
                preventDefault = await props.onClick();
            }
            if (!preventDefault) setVisible(!visible.value);
        };
        return () => (
            <Button {...{ ...props, onClick: handleClick }} data-testid="wallet-select-button">
                {slots.default ? slots.default() : 'Select Wallet'}
            </Button>
        );
    },
});
