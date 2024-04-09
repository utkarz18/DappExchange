import { useEffect } from 'react';
import Balance from './components/Balance';
import Markets from './components/Markets';
import Navbar from './components/Navbar';
import Order from './components/Order';
import Orderbook from './components/Orderbook';
import config from './config.json';
import { loadAllOrders, loadExchange, loadNetwork, loadProvider, loadToken1, loadToken2, setStore, subscribeToEvents } from './lib/lib';
import useExchangeTokenStore from './lib/store';
import PriceChart from './components/PriceChart';
import Trades from './components/Trades';
import Transactions from './components/Transactions';
import Alert from './components/Alert';


const App = () => {
  const store = useExchangeTokenStore();
  setStore(store);

  const loadBlockChainData = async () => {
    const provider = loadProvider();
    const chainId = await loadNetwork(provider);

    const addressOf = (config as any)[chainId.toString()];
    await loadToken1(provider, addressOf.MUSDT);
    await loadToken2(provider, addressOf.METH);

    const exchangeContract = await loadExchange(provider, addressOf.exchange);

    await loadAllOrders(exchangeContract, provider);
    await subscribeToEvents(exchangeContract, provider);
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
          <Balance />
          <Order />
        </section>
        <section className='exchange__section--right grid'>
          <PriceChart />
          <Transactions />
          <Trades />
          <Orderbook />
        </section>
      </main>
      <Alert/>
    </div>
  );
}

export default App;