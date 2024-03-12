/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { WalletProvider } from '@tronweb3/tronwallet-adapter-vue-hooks';
import { WalletModalProvider } from '../../src/WalletModalProvider.js';
import { MockTronLink } from './MockTronLink.js';
import { WalletSelectButton } from '../../src/WalletSelectButton.js';
import { defineComponent, nextTick } from 'vue';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import { WalletItem, WalletSelectModal } from '../../src/index.js';

const Providers = defineComponent({
    components: { WalletProvider, WalletModalProvider, WalletSelectButton },
    props: ['className', 'tabIndex', 'style', 'disabled', 'icon', 'onClick'],
    template: `<WalletProvider><WalletModalProvider><WalletSelectButton v-bind="$props"></WalletSelectButton> </WalletModalProvider></WalletProvider>`,
});

const makeSut = (props: any = {}, children = '') => {
    return mount(Providers, { props, slots: { default: children } });
};

let container: VueWrapper;
function getByTestId(id: string) {
    return container?.get(`[data-testid="${id}"]`);
}
window.open = vi.fn();
beforeEach(() => {
    localStorage.clear();
    window.tronLink = new MockTronLink();
    window.tronWeb = window.tronLink.tronWeb;
});
describe('WalletSelectButton', () => {
    test('should work fine with basic usage', () => {
        container = makeSut({});
        const button = container.get('button');
        expect(button).not.toBeNull();
        expect(button?.attributes('disabled')).toBeUndefined;
        expect(button?.text()).toEqual('Select Wallet');
    });

    test('should work fine when select', async () => {
        vi.useFakeTimers();
        container = makeSut({});
        vi.advanceTimersByTime(500);
        getByTestId('wallet-select-button').trigger('click');

        const SelectModal = container.getComponent(WalletSelectModal);
        expect(SelectModal).not.toBeNull();
        const walletItems = container.findAllComponents(WalletItem);
        expect(walletItems.length).toBeGreaterThan(0);
        walletItems[0].get(`[data-testid="wallet-button"]`).trigger('click');
        await nextTick();
        expect(localStorage.getItem('tronAdapterName')).toEqual(`"TronLink"`);
    });
});
