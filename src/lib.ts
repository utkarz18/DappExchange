import { Contract, ethers } from "ethers";
import { ExchangeTokenStore } from "./store";
import TOKEN_ABI from './token_abi.json';

let store: ExchangeTokenStore;

export const setStore = (_store: ExchangeTokenStore) => {
    store = _store;
}

export const connectWallet = async () => {
    if (window.ethereum == null) {
        alert("MetaMask not installed; using read-only defaults")
        return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.getAddress(accounts[0]);
    store.setAccount(account);
    return account;
}

export const loadProvider = () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    store.setProvider(provider);
    return provider;
}

export const loadNetwork = async (provider: ethers.BrowserProvider) => {
    const { chainId } = await provider.getNetwork();
    store.setChainId(chainId.toString());
    return chainId;
}

export const loadToken = async (provider: ethers.BrowserProvider, address: string) => {
    const tokenContract = new Contract(address, TOKEN_ABI, provider);
    store.setToken({ loaded: true, contract: tokenContract, symbol: await tokenContract.symbol() });
    return tokenContract;
}