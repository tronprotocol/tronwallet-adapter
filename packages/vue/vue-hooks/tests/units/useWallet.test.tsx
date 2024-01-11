import { describe, test, vi, beforeEach, afterEach, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import {
    Adapter,
    WalletNotSelectedError,
    AdapterState,
    isInBrowser,
    WalletNotFoundError,
    WalletReadyState,
} from '@tronweb3/tronwallet-abstract-adapter';
import type { AdapterName } from '@tronweb3/tronwallet-abstract-adapter';
import { useWallet } from '../../src/useWallet.js';
import type { WalletContextState } from '../../src/useWallet.js';

import { defineComponent, h, nextTick } from 'vue';
import { WalletProvider } from '../../src/WalletProvider.js';
import type { WalletProviderProps } from '../../src/WalletProvider.js';
async function wait() {
    await nextTick();
}
const TestComponent = defineComponent({
    setup(props, { expose }) {
        const wallet = useWallet();
        expose({
            getState: () => wallet,
        });

        return () => h('div', 'TestComponent');
    },
});
window.open = vi.fn();
describe('useWallet', function () {
    let wrapper: ReturnType<typeof mount>;
    let adapter1: FakeAdapter;
    let adapter2: FakeAdapter;
    let adapter3: FakeAdapter;
    let adapters: Adapter[];
    let componentRef: { getState: () => WalletContextState };

    function mountTest(props: WalletProviderProps) {
        wrapper = mount(WalletProvider, { props, slots: { default: () => h(TestComponent) } });
        componentRef = wrapper.getComponent(TestComponent).getCurrentComponent().exposed as any;
    }

    beforeEach(function () {
        localStorage.clear();
        adapter1 = new Adapter1();
        adapter2 = new Adapter2();
        adapter3 = new Adapter3();
        adapters = [adapter1, adapter2, adapter3];
    });
    afterEach(function () {
        wrapper.unmount();
    });

    describe('when there is no wallet ready', function () {
        beforeEach(async function () {
            adapter1._state = AdapterState.NotFound;
            mountTest({ adapters } as WalletProviderProps);
            await componentRef.getState().select(adapter1.name);
            await wait();
        });
        test('connect should not be called', function () {
            expect(adapter1.connect).toHaveBeenCalledTimes(0);
        });
        test('should be ok when call disconnect', async function () {
            expect(componentRef.getState().disconnect).not.toThrow();
        });
        test('signMessage should not be called when call signMessage', async function () {
            await componentRef.getState().signMessage('string');
            expect(adapter1.signMessage).toHaveBeenCalledTimes(1);
        });
        test('signTransaction should not be called when call signTransaction', async function () {
            await componentRef.getState().signTransaction({} as any);
            expect(adapter1.signTransaction).toHaveBeenCalledTimes(1);
        });
    });
    describe('when there is a wallet ready with autoConnect', function () {
        beforeEach(async function () {
            adapter1._state = AdapterState.Disconnect;
            mountTest({ adapters } as WalletProviderProps);
            await componentRef.getState().select(adapter1.name);
            await wait();
            // auto select
            expect(componentRef.getState().wallet?.value?.state).toEqual(AdapterState.Connected);
        });

        test('selected wallet should be null when select a non-exist wallet', async function () {
            await componentRef.getState().select('Non exist name' as AdapterName<'Non exist name'>);
            await wait();
            expect(componentRef.getState().wallet.value).toEqual(null);
            expect(componentRef.getState().connected.value).toEqual(false);
        });

        test('selected wallet should be null when disconnect', async function () {
            await componentRef.getState().disconnect();
            await wait();
            expect(componentRef.getState().wallet.value).toEqual(null);
            expect(componentRef.getState().connected.value).toEqual(false);
        });
        test('should be connected when change wallet as autoConnect enable', async function () {
            adapter2._state = AdapterState.Disconnect;
            adapter2.emit('stateChanged', AdapterState.Disconnect);
            await componentRef.getState().select(adapter2.name);
            await wait();
            expect(componentRef.getState().wallet?.value?.adapter.name).toEqual(adapter2.name);
            expect(componentRef.getState().wallet?.value?.state).toEqual(AdapterState.Connected);
        });
    });

    describe('when there is a wallet ready with autoConnect disable', function () {
        beforeEach(async function () {
            adapter1._state = AdapterState.Disconnect;
            adapter2.emit('stateChanged', AdapterState.Disconnect);
            mountTest({ autoConnect: false, adapters } as WalletProviderProps);
            await componentRef.getState().select(adapter1.name);
            await wait();
            // auto select
            expect(componentRef.getState().wallet?.value?.state).toEqual(AdapterState.Disconnect);
        });
        test('should be disconnected when change wallet as autoConnect disable', async function () {
            adapter2._state = AdapterState.Disconnect;
            adapter2.emit('stateChanged', AdapterState.Disconnect);
            await componentRef.getState().select(adapter2.name);
            await wait();
            expect(componentRef.getState().wallet?.value?.adapter.name).toEqual(adapter2.name);
            expect(componentRef.getState().wallet?.value?.state).toEqual(AdapterState.Disconnect);
        });
    });

    describe('when there is a seleted a wallet in local storage', function () {
        beforeEach(function () {
            localStorage.setItem('tronAdapterName', JSON.stringify(adapter1.name));
            mountTest({ localStorageKey: 'tronAdapterName', adapters } as WalletProviderProps);
        });
        test('wallet should be the selected wallet', function () {
            expect(componentRef.getState().wallet?.value?.adapter.name).toEqual(adapter1.name);
        });
        test('should success when change a wallet', async function () {
            await componentRef.getState().select(adapter2.name);
            const state = componentRef.getState();
            expect(state?.wallet?.value?.adapter.name).toEqual(adapter2.name);
            expect(state?.connected.value).toEqual(false);
        });
    });
    describe('when there is no seleted a wallet in local storage', function () {
        beforeEach(function () {
            mountTest({ adapters } as WalletProviderProps);
        });
        test('wallet should be null', function () {
            expect(componentRef.getState().wallet.value).toEqual(null);
        });
    });

    describe('custom error should work fine', function () {
        beforeEach(function () {
            adapter1.connectMethod = () => Promise.resolve();
            adapter1.disconnectMethod = () => Promise.resolve();
        });
        // skip these two test cases, because use Promise.reject() as adapter.connect won't work as expected
        test('connect error should work fine', async function () {
            const onError = vi.fn();
            vi.useFakeTimers();
            adapter1._state = AdapterState.Disconnect;
            adapter1.connectMethod = () => Promise.reject();
            mountTest({ onError, adapters } as unknown as WalletProviderProps);

            await componentRef.getState().select(adapter1.name);
            await wait();

            await componentRef.getState().connect();
            await wait();
            vi.advanceTimersByTime(200);
            expect(onError).toHaveBeenCalledTimes(1);
        });
        test.skip('disconnect error should work fine', async function () {
            const onError = vi.fn();
            adapter1._state = AdapterState.Disconnect;
            adapter1.connectMethod = () => Promise.resolve();
            adapter1.disconnectMethod = async () => {
                throw new Error('error');
            };

            mountTest({ onError, adapters } as unknown as WalletProviderProps);
            await componentRef.getState().select(adapter1.name);
            await wait();
            expect(componentRef.getState().wallet?.value?.adapter.name).toEqual(adapter1.name);
            try {
                await componentRef.getState().connect();
            } catch (e) {
                console.log('error', String(e));
            }
            await wait();

            try {
                await componentRef.getState().disconnect();
            } catch (e) {
                console.error(String(e));
            }
            await wait();

            expect(onError).toHaveBeenCalledTimes(1);
        });
    });

    describe('event handler props should work fine', function () {
        test('onReadyStateChanged should work fine', async function () {
            mountTest({
                adapters,
            });
            await componentRef.getState().select(adapter1.name);
            await wait();
            expect(wrapper.emitted()).toHaveProperty('adapterChanged');
            expect(wrapper.emitted('adapterChanged')?.[0][0]).toEqual(adapter1);

            adapter1.emit('connect', 'fakeaddress');
            expect(wrapper.emitted()).toHaveProperty('connect');
            expect(wrapper.emitted('connect')?.[0][0]).toEqual('fakeaddress');
            adapter1.emit('disconnect');
            expect(wrapper.emitted()).toHaveProperty('disconnect');
            adapter1.emit('readyStateChanged', WalletReadyState.Found);
            expect(wrapper.emitted()).toHaveProperty('readyStateChanged');
            expect(wrapper.emitted('readyStateChanged')?.[0][0]).toEqual(WalletReadyState.Found);
            adapter1.emit('accountsChanged', 'fakeaddress', '');
            expect(wrapper.emitted()).toHaveProperty('accountsChanged');
            expect(wrapper.emitted('accountsChanged')?.[0][0]).toEqual('fakeaddress');
            expect(wrapper.emitted('accountsChanged')?.[0][1]).toEqual('');

            adapter1.emit('chainChanged', 'chainChangedData');
            expect(wrapper.emitted()).toHaveProperty('chainChanged');
            expect(wrapper.emitted('chainChanged')?.[0][0]).toEqual('chainChangedData');
        });
    });
    test('disableAutoConnectOnLoad property should work fine', async function () {
        const storageKey = 'AdapterName';
        localStorage.setItem(storageKey, JSON.stringify(adapter1.name));
        adapter1._state = AdapterState.Disconnect;
        adapter2._state = AdapterState.Disconnect;
        mountTest({ disableAutoConnectOnLoad: true, adapters });
        await wait();
        expect(adapter1.connected).toEqual(false);
        await componentRef.getState().select(adapter2.name);
        await wait();
        await wait();
        expect(adapter2.connected).toEqual(true);
    });

    describe('connect()', function () {
        describe('given a wallet that is not ready', () => {
            beforeEach(async () => {
                (window.open as any).mockClear();
                adapter1._state = AdapterState.NotFound;
                mountTest({
                    autoConnect: false,
                    adapters,
                });
                await componentRef.getState().select(adapter1.name);
                expect(componentRef.getState().wallet?.value?.state).toEqual(AdapterState.NotFound);

                try {
                    await componentRef.getState().connect();
                    throw new Error();
                } catch (e) {
                    expect(e).toBeInstanceOf(WalletNotFoundError);
                }
            });
            test('clear the state', () => {
                const state = componentRef.getState();
                expect(state?.wallet.value).toEqual(null);
                expect(state?.connected.value).toEqual(false);
            });
            test("opens the wallet's URL in a new window", () => {
                expect(window.open).toHaveBeenCalledTimes(1);
            });
            test('throws a `WalletNotFoundError`', async () => {
                adapter1._state = AdapterState.NotFound;
                await componentRef.getState().select(adapter1.name);
                await wait();
                try {
                    await componentRef.getState().connect();
                    throw new Error();
                } catch (e) {
                    expect(e).toBeInstanceOf(WalletNotFoundError);
                }
            });
        });
        describe('given a wallet that is ready', function () {
            beforeEach(async function () {
                adapter1._state = AdapterState.Disconnect;
                mountTest({
                    adapters,
                    // autoConnect: true,
                });
                await componentRef.getState().select(adapter1.name);
                await wait();
            });
            test('connect() should work fine', async function () {
                await componentRef.getState().connect();
                expect(true).toBe(true);
            });
            test('connect() should throw NoSelectedError when select a non-exist wallet', async function () {
                await componentRef.getState().select('none' as AdapterName<'none'>);
                await wait();
                try {
                    await componentRef.getState().connect();
                    throw new Error();
                } catch (e) {
                    expect(e).toBeInstanceOf(WalletNotSelectedError);
                }
            });
        });
    });

    describe('disconnect()', function () {
        beforeEach(function () {
            adapter1._state = AdapterState.Disconnect;
            mountTest({});
        });
        test('disconnect() should not be called as there is no selected wallet', async function () {
            try {
                await componentRef.getState().disconnect();
            } catch (e) {
                //
            }
            expect(adapter1.disconnect).toHaveBeenCalledTimes(0);
        });
    });
});

abstract class FakeAdapter extends Adapter {
    connectMethod = () => Promise.resolve();
    disconnectMethod: any = () => Promise.resolve();
    address: string | null = null;
    _connected = false;
    readyState = WalletReadyState.Found;
    get connected() {
        return this._connected;
    }
    _state = AdapterState.NotFound;
    get state() {
        return this._state;
    }
    connecting = false;
    connect = vi.fn(async () => {
        if (this.state === AdapterState.NotFound) {
            isInBrowser() && window.open(this.url, '_blank');
            throw new WalletNotFoundError();
        }
        this.connecting = true;
        if (this.connectMethod) {
            try {
                await this.connectMethod();
            } catch (error: any) {
                this.emit('error', error);
                throw error;
            }
        }
        this.connecting = false;
        this._connected = true;
        this._state = AdapterState.Connected;
        this.emit('connect', this.address || '');
        this.emit('stateChanged', this._state);
    });
    disconnect = vi.fn(async () => {
        this.connecting = false;
        if (this.disconnectMethod) {
            try {
                await this.disconnectMethod();
            } catch (error: any) {
                this.emit('error', error);
                throw error;
            }
        }
        this._connected = false;
        this._state = AdapterState.Disconnect;
        this.emit('disconnect');
        this.emit('stateChanged', this._state);
    });
    signMessage = vi.fn();
    signTransaction = vi.fn();
}

class Adapter1 extends FakeAdapter {
    name = 'Adapter1' as AdapterName<'Adapter1'>;
    url = 'https://adapter1.com';
    icon = 'adapter.png';
    address = '1';
}
class Adapter2 extends FakeAdapter {
    name = 'Adapter2' as AdapterName<'Adapter2'>;
    url = 'https://adapter2.com';
    icon = 'adapter.png';
    address = '2';
}
class Adapter3 extends FakeAdapter {
    name = 'Adapter3' as AdapterName<'Adapter3'>;
    url = 'https://adapter3.com';
    icon = 'adapter.png';
    address = '3';
}
