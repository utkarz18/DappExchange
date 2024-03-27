import { useEffect } from 'react'
import { Contract, ethers } from 'ethers';
import './App.css'
import config from './config.json'
import TOKEN_ABI from './token_abi.json'


const App = () => {

  const loadBlockChainData = async () => {
    if (window.ethereum == null) {
      alert("MetaMask not installed; using read-only defaults")
      return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    console.log(accounts[0]);

    const provider = new ethers.BrowserProvider(window.ethereum)
    const { chainId } = await provider.getNetwork();
    console.log(chainId);

    const addressOf = (config as any)[chainId.toString()];
    const MUSDT = new Contract(addressOf.MUSDT, TOKEN_ABI, provider);
    console.log(`Token fetched:\nSymbol: ${await MUSDT.symbol()} \nAddress: ${await MUSDT.getAddress()}`)
  }
  useEffect(() => {
    loadBlockChainData();
  })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;