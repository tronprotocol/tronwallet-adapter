/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { WalletProvider } from '@tronweb3/tronwallet-adapter-vue-hooks';
import { WalletModalProvider } from '../../src/WalletModalProvider.js';
import { MockTronLink } from './MockTronLink.js';
import { WalletActionButton } from '../../src/WalletActionButton/WalletActionButton.js';
import { afterEach, vi } from 'vitest';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { WalletSelectButton } from '../../src/WalletSelectButton.js';
import { WalletItem } from '../../src/WalletItem.js';
import { WalletSelectModal } from '../../src/index.js';
async function wait() {
    await nextTick();
}
const Providers = defineComponent({
    components: { WalletProvider, WalletModalProvider, WalletActionButton },
    template: `<WalletProvider><WalletModalProvider><WalletActionButton v-bind="$attrs"><slot></slot></WalletActionButton> </WalletModalProvider></WalletProvider>`,
});
const NoAutoConnectProviders = defineComponent({
    components: { WalletProvider, WalletModalProvider, WalletActionButton },
    template: `<WalletProvider :autoConnect="false"><WalletModalProvider><WalletActionButton v-bind="$attrs"></WalletActionButton></WalletModalProvider></WalletProvider>`,
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

window.open = vi.fn();
beforeEach(() => {
    vi.stubGlobal('open', vi.fn());
    localStorage.clear();
    window.tronLink = new MockTronLink();
    window.tronWeb = window.tronLink.tronWeb;
});

afterEach(() => {
    container?.unmount();
});

describe('when tronlink is avaliable', () => {
    describe('when no wallet is selected', () => {
        test('selectButton should exist', async () => {
            container = makeSut();
            expect(getByTestId('wallet-select-button')).not.toBeNull();
        });

        test('actionButton exist after select a wallet when autoConnect enabled', async () => {
            container = makeSut();
            const selectButton = container.getComponent(WalletSelectButton);
            selectButton.trigger('click');
            expect(container.getComponent(WalletSelectModal)).not.toBeNull();
            const walletItems = container.findAllComponents(WalletItem);
            expect(walletItems.length).toBeGreaterThan(0);
            walletItems[0].get(`[data-testid="wallet-button"]`).trigger('click');
            await wait();
            expect(getByTestId('wallet-action-button')).not.toBeNull();
        });
    });
    describe('when a wallet is seleted', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            localStorage.setItem('tronAdapterName', '"TronLink"');
        });

        test('actionButton should exist when autoConnect enabled', () => {
            container = makeSut({});
            expect(getByTestId('wallet-action-button')).not.toBeNull();
        });
    });
});

describe('when tronlink is not avaliable', () => {
    beforeEach(() => {
        window.tronLink = undefined;
        window.tronWeb = undefined;
    });
    describe('when no wallet is selected', () => {
        test('selectButton should exist', async () => {
            container = makeSut();
            expect(getByTestId('wallet-select-button')).not.toBeNull();
        });

        test('should open website after select a wallet', async () => {
            vi.useFakeTimers();
            container = makeSut();
            getByTestId('wallet-select-button').trigger('click');
            const walletItems = container.findAllComponents(WalletItem);
            expect(walletItems.length).toBeGreaterThan(0);
            walletItems[0].get(`[data-testid="wallet-button"]`).trigger('click');
            await wait();
            getByTestId('wallet-connect-button').trigger('click');
            vi.advanceTimersByTime(40000);
            await wait();
            expect(window.open).toHaveBeenCalled();
        });
    });
});

describe('when tronlink is avaliable but not ready', () => {
    beforeEach(() => {
        (window.tronLink as MockTronLink).setReadyState(false);
        (window.tronLink as MockTronLink).address = '';
    });
    describe('when no wallet is selected', () => {
        test('selectButton should exist', async () => {
            container = makeSut();
            expect(getByTestId('wallet-select-button')).not.toBeNull();
        });

        test('should work fine when select a wallet', async () => {
            container = makeSutNoAutoConnect();
            await wait();
            getByTestId('wallet-select-button').trigger('click');
            await wait();
            expect(container.getComponent(WalletSelectModal)).not.toBeNull();
            const walletItems = container.findAllComponents(WalletItem);
            expect(walletItems.length).toBeGreaterThan(0);
            walletItems[0].get(`[data-testid="wallet-button"]`).trigger('click');
            await wait();
            expect(getByTestId('wallet-connect-button')).not.toBeNull();
            getByTestId('wallet-connect-button').trigger('click');
            expect(getByTestId('wallet-action-button')).not.toBeNull();
        });
    });

    describe('when a wallet is selected', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            localStorage.setItem('tronAdapterName', '"TronLink"');
        });
        test('should work fine when autoConnect enabled', async () => {
            container = makeSut();
            expect(getByTestId('wallet-connect-button')).not.toBeNull();
            vi.advanceTimersByTime(1300);
            await wait();
            expect(getByTestId('wallet-action-button')).not.toBeNull();
        });
        test('should work fine when autoConnect disabled', async () => {
            container = makeSutNoAutoConnect();
            expect(getByTestId('wallet-connect-button')).not.toBeNull();

            getByTestId('wallet-connect-button').trigger('click');
            await wait();
            expect(getByTestId('wallet-connect-button').html()).toContain('Connecting');

            expect(getByTestId('wallet-action-button')).not.toBeNull();
        });
    });
});
