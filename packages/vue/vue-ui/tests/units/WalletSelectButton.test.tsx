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
    test('className prop should work fine', async () => {
        container = makeSut({ className: 'test-class' });
        const button = container.get('button');
        expect(button.attributes('class')).toContain('test-class');
    });
    test('tabIndex prop should work fine', async () => {
        container = makeSut({ tabIndex: 20 });
        const button = container.get('button');
        expect(button.attributes('tabindex')).toEqual('20');
    });
    test('disabled prop should work fine', async () => {
        container = makeSut({ disabled: true });
        const button = container.get('button');
        expect(button.attributes('disabled')).toEqual('');
    });
    test('disabled prop should work fine 2', async () => {
        container = makeSut({ disabled: false });
        const button = container.get('button');
        expect(button.attributes('disabled')).toBeUndefined();
    });
    test('style prop should work fine', async () => {
        container = makeSut({ style: { color: 'red' } });
        const button = container.get('button');
        expect(button.attributes('style')).toContain('color: red');
    });
    test('icon prop should work fine', async () => {
        container = makeSut({ icon: 'xxx' });
        const img = container.get('img');
        expect(img.attributes('src')).toEqual('xxx');
    });

    describe('onClick prop should work fine', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });
        test('onClick prop which returns false should work fine', async () => {
            const onClick = vi.fn(() => {
                return false;
            });
            container = makeSut({ onClick });
            vi.advanceTimersByTime(500);
            getByTestId('wallet-select-button').trigger('click');
            expect(onClick).toBeCalledTimes(1);
            await nextTick();
            const SelectModal = container.getComponent(WalletSelectModal);
            expect(SelectModal).not.toBeNull();
            await nextTick();
            expect(SelectModal.props().visible).toBe(true);
        });
        test('onClick prop which returns true should work fine', async () => {
            const onClick = vi.fn(() => {
                return true;
            });
            container = makeSut({ onClick });
            vi.advanceTimersByTime(500);
            getByTestId('wallet-select-button').trigger('click');
            expect(onClick).toBeCalledTimes(1);
            await nextTick();
            const SelectModal = container.getComponent(WalletSelectModal);
            expect(SelectModal).not.toBeNull();
            await nextTick();
            expect(SelectModal.props().visible).toBe(false);
        });
    });
});
