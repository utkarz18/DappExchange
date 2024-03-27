import { Contract, ethers } from "ethers";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Token {
    loaded: boolean;
    contract: Contract;
    symbol: string;
}

interface ExchangeTokenState {
    provider?: ethers.BrowserProvider;
    chainId?: string;
    account?: string;
    token?: Token;
}

export interface ExchangeTokenStore {
    state: ExchangeTokenState;
    setProvider: (provider: ethers.BrowserProvider) => void;
    setChainId: (chainId: string) => void;
    setAccount: (chainId: string) => void;
    setToken: (token: Token) => void;
    setTokenA: (tokenA: object) => void;
    setTokenB: (tokenB: object) => void;
    setOpenToken: (openToken: object) => void;
    setSlippageAmount: (slippageAmount: number) => void;
    setDeadlineMinutes: (deadlineMinutes: number) => void;
    setOutputAmount: (outputAmount: number) => void;
    setTransaction: (transaction: any) => void;
    setRatio: (ratio: string) => void;
}

const useExchangeTokenStore = create<ExchangeTokenStore>()(
    devtools((set) => ({
        state: {},
        setProvider: (provider) =>
            set((store) => ({ state: { ...store.state, provider } })),
        setChainId: (chainId) =>
            set((store) => ({ state: { ...store.state, chainId } })),
        setAccount: (account) =>
            set((store) => ({ state: { ...store.state, account } })),
        setToken: (token) =>
            set((store) => ({ state: { ...store.state, token } })),
        setTokenA: (tokenA) =>
            set((store) => ({ state: { ...store.state, tokenA } })),
        setTokenB: (tokenB) =>
            set((store) => ({ state: { ...store.state, tokenB } })),
        setOpenToken: (openToken) =>
            set((store) => ({ state: { ...store.state, openToken } })),
        setSlippageAmount: (slippageAmount) =>
            set((store) => ({ state: { ...store.state, slippageAmount } })),
        setDeadlineMinutes: (deadlineMinutes) =>
            set((store) => ({ state: { ...store.state, deadlineMinutes } })),
        setOutputAmount: (outputAmount) =>
            set((store) => ({ state: { ...store.state, outputAmount } })),
        setTransaction: (transaction) =>
            set((store) => ({ state: { ...store.state, transaction } })),
        setRatio: (ratio) =>
            set((store) => ({ state: { ...store.state, ratio } })),
    }), { enabled: true })
);

export default useExchangeTokenStore;
