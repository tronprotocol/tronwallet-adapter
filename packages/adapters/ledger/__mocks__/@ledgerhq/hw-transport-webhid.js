module.exports = class TransportWebHID {
    static create() {
        return new TransportWebHID();
    }

    static _close() {
        return Promise.resolve();
    }

    close() {
        return TransportWebHID._close();
    }
};
