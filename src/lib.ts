import { Contract, ethers } from "ethers";
import { ExchangeTokenStore } from "./store";
import TOKEN_ABI from './token_abi.json';
import EXCHAGNE_ABI from './exchange_abi.json';

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
    store.setProvider(provider);
    return provider;
}

export const connectWallet = async (provider: ethers.BrowserProvider) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.getAddress(accounts[0]);
    store.setAccount(account);

    const balance = await provider.getBalance(account);
    store.setBalance(ethers.formatEther(balance));

}

export const loadNetwork = async (provider: ethers.BrowserProvider) => {
    const { chainId } = await provider.getNetwork();
    store.setChainId(chainId.toString());
    return chainId;
}

const loadToken = async (provider: ethers.BrowserProvider, address: string) => {
    const tokenContract = new Contract(address, TOKEN_ABI, provider);
    return tokenContract;
}

export const loadTokenA = async (provider: ethers.BrowserProvider, address: string) => {
    const tokenContract = await loadToken(provider, address);
    store.setTokenA({ loaded: true, contract: tokenContract, symbol: await tokenContract.symbol() });
    return tokenContract;
}

export const loadTokenB = async (provider: ethers.BrowserProvider, address: string) => {
    const tokenContract = await loadToken(provider, address);
    store.setTokenB({ loaded: true, contract: tokenContract, symbol: await tokenContract.symbol() });
    return tokenContract;
}

export const loadExchange = async (provider: ethers.BrowserProvider, address: string) => {
    const exchangeContract = new Contract(address, EXCHAGNE_ABI, provider);
    store.setExchange({ loaded: true, contract: exchangeContract });
    return exchangeContract;
}