import { Contract } from "ethers";

export interface ExchangeProps {
    loaded: boolean;
    contract: Contract;
}

export interface TokenProps extends ExchangeProps {
    symbol: string;
}

interface TokenBalanceProps {
    balance: string;
    exchangeBalance: string;
}

export interface AllBalancesProps {
    exchangeToken1Balance: string;
    exchangeToken2Balance: string;
    token1Balance: string;
    token2Balance: string;
}

export interface Order {
    id: string;
    signerAddress: string;
    tokenGetAddress: string;
    amountGet: string;
    tokenGiveAddress: string;
    amountGive: string;
    price: number;
    type: 'Buy' | 'Sell';
    timestamp: string;
    creator: string;
    formattedTimestamp: string;
}

export interface AllOrders {
    openOrders?: Order[] | null;
    filledOrders?: Order[] | null;
    cancelledOrders?: Order[] | null;
}

export interface OrderBook {
    buyOrders?: Order[];
    sellOrders?: Order[];
}

export interface ExchangeTokenState {
    chainId?: string;
    account?: string;
    accountBalance?: string;
    token1?: TokenProps;
    token2?: TokenProps;
    exchange?: ExchangeProps;
    token1Balance?: TokenBalanceProps;
    token2Balance?: TokenBalanceProps;
    depositSucessMessage?: string;
    withdrawSucessMessage?: string;
    allOrders?: AllOrders;
    orderBook?: OrderBook | null;
    marketOpenOrders?: Order[];
    marketFilledOrders?: Order[];
    allUserOrders?: AllOrders;
}