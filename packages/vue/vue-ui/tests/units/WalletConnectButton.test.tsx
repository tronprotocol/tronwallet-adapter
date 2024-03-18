/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { WalletConnectButton } from '../../src/WalletConnectButton.js';
import { WalletSelectButton } from '../../src/WalletSelectButton.js';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-vue-hooks';
import { WalletModalProvider } from '../../src/WalletModalProvider.js';
import { MockTronLink } from './MockTronLink.js';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { vi } from 'vitest';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapter-tronlink';

const Providers = defineComponent({
    components: { WalletProvider, WalletModalProvider, WalletConnectButton, WalletSelectButton },
    props: ['className', 'tabIndex', 'style', 'icon', 'disabled', 'onClick'],
    template: `<WalletProvider><WalletModalProvider><WalletSelectButton /><WalletConnectButton v-bind="$props"></WalletConnectButton> </WalletModalProvider></WalletProvider>`,
});
const NoAutoConnectProviders = defineComponent({
    components: { WalletProvider, WalletModalProvider, WalletConnectButton, WalletSelectButton },
    props: ['className', 'tabIndex', 'style', 'icon', 'disabled', 'onClick'],
    template: `<WalletProvider :autoConnect="false"><WalletModalProvider><WalletSelectButton /><WalletConnectButton v-bind="$props"></WalletConnectButton></WalletModalProvider></WalletProvider>`,
});
const makeSut = (props: any = {}, children = '') => {
    return mount(Providers, {
        props: { adapters: [new TronLinkAdapter({ checkTimeout: 0 })], ...props },
        slots: { default: children },
    });
};
const makeSutNoAutoConnect = (props: any = {}, children = '') => {
    return mount(NoAutoConnectProviders, {
        props: { adapters: [new TronLinkAdapter({ checkTimeout: 0 })], ...props },
        slots: children ? { default: children } : {},
    });
};
let container: VueWrapper;

function getByTestId(id: string) {
    return container?.get(`[data-testid="${id}"]`);
}
beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    window.tronLink = new MockTronLink();
    window.tronWeb = window.tronLink.tronWeb;
});
describe('basic usage', () => {
    test('should work fine with basic usage', () => {
        container = makeSut({
            className: 'test-class-name',
            tabIndex: 20,
            style: { borderColor: 'red' },
        });
        const button = getByTestId('wallet-connect-button');
        expect(button).not.toBeNull();
        // class change will influence style
        expect(button?.classes().includes('adapter-vue-button')).toBe(true);
        expect(button?.classes().includes('test-class-name')).toBe(true);
        expect(button?.attributes('tabindex')).toBe('20');
        expect(button?.attributes('style')).toContain('border-color: red');
        expect(button?.attributes('disabled')).toBe('');
        expect(button?.text()).toEqual('Connect Wallet');
    });
    test('className prop should work fine', async () => {
        container = makeSut({ className: 'test-class' });
        const button = getByTestId('wallet-connect-button');
        expect(button.attributes('class')).toContain('test-class');
    });
    test('tabIndex prop should work fine', async () => {
        container = makeSut({ tabIndex: 20 });
        const button = getByTestId('wallet-connect-button');
        expect(button.attributes('tabindex')).toEqual('20');
    });
    test('disabled prop should work fine', async () => {
        window.tronLink = { tronWeb: { defaultAddress: {} } } as any;
        container = makeSut({ disabled: true });
        const button = getByTestId('wallet-connect-button');
        expect(button.attributes('disabled')).toEqual('');
    });
    test('disabled prop should work fine 2', async () => {
        window.tronLink = { tronWeb: { defaultAddress: {} } } as any;
        localStorage.setItem('tronAdapterName', `"TronLink"`);
        container = makeSut({ adapters: [new TronLinkAdapter({ checkTimeout: 0 })], disabled: false });
        await nextTick();
        const button = getByTestId('wallet-connect-button');
        await nextTick();
        expect(button.attributes('disabled')).toBeUndefined();
    });
    test('style prop should work fine', async () => {
        container = makeSut({ style: { color: 'red' } });
        const button = getByTestId('wallet-connect-button');
        expect(button.attributes('style')).toContain('color: red');
    });
    test('icon prop should work fine', async () => {
        container = makeSut({ icon: 'xxx' });
        const img = container.get('img');
        expect(img.attributes('src')).toEqual('xxx');
    });

    describe('onClick prop should work fine', () => {
        beforeEach(() => {
            localStorage.setItem('tronAdapterName', `"TronLink"`);
            vi.useFakeTimers();
        });
        test('onClick prop which returns false should work fine', async () => {
            window.tronLink = { tronWeb: { defaultAddress: {} } } as any;
            const onClick = vi.fn(() => {
                return false;
            });
            const adapter = new TronLinkAdapter({ checkTimeout: 0 });
            adapter.connect = vi.fn();
            container = makeSutNoAutoConnect({ onClick, adapters: [adapter] });
            await nextTick();
            vi.advanceTimersByTime(500);
            getByTestId('wallet-connect-button').trigger('click');
            await nextTick();
            expect(onClick).toBeCalledTimes(1);
            await nextTick();
            expect(adapter.connect).toBeCalledTimes(1);
        });
        test('onClick prop which returns true should work fine', async () => {
            window.tronLink = { tronWeb: { defaultAddress: {} } } as any;
            const onClick = vi.fn(() => {
                return true;
            });
            const adapter = new TronLinkAdapter({ checkTimeout: 0 });
            adapter.connect = vi.fn();
            container = makeSutNoAutoConnect({ onClick, adapters: [adapter] });
            vi.advanceTimersByTime(500);
            expect(getByTestId('wallet-connect-button').attributes('disabled')).toBeUndefined();
            getByTestId('wallet-connect-button').trigger('click');
            await nextTick();
            expect(onClick).toBeCalledTimes(1);
            await nextTick();
            expect(adapter.connect).toBeCalledTimes(0);
        });
    });
});

