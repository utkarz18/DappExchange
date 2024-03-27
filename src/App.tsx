import { useEffect } from 'react';
import config from './config.json';
import { connectWallet, loadNetwork, loadProvider, loadToken, setStore } from './lib';
import useExchangeTokenStore from './store';


const App = () => {
  const store = useExchangeTokenStore();
  setStore(store);

  const loadBlockChainData = async () => {
    await connectWallet();
    const provider = loadProvider();
    const chainId = await loadNetwork(provider);

    const addressOf = (config as any)[chainId.toString()];
    await loadToken(provider, addressOf.MUSDT);
  }

  useEffect(() => {
    loadBlockChainData();
  },[])

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