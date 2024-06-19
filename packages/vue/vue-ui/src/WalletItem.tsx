import { AdapterState } from '@tronweb3/tronwallet-abstract-adapter';
import type { Wallet } from '@tronweb3/tronwallet-adapter-vue-hooks';
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { Button } from './Button.js';

export interface WalletItemProps {
    onClick: () => void;
    wallet: Wallet;
}
export const WalletItem = defineComponent({
    props: {
        wallet: {
            type: Object as PropType<Wallet>,
            required: true,
        },
    },
    emits: ['click'],
    setup(props, { emit }) {
        function onClick() {
            emit('click');
        }
        return () => (
            <div class="adapter-wallet-item">
                <Button onClick={onClick} icon={props.wallet.adapter.icon} tabIndex={0}>
                    {props.wallet.adapter.name}
                    <span class="status-text">
                        {props.wallet.state !== AdapterState.NotFound ? 'Detected' : 'NotFound'}
                    </span>
                </Button>
            </div>
        );
    },
});