describe('when no wallet is selected', () => {
    test('should be disabled', async () => {
        container = makeSut();
        expect(getByTestId('wallet-connect-button').attributes('disabled')).toBe('');
        expect(getByTestId('wallet-connect-button').text()).toEqual('Connect Wallet');
    });
});

describe('when a wallet is seleted', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.setItem('tronAdapterName', '"TronLink"');
        window.open = vi.fn();
    });
    describe('when tronlink is avaliable', () => {
        test('should auto connect and be disabled when antoConnect enabled', async () => {
            container = makeSut({ adapters: [new TronLinkAdapter({ checkTimeout: 0 })] });
            vi.advanceTimersByTime(40000);
            await nextTick();
            const el = getByTestId('wallet-connect-button');
            await nextTick();
            expect(el).not.toBeNull();
            await nextTick();
            vi.advanceTimersByTime(40000);
            await nextTick();
            expect(el.text()).toEqual('Connected');
            expect(el.attributes('disabled')).toBe('');
            await nextTick();
        });
        test('tronlink is connected when antoConnect disabled', async () => {
            container = makeSutNoAutoConnect({});
            vi.advanceTimersByTime(5000);
            await nextTick();
            const el = getByTestId('wallet-connect-button');
            expect(el).not.toBeNull();
            expect(el.attributes('disabled')).toBe('');
            expect(el.text()).toEqual('Connected');
        });
    });

    describe('when tronlink is not avaliable', () => {
        beforeEach(() => {
            window.tronLink = undefined;
            window.tronWeb = undefined;
            window.open = vi.fn();
            vi.useFakeTimers();
        });
        test('should not be disabled with autoConnect enabled', async () => {
            container = makeSut();
            vi.advanceTimersByTime(50000);
            await nextTick();
            expect(getByTestId('wallet-connect-button').attributes('disabled')).toEqual('');
            await nextTick();
            expect(getByTestId('wallet-connect-button').text()).toEqual('Connect');
        });
        test('should not be disabled with autoConnect disabled', async () => {
            container = makeSutNoAutoConnect();
            expect(getByTestId('wallet-connect-button').attributes('disabled')).toBeUndefined();
            expect(getByTestId('wallet-connect-button').text()).toEqual('Connect');
        });
    });
});
