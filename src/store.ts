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

interface TokenBalanceProps {
    balance: string;
    exchangeBalance: string;
}

interface AllBalancesProps {
    exchangeToken1Balance: string;
    exchangeToken2Balance: string;
    token1Balance: string;
    token2Balance: string;
}

interface ExchangeTokenState {
    chainId?: string;
    account?: string;
    accountBalance?: string;
    token1?: TokenProps;
    token2?: TokenProps;
    exchange?: ExchangeProps;
    token1Balance?: TokenBalanceProps;
    token2Balance?: TokenBalanceProps;
    depositSucessMessage?: string;
    withdrawSucessMessage?: string
}

export interface ExchangeTokenStore {
    state: ExchangeTokenState;
    setChainId: (chainId: string) => void;
    setAccount: (account: string) => void;
    setAccountBalance: (balance: string) => void;
    setToken1: (token1: TokenProps) => void;
    setToken2: (token2: TokenProps) => void;
    setExchange: (exchange: ExchangeProps) => void;
    setTokenBalances: (balances: AllBalancesProps) => void;
    setDepositSucessMessage: (depositSucessMessage: string) => void;
    setWithdrawSucessMessage: (withdrawSucessMessage: string) => void;
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
        setAccountBalance: (balance) =>
            set((store) => ({ state: { ...store.state, accountBalance: balance } })),
        setToken1: (token1) =>
            set((store) => ({ state: { ...store.state, token1 } })),
        setToken2: (token2) =>
            set((store) => ({ state: { ...store.state, token2 } })),
        setExchange: (exchange) =>
            set((store) => ({ state: { ...store.state, exchange } })),
        setTokenBalances: (balances) =>
            set((store) => ({
                state: {
                    ...store.state,
                    token1Balance: {
                        balance: balances.token1Balance,
                        exchangeBalance: balances.exchangeToken1Balance
                    },
                    token2Balance: {
                        balance: balances.token2Balance,
                        exchangeBalance: balances.exchangeToken2Balance
                    }
                }
            })),
        setDepositSucessMessage: (depositSucessMessage) =>
            set((store) => ({ state: { ...store.state, depositSucessMessage } })),
        setWithdrawSucessMessage: (withdrawSucessMessage) =>
            set((store) => ({ state: { ...store.state, withdrawSucessMessage } })),
        setTransaction: (transaction) =>
            set((store) => ({ state: { ...store.state, transaction } })),
        setRatio: (ratio) =>
            set((store) => ({ state: { ...store.state, ratio } })),
    }), { enabled: true })
);

export default useExchangeTokenStore;
