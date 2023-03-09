export enum NetworkType {
    Mainnet = 'Mainnet',
    Shasta = 'Shasta',
    Nile = 'Nile',
    /**
     * When use custom node
     */
    Unknown = 'Unknown',
}

export type Network = {
    networkType: NetworkType;
    chainId: string;
    fullNode: string;
    solidityNode: string;
    eventServer: string;
};

export type { Network as NetworkNodeConfig };
export { NetworkType as ChainNetwork };
// types should be defined in @tronweb3/web3.js, such as tronweb
// as no ts in tronweb
// just defined here
export type Contract = {
    parameter: {
        type_url: string;
        value: Record<string, unknown>;
    };
    type: string;
};

export type Transaction = {
    visible: boolean;
    txID: string;
    raw_data: {
        contract: Contract[];
        ref_block_bytes: string;
        ref_block_hash: string;
        expiration: number;
        fee_limit: number;
        timestamp: number;
    };
    raw_data_hex: string;
    signature?: string[];
    [key: string]: unknown;
};

export type SignedTransaction = Transaction & { signature: string[] };
