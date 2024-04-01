import { useEffect } from 'react';
import Balance from './components/Balance';
import Markets from './components/Markets';
import Navbar from './components/Navbar';
import Order from './components/Order';
import Orderbook from './components/Orderbook';
import config from './config.json';
import { connectWallet, loadAllOrders, loadExchange, loadNetwork, loadProvider, loadToken1, loadToken2, setStore } from './lib/lib';
import useExchangeTokenStore from './lib/store';


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

    exchangeContract.on('Trade', (orderId) => {
      const message = `Order Id : ${orderId}`
      console.log(message);
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
          <Balance />
          <Order />

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          <Orderbook />

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;