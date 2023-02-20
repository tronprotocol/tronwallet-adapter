/* eslint-disable @typescript-eslint/no-unused-vars */
module.exports = class Trx {
    static _getAddress(path, display = false) {
        return Promise.resolve({
            address: 'testaddress',
            publicKey: 'testPublicKey',
        });
    }
    static async _signTransaction(path, rawTxHex, tokenSignatures) {
        return new Promise((resolve) => {
            resolve('signedResponse');
        });
    }
    static async _signPersonalMessage(path, hex) {
        return new Promise((resolve, reject) => {
            resolve('signPersonalMessageResponse');
        });
    }
    async getAddress(path, display = false) {
        return Trx._getAddress(path, display);
    }
    async signTransaction(path, rawTxHex, tokenSignatures) {
        return Trx._signTransaction(path, rawTxHex, tokenSignatures);
    }
    async signPersonalMessage(path, hex) {
        return Trx._signPersonalMessage(path, hex);
    }
};
