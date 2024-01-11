/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { WalletConnectButton } from '../../src/WalletConnectButton.js';
import { WalletProvider } from '@tronweb3/tronwallet-adapter-vue-hooks';
import { WalletModalProvider } from '../../src/WalletModalProvider.js';
import { MockTronLink } from './MockTronLink.js';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { vi } from 'vitest';

const Providers = defineComponent({
    components: { WalletProvider, WalletModalProvider, WalletConnectButton },
    template: `<WalletProvider><WalletModalProvider><WalletConnectButton v-bind="$attrs"></WalletConnectButton> </WalletModalProvider></WalletProvider>`,
});
const NoAutoConnectProviders = defineComponent({
    components: { WalletProvider, WalletModalProvider, WalletConnectButton },
    template: `<WalletProvider :autoConnect="false"><WalletModalProvider><WalletConnectButton v-bind="$attrs"></WalletConnectButton></WalletModalProvider></WalletProvider>`,
});
const makeSut = (props: any = {}, children = '') => {
    return mount(Providers, { props, slots: { default: children } });
};
const makeSutNoAutoConnect = (props: any = {}, children = '') => {
    return mount(NoAutoConnectProviders, { props, slots: children ? { default: children } : {} });
};
let container: VueWrapper;

function getByTestId(id: string) {
    return container?.get(`[data-testid="${id}"]`);
}
beforeEach(() => {
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
        const button = container.get('button');
        expect(button).not.toBeNull();
        // class change will influence style
        expect(button?.classes().includes('adapter-vue-button')).toBe(true);
        expect(button?.classes().includes('test-class-name')).toBe(true);
        expect(button?.attributes('tabindex')).toBe('20');
        expect(button?.attributes('style')).toContain('border-color: red');
        expect(button?.attributes('disabled')).toBe('');
        expect(button?.text()).toEqual('Connect Wallet');
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
    });
    describe('when tronlink is avaliable', () => {
        test('should auto connect and be disabled when antoConnect enabled', async () => {
            container = makeSut({});
            vi.advanceTimersByTime(4000);
            await nextTick();
            const el = getByTestId('wallet-connect-button');
            expect(el).not.toBeNull();
            expect(el.attributes('disabled')).toBe('');
            expect(el.text()).toEqual('Connected');
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
        });
        test('should not be disabled with autoConnect enabled', async () => {
            container = makeSut();
            expect(getByTestId('wallet-connect-button').attributes('disabled')).toBeUndefined();
            expect(getByTestId('wallet-connect-button').text()).toEqual('Connect');
        });
        test('should not be disabled with autoConnect disabled', async () => {
            container = makeSutNoAutoConnect();
            expect(getByTestId('wallet-connect-button').attributes('disabled')).toBeUndefined();
            expect(getByTestId('wallet-connect-button').text()).toEqual('Connect');
        });
    });
});
