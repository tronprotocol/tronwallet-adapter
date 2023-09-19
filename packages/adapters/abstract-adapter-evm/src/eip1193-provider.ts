export interface RequestArguments {
    readonly method: string;
    readonly params?: readonly unknown[] | object;
}

export interface ProviderRpcError extends Error {
    code: number;
    data?: unknown;
}

export interface ProviderMessage {
    readonly type: string;
    readonly data: unknown;
}

export interface ProviderConnectInfo {
    readonly chainId: string;
}
export interface ProviderEvents {
    /**
     * Emitted when wallet is connected to RPC server.
     */
    connect(connectInfo: ProviderConnectInfo): void;
    /**
     * Emitted when wallet is disconnected from RPC server.
     */
    disconnect(error: ProviderRpcError): void;
    /**
     * Emitted when wallet is disconnected from RPC server.
     */
    accountsChanged(accounts: string[]): void;
    /**
     * Emitted when the currently connected chain changes.
     */
    chainChanged(chainId: string): void;
}

export interface EIP1193Provider {
    on<TEvent extends keyof ProviderEvents>(event: TEvent, listener: ProviderEvents[TEvent]): this;
    removeListener<TEvent extends keyof ProviderEvents>(event: TEvent, listener: ProviderEvents[TEvent]): this;
    removeAllListeners(event?: string | symbol): this;
    request<P = unknown[], T = unknown>(params: { method: string; params?: P }): Promise<T>;

    /** Used to identity wallet */
    isMetaMask: boolean;
}
