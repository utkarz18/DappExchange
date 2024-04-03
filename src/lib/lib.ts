import { Contract, ethers } from "ethers";
import moment from "moment";
import EXCHAGNE_ABI from '../exchange_abi.json';
import TOKEN_ABI from '../token_abi.json';
import { AllOrders, Order } from "./model";
import { ExchangeTokenStore } from "./store";
import { filterAsync } from "./utils";

let store: ExchangeTokenStore;

export const setStore = (_store: ExchangeTokenStore) => {
    store = _store;
}

export const loadProvider = () => {
    if (window.ethereum == null) {
        alert("MetaMask not installed; using read-only defaults")
        throw Error("Install Wallet");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
}

export const connectWallet = async (provider?: ethers.BrowserProvider) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.getAddress(accounts[0]);
    store.setAccount(account);

    provider = provider || loadProvider();
    const balance = await provider.getBalance(account);
    store.setAccountBalance(Number(ethers.formatEther(balance)).toFixed(4));
}

export const loadNetwork = async (provider: ethers.BrowserProvider) => {
    const { chainId } = await provider.getNetwork();
    store.setChainId(chainId.toString());
    return chainId;
}

export const switchNetwork = async (chainId: string) => {
    await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toBeHex(chainId) }],
    })
    store.setChainId(chainId);
}

const loadToken = async (provider: ethers.BrowserProvider, address: string) => {
    const tokenContract = new Contract(address, TOKEN_ABI, provider);
    return tokenContract;
}

export const loadToken1 = async (provider: ethers.BrowserProvider, address: string) => {
    const tokenContract = await loadToken(provider, address);
    store.setToken1({ loaded: true, contract: tokenContract, symbol: await tokenContract.symbol() });
    return tokenContract;
}

export const loadToken2 = async (provider: ethers.BrowserProvider, address: string) => {
    const tokenContract = await loadToken(provider, address);
    store.setToken2({ loaded: true, contract: tokenContract, symbol: await tokenContract.symbol() });
    return tokenContract;
}

export const loadExchange = async (provider: ethers.BrowserProvider, address: string) => {
    const exchangeContract = new Contract(address, EXCHAGNE_ABI, provider);
    store.setExchange({ loaded: true, contract: exchangeContract });
    return exchangeContract;
}

export const loadBalances = async (
    exchangeContract: Contract,
    token1Contract: Contract,
    token2Contract: Contract,
    account: string
) => {
    const exchangeToken1Balance = ethers.formatUnits(await exchangeContract.balanceOf(await token1Contract.getAddress(), account), 18);
    const exchangeToken2Balance = ethers.formatUnits(await exchangeContract.balanceOf(await token2Contract.getAddress(), account), 18);
    const token1Balance = ethers.formatUnits(await token1Contract.balanceOf(account), 18);
    const token2Balance = ethers.formatUnits(await token2Contract.balanceOf(account), 18);
    store.setTokenBalances({ exchangeToken1Balance, exchangeToken2Balance, token1Balance, token2Balance });
}

export const switchMarket = async (tokenAddresses: string[]) => {
    const provider = loadProvider();
    await loadToken1(provider, tokenAddresses[0]);
    await loadToken2(provider, tokenAddresses[1]);
}

export const depositToExchange = async (
    exchangeContract: any,
    tokenContract: any,
    amount: string) => {
    try {
        const amountToDeposit = ethers.parseUnits(amount, 18);
        const provider = loadProvider();
        const signer = await provider.getSigner();
        let transaction = await tokenContract.connect(signer).approve(await exchangeContract.getAddress(), amountToDeposit);
        await transaction.wait();
        transaction = await exchangeContract.connect(signer).depositToken(await tokenContract.getAddress(), amountToDeposit);
        await transaction.wait();
    } catch (error) {
        console.log(error);
    }
}

