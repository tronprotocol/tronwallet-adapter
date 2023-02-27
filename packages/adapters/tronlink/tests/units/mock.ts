/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { TronLinkWallet } from '../../src/adapter.js';
import type { Tron, TronWeb } from '../../src/types.js';

export class MockTronWeb implements TronWeb {
    defaultAddress: {
        base58: string;
        hex: string;
        name: string;
        type: number;
    } = { base58: '', hex: '', type: 1, name: '' };
    ready = true;
    trx = {
        sign(_: unknown): Promise<unknown> {
            return Promise.resolve('');
        },
        signMessageV2(_: unknown): Promise<unknown> {
            return Promise.resolve('');
        },
        multiSign() {
            return Promise.resolve();
        },
    } as any;
    constructor(address: string) {
        this.defaultAddress.base58 = address;
    }

    toHex(_: string): string {
        return '';
    }
}

export class MockBaseTronLink {
    protected _tronWeb: TronWeb = new MockTronWeb('');
    protected locked = true;

    constructor(address: string) {
        this._setAddress(address);
    }

    get tronWeb() {
        return this.locked ? false : !this._tronWeb.defaultAddress!.base58 ? false : this._tronWeb;
    }

    _lock() {
        this.locked = true;
    }
    _unlock() {
        this.locked = false;
    }

    _setAddress(address: string) {
        this._tronWeb.defaultAddress!.base58 = address;
    }

    request(args: { method: any; params: unknown[] | Record<string, unknown> }): Promise<any> {
        return Promise.reject('No provide request result.');
    }
}
export class MockTron extends MockBaseTronLink implements Tron {
    private listeners: Record<string, ((...args: unknown[]) => unknown)[]> = {};
    isTronLink = true;
    constructor(address?: string) {
        super(address || '');
    }

    on(event: string, cb: any) {
        if (this.listeners[event]) {
            this.listeners[event].push(cb);
        } else {
            this.listeners[event] = [cb];
        }
    }
    removeListener(event: string, cb: unknown) {
        if (this.listeners[event]) {
            const idx = this.listeners[event].findIndex((listener) => listener === cb);
            this.listeners[event].splice(idx, 1);
        }
    }

    _unlock() {
        this.locked = false;
        // const address = this._tronWeb.defaultAddress?.base58;
        // this._emit('accountsChanged', !address ? '' : [address]);
    }

    _emit(event: string, ...params: unknown[]) {
        if (this.listeners[event]) {
            this.listeners[event].forEach((cb) => {
                cb(...params);
            });
        }
    }
    _destroy() {
        this.listeners = null as any;
        window.tron = undefined;
    }
}
export class MockTronLink extends MockBaseTronLink implements TronLinkWallet {
    ready = false;
    private listeners: Record<string, ((...args: unknown[]) => unknown)[]> = {};

    constructor(address?: string) {
        super(address || '');
        this._tronWeb = new MockTronWeb(address || '');
        window.addEventListener = this._on as any;
        window.postMessage = this._emit;
    }

    get tronWeb() {
        return this._tronWeb;
    }
    _lock() {
        this.ready = false;
        this.locked = true;
        this._tronWeb.ready = false;
        window.postMessage(
            {
                message: {
                    action: 'accountsChanged',
                    data: {
                        address: false,
                    },
                },
            },
            '*'
        );
    }

    _unlock() {
        this.locked = false;
        this.ready = !!this._tronWeb.defaultAddress?.base58;
        window.postMessage(
            {
                message: {
                    action: 'accountsChanged',
                    data: {
                        address: this._tronWeb.defaultAddress?.base58,
                    },
                },
            },
            '*'
        );
    }

    _on = (event: string, cb: any) => {
        if (this.listeners[event]) {
            this.listeners[event].push(cb);
        } else {
            this.listeners[event] = [cb];
        }
    };

    _emit = (event: string, params: unknown) => {
        if (this.listeners['message']) {
            this.listeners['message'].forEach((cb) => {
                cb({
                    data: {
                        message: !params
                            ? undefined
                            : {
                                  action: event,
                                  data: params,
                              },
                    },
                });
            });
        }
    };
}
