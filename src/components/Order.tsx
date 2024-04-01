import { useRef, useState } from "react";
import { makeOrder } from "../lib/lib";
import useExchangeTokenStore from "../lib/store";

const Order = () => {
    const state = useExchangeTokenStore(s => s.state);
    const token1 = state.token1;
    const token2 = state.token2;
    const exchange = state.exchange;

    const amountRef = useRef<HTMLInputElement>(null);
    const priceRef = useRef<HTMLInputElement>(null);

    const [isBuy, setIsBuy] = useState(true);

    return exchange && token1 && token2 && (
        <div className="component exchange__orders">
            <div className='component__header flex-between'>
                <h2>New Order</h2>
                <div className='tabs'>
                    <button className={isBuy ? 'tab tab--active' : 'tab'} onClick={() => setIsBuy(true)}>Buy</button>
                    <button className={!isBuy ? 'tab tab--active' : 'tab'} onClick={() => setIsBuy(false)}>Sell</button>
                </div>
            </div>

            <form onSubmit={async (event) => {
                event.preventDefault();
                if (amountRef.current && priceRef.current) {
                    isBuy ? await makeOrder(
                        exchange.contract,
                        token1.contract,
                        token2.contract,
                        amountRef.current.value,
                        priceRef.current.value
                        , isBuy
                    ) : await makeOrder(
                        exchange.contract,
                        token2.contract,
                        token1.contract,
                        amountRef.current.value,
                        priceRef.current.value,
                        isBuy
                    );
                    amountRef.current.value = '';
                    priceRef.current.value = '';
                }
            }}>
                {isBuy ? (
                    <label htmlFor="amount">Buy Amount</label>
                ) : (
                    <label htmlFor="amount">Sell Amount</label>
                )}
                <input
                    ref={amountRef}
                    type="text"
                    id='amount'
                    placeholder='0.0000'

                />

                {isBuy ? (
                    <label htmlFor="price">Buy Price</label>
                ) : (
                    <label htmlFor="price">Sell Price</label>
                )}
                <input
                    ref={priceRef}
                    type="text"
                    id='price'
                    placeholder='0.0000'
                />

                <button className='button button--filled' type='submit'>
                    {isBuy ? (
                        <span>Buy Order</span>
                    ) : (
                        <span>Sell Order</span>
                    )}
                </button>
            </form>
        </div>
    );
}

export default Order