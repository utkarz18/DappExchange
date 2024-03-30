import { Contract } from "ethers";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ExchangeProps {
    loaded: boolean;
    contract: Contract;
}
interface TokenProps extends ExchangeProps {
    symbol: string;
}

interface ExchangeTokenState {
    chainId?: string;
    account?: string;
    balance?: string;
    tokenA?: TokenProps;
    tokenB?: TokenProps;
    exchange?: ExchangeProps;
}

export interface ExchangeTokenStore {
    state: ExchangeTokenState;
    setChainId: (chainId: string) => void;
    setAccount: (account: string) => void;
    setBalance: (balance: string) => void;
    setTokenA: (tokenA: TokenProps) => void;
    setTokenB: (tokenB: TokenProps) => void;
    setExchange: (exchange: ExchangeProps) => void;
    setSlippageAmount: (slippageAmount: number) => void;
    setDeadlineMinutes: (deadlineMinutes: number) => void;
    setOutputAmount: (outputAmount: number) => void;
    setTransaction: (transaction: any) => void;
    setRatio: (ratio: string) => void;
}

const useExchangeTokenStore = create<ExchangeTokenStore>()(
    devtools((set) => ({
        state: {},
        setChainId: (chainId) =>
            set((store) => ({ state: { ...store.state, chainId } })),
        setAccount: (account) =>
            set((store) => ({ state: { ...store.state, account } })),
        setBalance: (balance) =>
            set((store) => ({ state: { ...store.state, balance } })),
        setTokenA: (tokenA) =>
            set((store) => ({ state: { ...store.state, tokenA } })),
        setTokenB: (tokenB) =>
            set((store) => ({ state: { ...store.state, tokenB } })),
        setExchange: (exchange) =>
            set((store) => ({ state: { ...store.state, exchange } })),
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
