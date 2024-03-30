import { useEffect } from 'react';
import Markets from './components/Markets';
import Navbar from './components/Navbar';
import config from './config.json';
import { connectWallet, loadExchange, loadNetwork, loadProvider, loadTokenA, loadTokenB, setStore } from './lib';
import useExchangeTokenStore from './store';


const App = () => {
  const store = useExchangeTokenStore();
  setStore(store);

  const loadBlockChainData = async () => {
    const provider = loadProvider();
    const chainId = await loadNetwork(provider);

    const addressOf = (config as any)[chainId.toString()];
    await loadTokenA(provider, addressOf.MUSDT);
    await loadTokenB(provider, addressOf.METH);

    await loadExchange(provider, addressOf.exchange);

    window.ethereum.on('accountsChanged', async () => {
      await connectWallet(provider)
    })

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })
  }

  useEffect(() => {
    loadBlockChainData();
  }, []);

  return (
    <div>
      <Navbar />
      <main className='exchange grid'>
        <section className='exchange__section--left grid'>
          <Markets />

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