import { Contract, ethers } from "ethers";
import EXCHAGNE_ABI from './exchange_abi.json';
import { ExchangeTokenStore } from "./store";
import TOKEN_ABI from './token_abi.json';

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
