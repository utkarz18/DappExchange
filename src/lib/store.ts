import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { AllBalancesProps, AllOrders, ExchangeProps, ExchangeTokenState, Order, OrderBook, TokenProps } from "./model";

export interface ExchangeTokenStore {
    state: ExchangeTokenState;
    setChainId: (chainId: string) => void;
    setAccount: (account: string) => void;
    setAccountBalance: (balance: string) => void;
    setToken1: (token1: TokenProps) => void;
    setToken2: (token2: TokenProps) => void;
    setExchange: (exchange: ExchangeProps) => void;
    setTokenBalances: (balances: AllBalancesProps) => void;
    setAllOrders: (allOrders: AllOrders) => void;
    setOrderBook: (orderBook: OrderBook | null) => void;
    setMarketOpenOrders: (marketOpenOrders: Order[]) => void;
    setMarketFilledOrders: (marketFilledOrders: Order[]) => void;
    setUserOrders: (allUserOrders: AllOrders) => void;
    setDepositSucessMessage: (depositSucessMessage: string) => void;
    setWithdrawSucessMessage: (withdrawSucessMessage: string) => void;
    setTransactionHash: (transactionHash: string | null) => void;
    setIsTransactionPending: (isTransactionPending: boolean) => void;
    setIsTransactionError: (isTransactionError: boolean) => void;
    setIsTransactionSuccessfull: (isTransactionSuccessfull: boolean) => void;
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
        setAllOrders: (allOrders) =>
            set((store) => ({ state: { ...store.state, allOrders } })),
        setOrderBook: (orderBook) =>
            set((store) => ({ state: { ...store.state, orderBook } })),
        setMarketOpenOrders: (marketOpenOrders) =>
            set((store) => ({ state: { ...store.state, marketOpenOrders } })),
        setMarketFilledOrders: (marketFilledOrders) =>
            set((store) => ({ state: { ...store.state, marketFilledOrders } })),
        setUserOrders: (allUserOrders) =>
            set((store) => ({ state: { ...store.state, allUserOrders } })),
        setDepositSucessMessage: (depositSucessMessage) =>
            set((store) => ({ state: { ...store.state, depositSucessMessage } })),
        setWithdrawSucessMessage: (withdrawSucessMessage) =>
            set((store) => ({ state: { ...store.state, withdrawSucessMessage } })),
        setTransactionHash: (transactionHash) =>
            set((store) => ({ state: { ...store.state, transactionHash } })),
        setIsTransactionPending: (isTransactionPending) =>
            set((store) => ({ state: { ...store.state, isTransactionPending } })),
        setIsTransactionError: (isTransactionError) =>
            set((store) => ({ state: { ...store.state, isTransactionError } })),
        setIsTransactionSuccessfull: (isTransactionSuccessfull) =>
            set((store) => ({ state: { ...store.state, isTransactionSuccessfull } })),
    }), { enabled: true })
);

export default useExchangeTokenStore;
