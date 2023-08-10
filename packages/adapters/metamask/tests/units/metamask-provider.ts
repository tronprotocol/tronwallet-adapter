import { EventEmitter } from '@tronweb3/abstract-adapter-evm';

jest.useFakeTimers();
export class MetaMaskProvider extends EventEmitter {
    isMetaMask = true;
    providers = [MetaMaskProvider];
    constructor() {
        super();
    }

    request({ method }: { method: string }): Promise<any> {
        if (method === 'eth_accounts') {
            return new Promise((resolve) => {
                resolve(this._accountsRes);
            });
        }
        if (method === 'eth_requestAccounts') {
            return new Promise((resolve) => {
                resolve(this._requestAccountsRes);
                this.emit('accountsChanged', this._requestAccountsRes);
            });
        }
        if (method === 'personal_sign') {
            return new Promise((resolve) => {
                resolve(this._personalSignRes);
            });
        }
        return new Promise((resolve) => {
            resolve(null);
        });
    }

    _accountsRes: string[] = [];
    _requestAccountsRes: string[] = [];
    _personalSignRes = '';
    _setAccountsRes(accounts: string[]) {
        this._accountsRes = accounts;
    }
    _setRequestAccountsRes(accounts: string[]) {
        this._requestAccountsRes = accounts;
    }
    _setPersonalSignRes(res: string) {
        this._personalSignRes = res;
    }
}