export const withdrawFromExchange = async (
    exchangeContract: any,
    tokenContract: any,
    amount: string) => {
    try {
        const amountToDeposit = ethers.parseUnits(amount, 18);
        const provider = loadProvider();
        const signer = await provider.getSigner();
        const transaction = await exchangeContract.connect(signer).withdrawlToken(await tokenContract.getAddress(), amountToDeposit);
        await transaction.wait();
    } catch (error) {
        console.log(error);
    }
}

export const makeOrder = async (
    exchangeContract: any,
    tokenGetContract: any,
    tokenGiveContract: any,
    amount: string,
    price: string,
    isBuy: boolean) => {
    try {
        const amountGet = isBuy ? ethers.parseUnits(amount, 18) : ethers.parseUnits((+amount * +price).toString(), 18);
        const amountGive = isBuy ? ethers.parseUnits((+amount * +price).toString(), 18) : ethers.parseUnits(amount, 18);
        const provider = loadProvider();
        const signer = await provider.getSigner();
        const transaction = await exchangeContract.connect(signer).makeOrder(
            await tokenGetContract.getAddress(), amountGet,
            await tokenGiveContract.getAddress(), amountGive);
        await transaction.wait();
    } catch (error) {
        console.log(error);
    }
}

export const loadAllOrders = async (exchangeContract: any, provider?: ethers.BrowserProvider) => {
    provider = provider || loadProvider();
    const currentBlock = await provider?.getBlockNumber();
    let orderEvents = await exchangeContract.queryFilter('Order', 0, currentBlock);
    let allOrders = orderEvents.map((event: any) => {
        return {
            id: event.args[0].toString(),
            signerAddress: event.args[1],
            tokenGetAddress: event.args[2],
            amountGet: ethers.formatEther(event.args[3]),
            tokenGiveAddress: event.args[4],
            amountGive: ethers.formatEther(event.args[5]),
            timestamp: event.args[6].toString(),
            formattedTimestamp: moment.unix(+(event.args[6].toString())).format('h:mm:ssa ddd MMM D'),
        } as Order
    });

    let filledAndCancelledOrderIds: string[] = [];

    orderEvents = await exchangeContract.queryFilter('Trade', 0, currentBlock);
    const filledOrders = orderEvents.map((event: any) => {
        const filledOrder: Order = allOrders.find((order: Order) => {
            if (order.id == event.args[0].toString()) {
                order.signerAddress = event.args[1];
                order.creator = event.args[6];
                return order;
            }
        });
        filledAndCancelledOrderIds.push(filledOrder.id);
        return filledOrder;
    });

    orderEvents = await exchangeContract.queryFilter('Cancel', 0, currentBlock);
    const cancelledOrders = orderEvents.map((event: any) => {
        const cancelledOrder: Order = allOrders.find((order: Order) => order.id == event.args[0].toString());
        filledAndCancelledOrderIds.push(cancelledOrder.id);
        return cancelledOrder;
    });

    const openOrders = filledAndCancelledOrderIds.length > 0 ?
        allOrders.filter((order: Order) => !filledAndCancelledOrderIds.includes(order.id))
        : allOrders;

    store.setAllOrders({ openOrders, filledOrders, cancelledOrders });
}

export const loadOrderBook = async (
    openOrders: Order[],
    token1Contract: Contract,
    token2Contract: Contract) => {

    const currentMarketOrders = await getCurrentMarkerOrders(openOrders, token1Contract, token2Contract);

    if (currentMarketOrders.length === 0) {
        store.setMarketOpenOrders([]);
        store.setOrderBook(null);
        return;
    }

    let sellOrders = currentMarketOrders.filter((order) => order.type === 'Sell');
    let buyOrders = currentMarketOrders.filter((order) => order.type === 'Buy');

    sellOrders = sellOrders.sort((order1, order2) => order2.price - order1.price);
    buyOrders = buyOrders.sort((order1, order2) => order2.price - order1.price);

    store.setMarketOpenOrders(currentMarketOrders);
    store.setOrderBook({ buyOrders, sellOrders });
}

