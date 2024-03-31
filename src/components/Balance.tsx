import { useEffect, useRef, useState } from 'react';
import dapp from '../assets/dapp.svg';
import eth from '../assets/eth.svg';
import { depositToExchange, loadBalances, withdrawFromExchange } from '../lib';
import useExchangeTokenStore from '../store';

const Balance = () => {
    const state = useExchangeTokenStore(s => s.state);
    const account = state.account;
    const token1 = state.token1;
    const token2 = state.token2;
    const exchange = state.exchange;
    const token1Balance = state.token1Balance;
    const token2Balance = state.token2Balance;
    const depositSucessMessage = state.depositSucessMessage;
    const withdrawSucessMessage = state.withdrawSucessMessage;

    const token1ref = useRef<HTMLInputElement>(null);
    const token2ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log('loadBalances');
        (async () => {
            if (exchange && token1 && token2 && account) {
                await loadBalances(exchange.contract, token1.contract, token2.contract, account)
            }
        })();
    }, [account, token2, depositSucessMessage, withdrawSucessMessage]);

    const [isDeposit, setIsDeposit] = useState(true);

    return exchange && token1 && token2 && (
        <div className='component exchange__transfers'>
            <div className='component__header flex-between'>
                <h2>Balance</h2>
                <div className='tabs'>
                    <button className={isDeposit ? 'tab tab--active' : 'tab'} onClick={() => setIsDeposit(true)}>Deposit</button>
                    <button className={!isDeposit ? 'tab tab--active' : 'tab'} onClick={() => setIsDeposit(false)}>Withdraw</button>
                </div>
            </div>

            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p><small>Token</small><br /><img src={dapp} alt="Token Logo" />{token1.symbol}</p>
                    <p><small>Wallet</small><br />{token1Balance && token1Balance.balance}</p>
                    <p><small>Exchange</small><br />{token1Balance && token1Balance.exchangeBalance}</p>
                </div>

                <form onSubmit={async (event) => {
                    event.preventDefault();
                    if (token1ref.current) {
                        isDeposit ? await depositToExchange(exchange.contract, token1.contract, token1ref.current.value)
                            : await withdrawFromExchange(exchange.contract, token1.contract, token1ref.current.value);
                        token1ref.current.value = '';
                    }
                }} autoComplete="off">
                    <label htmlFor="token1">{token1.symbol} Amount</label>
                    <input
                        ref={token1ref}
                        type="text"
                        id='token1'
                        placeholder='0.0000'
                    />

                    <button className='button' type='submit'>
                        {isDeposit ? (
                            <span>Deposit</span>
                        ) : (
                            <span>Withdraw</span>
                        )}
                    </button>
                </form>
            </div>

            <hr />

            <div className='exchange__transfers--form'>
                <div className='flex-between'>
                    <p><small>Token</small><br /><img src={eth} alt="Token Logo" />{token2.symbol}</p>
                    <p><small>Wallet</small><br />{token2Balance && token2Balance.balance}</p>
                    <p><small>Exchange</small><br />{token2Balance && token2Balance.exchangeBalance}</p>
                </div>

                <form onSubmit={async (event) => {
                    event.preventDefault();
                    if (token2ref.current) {
                        isDeposit ? await depositToExchange(exchange.contract, token2.contract, token2ref.current.value)
                            : await withdrawFromExchange(exchange.contract, token2.contract, token2ref.current.value);
                        token2ref.current.value = '';
                    }
                }} autoComplete="off">
                    <label htmlFor="token2">{token2.symbol} Amount</label>
                    <input
                        ref={token2ref}
                        type="text"
                        id='token2'
                        placeholder='0.0000'
                    />
                    <button className='button' type='submit'>
                        {isDeposit ? (
                            <span>Deposit</span>
                        ) : (
                            <span>Withdraw</span>
                        )}
                    </button>
                </form>
            </div>

            <hr />
        </div>
    );
}

export default Balance