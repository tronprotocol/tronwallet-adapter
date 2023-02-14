/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
export class LedgerWallet {
    static _constructor(...args: any[]) {}
    static _connect(...args: any[]) {}
    static _disconnect(...args: any[]) {}
    static _signPersonalMessage(...args: any[]) {}
    static _signTransaction(...args: any[]) {}
    static _getAccounts(...args: any[]) {}
    static _getAddress(...args: any[]) {}
    constructor(...args: any[]) {
        LedgerWallet._constructor(...args);
    }
    async connect(...args: any[]) {
        return await LedgerWallet._connect(...args);
    }
    disconnect(...args: any[]) {
        return LedgerWallet._disconnect(...args);
    }
    async signPersonalMessage(...args: any[]) {
        return await LedgerWallet._signPersonalMessage(...args);
    }
    async signTransaction(...args: any[]) {
        return await LedgerWallet._signTransaction(...args);
    }
    async getAccounts(...args: any[]) {
        return await LedgerWallet._getAccounts(...args);
    }
    async getAddress(...args: any[]) {
        return await LedgerWallet._getAddress(...args);
    }
}