export const loadMarketFilledOrders = async (
    filledOrders: Order[],
    token1Contract: Contract,
    token2Contract: Contract
) => {

    let currentMarketFilledOrders = await getCurrentMarkerOrders(filledOrders, token1Contract, token2Contract);

    if (currentMarketFilledOrders.length === 0) {
        store.setMarketFilledOrders([]);
        return;
    }

    currentMarketFilledOrders = currentMarketFilledOrders.sort((order1, order2) => +order2.timestamp - +order1.timestamp);
    store.setMarketFilledOrders(currentMarketFilledOrders);
}

export const loadUserOrders = async (
    allMarketOrders: AllOrders,
    account: string
) => {
    const userOpenOrders = allMarketOrders.openOrders?.filter((order) => order.signerAddress === account);
    const userFilledOrders = allMarketOrders.filledOrders?.filter((order) =>
        order.signerAddress === account || order.creator === account);
    store.setUserOrders({
        openOrders: userOpenOrders,
        filledOrders: userFilledOrders
    });
}

const getCurrentMarkerOrders = async (
    orders: Order[],
    token1Contract: Contract,
    token2Contract: Contract
) => {

    const currentMarketOrders = await filterAsync(orders, async (order) => (
        (order.tokenGetAddress === await token1Contract.getAddress() &&
            order.tokenGiveAddress === await token2Contract.getAddress()) ||
        (order.tokenGetAddress === await token2Contract.getAddress() &&
            order.tokenGiveAddress === await token1Contract.getAddress())
    ));

    if (currentMarketOrders.length === 0) {
        return [];
    }

    for (var order of currentMarketOrders) {
        if (order.tokenGetAddress === await token1Contract.getAddress()) {
            order.price = Math.round((+order.amountGive / +order.amountGet) * 100000) / 100000;
            order.type = 'Buy';
        }
        else {
            order.price = Math.round((+order.amountGet / +order.amountGive) * 100000) / 100000;
            order.type = 'Sell';
        }
    }

    return currentMarketOrders;
}

export const cancelOrder = async (exchangeContract: any, orderId: string) => {
    try {
        const provider = loadProvider();
        const signer = await provider.getSigner();
        const transaction = await exchangeContract.connect(signer).cancelOrder(orderId);
        await transaction.wait();
    } catch (error) {
        console.log(error);
    }
}

export const fillOrder = async (exchangeContract: any, orderId: string) => {
    try {
        const provider = loadProvider();
        const signer = await provider.getSigner();
        const transaction = await exchangeContract.connect(signer).fillOrder(orderId);
        await transaction.wait();
    } catch (error) {
        console.log(error);
    }
}

export const subscribeToEvents = async (exchangeContract: Contract, provider: ethers.BrowserProvider) => {
    window.ethereum.on('accountsChanged', async () => {
        await connectWallet(provider)
    })

    window.ethereum.on('chainChanged', () => {
        window.location.reload()
    })

    exchangeContract.on('Deposit', (token, user, amount) => {
        const message = `${user} Deposited ${amount} ${token} to exchange`
        store.setDepositSucessMessage(message);
    })

    exchangeContract.on('Withdraw', (token, user, amount) => {
        const message = `${user} withdraw ${amount} ${token} from exchange`
        store.setWithdrawSucessMessage(message);
    })

    exchangeContract.on('Cancel', async (orderId) => {
        const message = `Order Id : ${orderId}`;
        console.log('Order Cancelled ', message);
        store.setAllOrders({});
        await loadAllOrders(exchangeContract, provider);
    })

    exchangeContract.on('Trade', async (orderId) => {
        const message = `Order Id : ${orderId}`;
        console.log('Order Filled ', message);
        store.setAllOrders({});
        await loadAllOrders(exchangeContract, provider);
    })
}
